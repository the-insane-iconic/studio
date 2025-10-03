
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockParticipants, mockEvents } from '@/lib/data';
import { Users2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

const statusColors: {[key: string]: string} = {
  'Sent': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300',
  'Not Sent': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300',
  'Failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300',
};

export default function ParticipantsView() {
    const { toast } = useToast();

    const stats = useMemo(() => {
        const total = mockParticipants.length;
        const delivered = mockParticipants.filter(p => p.certificateStatus === 'Sent').length;
        const failures = mockParticipants.filter(p => p.certificateStatus === 'Failed').length;
        return { total, delivered, failures };
    }, []);

    const handleAddDemo = () => {
        toast({
            title: "Demo Action",
            description: "This would add more demo participants.",
        });
    }

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
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Certificates Delivered</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.delivered}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivery Failures</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.failures}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Registration List</CardTitle>
                    </div>
                    <Button variant="outline" onClick={handleAddDemo}>Add Demo Participants</Button>
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
                                {mockParticipants.map(participant => {
                                    const event = mockEvents.find(e => e.id === participant.eventId);
                                    return (
                                        <TableRow key={participant.id}>
                                            <TableCell>
                                                <div className="font-medium">{participant.name}</div>
                                                <div className="text-sm text-muted-foreground md:hidden">{participant.email}</div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{participant.email}</TableCell>
                                            <TableCell>{event?.title || 'Unknown Event'}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className={statusColors[participant.certificateStatus]}>
                                                    {participant.certificateStatus}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
