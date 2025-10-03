
"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import AppLayout from '@/components/app-layout';

function CreateEventForm() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const newEventData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            date: formData.get('date') as string,
            category: formData.get('category') as Event['category'],
            participantCount: 0,
        };
        
        if (!newEventData.title || !newEventData.date || !newEventData.category) {
            toast({
                title: 'Error',
                description: 'Please fill out all required fields.',
                variant: 'destructive'
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const eventsCollection = collection(firestore, 'events');
            await addDoc(eventsCollection, newEventData);
            
            toast({
                title: 'Success!',
                description: `Event "${newEventData.title}" has been created.`,
            });
            router.push('/events');
        } catch (error: any) {
             toast({
                title: 'Error creating event',
                description: error.message,
                variant: 'destructive'
            });
            setIsSubmitting(false);
        }
    };
    
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Create a New Event</CardTitle>
                <CardDescription>Fill in the details for your new event. Once created, you can manage participants and issue certificates.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input id="title" name="title" placeholder="e.g., 'Web3 & Blockchain Summit 2024'" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="A brief summary of what the event is about." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" name="date" type="date" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tech">Tech</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                    <SelectItem value="Art">Art</SelectItem>
                                    <SelectItem value="Education">Education</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-4">
                        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default function NewEventPage() {
    return (
        <AppLayout>
            <CreateEventForm />
        </AppLayout>
    )
}
