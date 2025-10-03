
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users2, CheckCircle, AlertTriangle, Loader2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import type { Participant, Event } from '@/lib/types';
import { mockParticipants, mockEvents } from '@/lib/data'; // Keep for seeding

const statusColors: {[key: string]: string} = {
  'Sent': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300',
  'Not Sent': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300',
  'Failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300',
};

export default function ParticipantsView() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const participantsQuery = useMemoFirebase(() => collection(firestore, 'participants'), [firestore]);
    const { data: participants, isLoading: isLoadingParticipants } = useCollection<Participant>(participantsQuery);

    const eventsQuery = useMemoFirebase(() => collection(firestore, 'events'), [firestore]);
    const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

    const eventsMap = useMemo(() => {
        if (!events) return new Map<string, string>();
        return new Map(events.map(e => [e.id, e.title]));
    }, [events]);

    const stats = useMemo(() => {
        if (!participants) return { total: 0, delivered: 0, failures: 0 };
        const total = participants.length;
        const delivered = participants.filter(p => p.certificateStatus === 'Sent').length;
        const failures = participants.filter(p => p.certificateStatus === 'Failed').length;
        return { total, delivered, failures };
    }, [participants]);

    const handleAddDemoData = async () => {
        if (!firestore) {
            toast({
                title: "Firestore not available",
                description: "Please wait for Firebase to initialize.",
                variant: "destructive",
            });
            return;
        }
        const batch = writeBatch(firestore);

        mockEvents.forEach(event => {
            const eventRef = doc(firestore, "events", event.id);
            batch.set(eventRef, event);
        });

        mockParticipants.forEach(participant => {
            // Use doc(collection(...)) to get a ref with an auto-generated ID
            const participantRef = doc(collection(firestore, "participants"));
            batch.set(participantRef, participant);
        });

        try {
            await batch.commit();
            toast({
                title: "Demo Data Added",
                description: "Mock events and participants have been added to Firestore.",
            });
        } catch (error: any) {
            toast({
                title: "Error Adding Data",
                description: error.message,
                variant: "destructive",
            });
        }
    }

    const isLoading = isLoadingParticipants || isLoadingEvents;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Participants & Status</h2>
            
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                        <Users2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{stats.total}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Certificates Delivered</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{stats.delivered}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivery Failures</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{stats.failures}</div>}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Registration List</CardTitle>
                        <CardDescription>This is a live view of all event participants.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleAddDemoData}>
                        <Plus className="mr-2 h-4 w-4"/>
                        Add Mock Data
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead className="text-right">Certificate Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary"/>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!isLoading && (!participants || participants.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No participants found. Add some mock data to get started.
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
                                        <TableCell>{eventsMap.get(participant.eventId) || 'Unknown Event'}</TableCell>
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
        </div>
    );
}
