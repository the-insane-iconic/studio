
"use client"

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, runTransaction, addDoc, query, where } from 'firebase/firestore';
import type { Event, Participant } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Users, ArrowLeft, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const statusColors: {[key: string]: string} = {
  'Sent': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300',
  'Not Sent': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300',
  'Failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300',
};

function AddParticipantDialog({ eventId }: { eventId: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
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

        if (!participantData.name || !participantData.email || !participantData.phone) {
            toast({
                title: 'Error',
                description: 'Please fill out name, email, and phone.',
                variant: 'destructive',
            });
            setIsSubmitting(false);
            return;
        }

        const eventRef = doc(firestore, 'events', eventId);
        
        try {
            await runTransaction(firestore, async (transaction) => {
                const participantsCollection = collection(firestore, 'participants');
                const newParticipantRef = doc(participantsCollection);
                
                transaction.set(newParticipantRef, participantData);

                const eventDoc = await transaction.get(eventRef);
                if (!eventDoc.exists()) {
                    throw new Error("Event does not exist!");
                }
                const newCount = (eventDoc.data().participantCount || 0) + 1;
                transaction.update(eventRef, { participantCount: newCount });
            });
            
            toast({
                title: 'Participant Added!',
                description: `${participantData.name} has been registered for the event.`,
            });
            (e.target as HTMLFormElement).reset();
            setOpen(false);

        } catch (error) {
             console.error('Registration failed:', error);
             toast({
                title: 'Registration Failed',
                description: 'The new participant could not be added. Please try again.',
                variant: 'destructive',
            });
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                  path: eventRef.path,
                  operation: 'update',
                  requestResourceData: { participantCount: 'increment' },
                })
              );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Participant
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Participant</DialogTitle>
                    <DialogDescription>Fill in the details for the new participant.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" className="col-span-3" required />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" name="email" type="email" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Phone</Label>
                        <Input id="phone" name="phone" type="tel" className="col-span-3" required />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="organization" className="text-right">Organization</Label>
                        <Input id="organization" name="organization" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="jobTitle" className="text-right">Job Title</Label>
                        <Input id="jobTitle" name="jobTitle" className="col-span-3" />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Participant
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export default function EventPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;
    const firestore = useFirestore();

    const eventRef = useMemoFirebase(() => eventId ? doc(firestore, 'events', eventId) : null, [firestore, eventId]);
    const { data: event, isLoading: isLoadingEvent, error: eventError } = useDoc<Event>(eventRef);

    const participantsQuery = useMemoFirebase(
        () => eventId ? query(collection(firestore, 'participants'), where('eventId', '==', eventId)) : null,
        [firestore, eventId]
    );
    const { data: participants, isLoading: isLoadingParticipants, error: participantsError } = useCollection<Participant>(participantsQuery);


    if (isLoadingEvent) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (eventError || !event) {
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
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Event Participants</CardTitle>
                            <CardDescription>
                                A live list of everyone registered for "{event.title}".
                            </CardDescription>
                        </div>
                        <AddParticipantDialog eventId={eventId}/>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="hidden md:table-cell">Email</TableHead>
                                        <TableHead className="hidden lg:table-cell">Organization</TableHead>
                                        <TableHead className="text-right">Certificate Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingParticipants && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary"/>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!isLoadingParticipants && (!participants || participants.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No participants found for this event yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {participants?.map(participant => (
                                        <TableRow key={participant.id}>
                                            <TableCell>
                                                <div className="font-medium">{participant.name}</div>
                                                <div className="text-sm text-muted-foreground md:hidden">{participant.email}</div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{participant.email}</TableCell>
                                            <TableCell className="hidden lg:table-cell">{participant.organization || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className={statusColors[participant.certificateStatus]}>
                                                    {participant.certificateStatus}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

    