
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Loader2 } from 'lucide-react';
import type { Event } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

const categoryColors: {[key: string]: string} = {
  Tech: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300',
  Business: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300',
  Art: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 border-pink-300',
  Education: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300',
};


export default function EventsView() {
    const firestore = useFirestore();
    const eventsQuery = useMemoFirebase(() => collection(firestore, 'events'), [firestore]);
    const { data: events, isLoading } = useCollection<Event>(eventsQuery);

    return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Events</h2>
             <Button asChild>
                <Link href="/events/new">
                    <Plus className="mr-2 h-4 w-4" /> Create Event
                </Link>
            </Button>
        </div>
        {isLoading && <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>}
        
        {!isLoading && (!events || events.length === 0) && (
            <Card className="flex flex-col items-center justify-center py-12">
                 <CardHeader>
                    <CardTitle>No Events Found</CardTitle>
                    <CardDescription>Get started by creating your first event.</CardDescription>
                </CardHeader>
                 <CardContent>
                     <Button asChild>
                        <Link href="/events/new">
                            <Plus className="mr-2 h-4 w-4" /> Create Event
                        </Link>
                    </Button>
                 </CardContent>
            </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events?.map(event => (
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
