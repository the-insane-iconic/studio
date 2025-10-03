
"use client";

import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, orderBy, query } from 'firebase/firestore';
import type { Event, Participant, Certificate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Calendar, Award, Loader2 } from 'lucide-react';
import Link from 'next/link';

const categoryColors: {[key: string]: string} = {
  Tech: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300',
  Business: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300',
  Art: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 border-pink-300',
  Education: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300',
};


export default function DashboardView({ setActiveView }: { setActiveView: (view: any) => void }) {
  const firestore = useFirestore();

  const eventsQuery = useMemoFirebase(() => collection(firestore, 'events'), [firestore]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const participantsQuery = useMemoFirebase(() => collection(firestore, 'participants'), [firestore]);
  const { data: participants, isLoading: isLoadingParticipants } = useCollection<Participant>(participantsQuery);
  
  const certificatesQuery = useMemoFirebase(() => collection(firestore, 'certificates'), [firestore]);
  const { data: certificates, isLoading: isLoadingCertificates } = useCollection<Certificate>(certificatesQuery);

  const recentEventsQuery = useMemoFirebase(() => query(collection(firestore, 'events'), orderBy('date', 'desc'), limit(3)), [firestore]);
  const { data: recentEvents, isLoading: isLoadingRecentEvents } = useCollection<Event>(recentEventsQuery);

  const isLoading = isLoadingEvents || isLoadingParticipants || isLoadingCertificates || isLoadingRecentEvents;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <Button asChild>
                <Link href="/certificates">
                    Generate Certificates <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingEvents ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{events?.length ?? 0}</div>}
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingParticipants ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{participants?.length ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoadingCertificates ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{certificates?.length ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Total certificates generated</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>A quick look at the latest events.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoadingRecentEvents && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>}
                    {recentEvents?.map(event => (
                        <div key={event.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                            <div>
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(event.date).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={categoryColors[event.category]}>{event.category}</Badge>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/event/${event.id}`}>Manage</Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                    {!isLoadingRecentEvents && recentEvents?.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No events found.</p>
                    )}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Live updates from the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>}
                    
                    {!isLoading && certificates && certificates.length > 0 && (
                        <div key={certificates[0].id} className="flex items-start gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Award className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">New Certificate Issued</p>
                                <p className="text-xs text-muted-foreground">For event: {events?.find(e => e.id === certificates[0].eventId)?.title || 'Unknown'}</p>
                            </div>
                        </div>
                    )}
                    
                    {!isLoading && participants && participants.length > 0 && (
                         <div className="flex items-start gap-3">
                            <div className="bg-accent/10 p-2 rounded-full">
                                <Users className="h-4 w-4 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">New Participant</p>
                                <p className="text-xs text-muted-foreground">{participants[participants.length -1].name} registered for an event.</p>
                            </div>
                        </div>
                    )}
                    
                     {!isLoading && events && events.length > 0 && (
                         <div className="flex items-start gap-3">
                            <div className="bg-green-500/10 p-2 rounded-full">
                                <Calendar className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">New Event Created</p>
                                <p className="text-xs text-muted-foreground">"{events[events.length -1].title}" is now live.</p>
                            </div>
                        </div>
                    )}

                    {!isLoading && (!certificates || certificates.length === 0) && (!participants || participants.length === 0) && (!events || events.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
