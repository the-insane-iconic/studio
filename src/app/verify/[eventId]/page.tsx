
"use client";

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import type { Participant, Certificate, Event } from '@/lib/types';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Award, Download, AlertCircle } from 'lucide-react';
import CertificatePreview from '@/components/certificate-preview';

export default function VerifyCertificatePage() {
    const params = useParams();
    const eventId = params.eventId as string;
    const firestore = useFirestore();
    const { toast } = useToast();

    const [registrationNumber, setRegistrationNumber] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [foundCertificate, setFoundCertificate] = useState<Certificate | null>(null);
    const [noResult, setNoResult] = useState(false);

    const eventRef = useMemoFirebase(() => eventId ? doc(firestore, 'events', eventId) : null, [firestore, eventId]);
    const { data: event } = useDoc<Event>(eventRef);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!registrationNumber) {
            toast({ title: "Registration number required", description: "Please enter your registration number.", variant: "destructive" });
            return;
        }

        setIsSearching(true);
        setFoundCertificate(null);
        setNoResult(false);

        try {
            // 1. Find the participant by registrationNumber (which is the document ID)
            const participantRef = doc(firestore, 'participants', registrationNumber);
            const participantSnapshot = await getDoc(participantRef);

            if (!participantSnapshot.exists() || participantSnapshot.data().eventId !== eventId) {
                setNoResult(true);
                setIsSearching(false);
                return;
            }

            const participant = participantSnapshot.data() as Participant;
            const participantId = participantSnapshot.id;

            // 2. Find the certificate using the participant's ID
            const certificatesRef = collection(firestore, 'certificates');
            const cq = query(certificatesRef, where('userId', '==', participantId), where('eventId', '==', eventId), limit(1));
            const certificateSnapshot = await getDocs(cq);

            if (certificateSnapshot.empty) {
                setNoResult(true);
            } else {
                const cert = certificateSnapshot.docs[0].data() as Certificate;
                setFoundCertificate({ ...cert, id: certificateSnapshot.docs[0].id });
            }

        } catch (error: any) {
            toast({
                title: "Error Searching",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive"
            });
            setNoResult(true);
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleDownload = () => {
        if (foundCertificate?.designDataUrl) {
            const link = document.createElement('a');
            link.href = foundCertificate.designDataUrl;
            link.download = `certificate-${event?.title.replace(/ /g, '_')}-${foundCertificate.participantName.replace(/ /g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
             toast({ title: "Download Started", description: "Your certificate image is downloading." });
        } else {
            toast({ title: "Download Not Available", description: "No certificate image found to download.", variant: "destructive"});
        }
    }

    return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                        <Award className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-center text-2xl">Certificate Verification</CardTitle>
                    <CardDescription className="text-center">
                        For event: <span className="font-semibold">{event ? event.title : <Loader2 className="h-4 w-4 inline animate-spin" />}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!foundCertificate ? (
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="registrationNumber">Your Registration Number</Label>
                                <Input 
                                    id="registrationNumber" 
                                    type="text" 
                                    placeholder="Enter the ID you were provided" 
                                    value={registrationNumber}
                                    onChange={(e) => setRegistrationNumber(e.target.value)}
                                    required 
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSearching}>
                                {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                Find My Certificate
                            </Button>
                        </form>
                    ) : null}

                    {noResult && (
                         <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                            <AlertCircle className="mx-auto h-12 w-12 text-destructive"/>
                            <h3 className="mt-4 text-lg font-semibold">No Certificate Found</h3>
                            <p className="mt-2 text-sm">We couldn't find a certificate for this event with that registration number. Please check for typos or contact the event organizer.</p>
                            <Button variant="link" onClick={() => { setNoResult(false); setRegistrationNumber('')}}>Try Again</Button>
                        </div>
                    )}
                    
                    {foundCertificate && (
                        <div className="space-y-6 animate-in fade-in-50">
                            <div className="text-center">
                                 <h3 className="text-xl font-bold text-green-600">Certificate Found!</h3>
                                 <p className="text-muted-foreground">This certificate was issued to <span className="font-semibold">{foundCertificate.participantName}</span>.</p>
                            </div>
                            
                            <CertificatePreview 
                                templateId={foundCertificate.templateId as any} 
                                fields={['name', 'eventName', 'date']} // simplified for preview
                                aiDesignUrl={foundCertificate.designDataUrl}
                            />
                            
                            <Button onClick={handleDownload} className="w-full" disabled={!foundCertificate.designDataUrl}>
                                <Download className="mr-2 h-4 w-4"/>
                                Download Certificate Image
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => { setFoundCertificate(null); setRegistrationNumber('')}}>
                                Verify another certificate
                            </Button>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
