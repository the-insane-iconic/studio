
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users } from 'lucide-react';
import { mockEvents } from '@/lib/data';
import type { Event } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const categoryColors: {[key: string]: string} = {
  Tech: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300',
  Business: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300',
  Art: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 border-pink-300',
  Education: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300',
};

function CreateEventForm({ onEventCreated }: { onEventCreated: (newEvent: Event) => void }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newEvent: Event = {
            id: `evt${Date.now()}`,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            date: formData.get('date') as string,
            category: formData.get('category') as Event['category'],
            participantCount: 0,
        };
        
        if (!newEvent.title || !newEvent.date || !newEvent.category) {
            toast({
                title: 'Error',
                description: 'Please fill out all required fields.',
                variant: 'destructive'
            });
            return;
        }

        onEventCreated(newEvent);
        toast({
            title: 'Success!',
            description: `Event "${newEvent.title}" has been created.`,
        });
        setOpen(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>Fill in the details for your new event.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" name="title" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea id="description" name="description" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Date</Label>
                        <Input id="date" name="date" type="date" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Select name="category" required>
                            <SelectTrigger className="col-span-3">
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
                    <DialogFooter>
                        <Button type="submit">Create Event</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export default function EventsView() {
    const [events, setEvents] = useState<Event[]>(mockEvents);
    
    const addEvent = (newEvent: Event) => {
        setEvents(prev => [newEvent, ...prev]);
    };

    return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Events</h2>
            <CreateEventForm onEventCreated={addEvent} />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map(event => (
                <Card key={event.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <CardTitle className="mb-2 pr-2">{event.title}</CardTitle>
                             <Badge variant="outline" className={categoryColors[event.category]}>{event.category}</Badge>
                        </div>
                        <CardDescription>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <div className="flex items-center text-sm font-medium">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground"/>
                            {event.participantCount} Participants
                        </div>
                        <Button variant="secondary" size="sm">Manage</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
