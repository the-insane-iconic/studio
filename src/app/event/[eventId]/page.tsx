
"use client"

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc, collection, addDoc, runTransaction } from 'firebase/firestore';
import type { Event, Participant } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function RegistrationForm({ eventId, onSuccessfulRegistration }: { eventId: string, onSuccessfulRegistration: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const participantData: Omit<Participant, 'id'> = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            organization: formData.get('organization') as string || '',
            jobTitle: formData.get('jobTitle') as string || '',
            eventId,
            certificateStatus: 'Not Sent',
        };

        if (!participantData.name || !participantData.email) {
            toast({
                title: 'Error',
                description: 'Please fill out all required fields.',
                variant: 'destructive',
            });
            setIsSubmitting(false);
            return;
        }

        try {
            await runTransaction(firestore, async (transaction) => {
                // 1. Add participant to the 'participants' collection
                const participantsCollection = collection(firestore, 'participants');
                addDoc(participantsCollection, participantData);
    
                // 2. Increment the participantCount on the event
                const eventRef = doc(firestore, 'events', eventId);
                const eventDoc = await transaction.get(eventRef);
                if (!eventDoc.exists()) {
                    throw new Error("Event does not exist!");
                }
                const newCount = (eventDoc.data().participantCount || 0) + 1;
                transaction.update(eventRef, { participantCount: newCount });
            });

            toast({
                title: 'Registration Successful!',
                description: `You are now registered for the event.`,
            });
            onSuccessfulRegistration();
            (e.target as HTMLFormElement).reset();

        } catch (error: any) {
            console.error('Registration failed:', error);
            toast({
                title: 'Registration Failed',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Register for this Event</CardTitle>
                <CardDescription>Fill in your details to secure your spot.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" name="email" type="email" required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" type="tel" required/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="organization">Organization (Optional)</Label>
                            <Input id="organization" name="organization" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="jobTitle">Job Title (Optional)</Label>
                            <Input id="jobTitle" name="jobTitle" />
                        </div>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSubmitting ? 'Registering...' : 'Register Now'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}


export default function EventPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;
    const firestore = useFirestore();
    const { toast } = useToast();
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const eventRef = doc(firestore, 'events', eventId);
    const { data: event, isLoading, error } = useDoc<Event>(eventRef);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error || !event) {
         return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
                <CardTitle>Event Not Found</CardTitle>
                <CardDescription>The event you are looking for does not exist or could not be loaded.</CardDescription>
                <Button asChild variant="outline">
                    <Link href="/events"><ArrowLeft className="mr-2 h-4 w-4"/>Back to All Events</Link>
                </Button>
            </div>
        );
    }

    const handleSuccess = () => {
        setRegistrationSuccess(true);
    };

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-primary/10 py-6">
                <div className="container mx-auto px-4 md:px-6">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back to Events
                    </Button>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">{event.title}</h1>
                    <div className="flex items-center gap-6 mt-2 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{event.participantCount} Participants Registered</span>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto px-4 md:px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">About the Event</h2>
                        <p className="text-muted-foreground">{event.description}</p>
                    </div>
                    <div>
                        {registrationSuccess ? (
                            <Card className="flex flex-col items-center justify-center text-center p-8 bg-green-50 dark:bg-green-900/20 border-green-500">
                                <CardHeader>
                                    <CardTitle className="text-green-700 dark:text-green-300">Registration Confirmed!</CardTitle>
                                    <CardDescription>Thank you for registering. You'll receive your certificate after the event concludes.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={() => setRegistrationSuccess(false)}>Register Another Person</Button>
                                </CardContent>
                            </Card>
                        ) : (
                           <RegistrationForm eventId={eventId} onSuccessfulRegistration={handleSuccess} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
