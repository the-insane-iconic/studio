
"use client";

import { useState } from 'react';
import AppLayout from '@/components/app-layout';
import CertificatesView from '@/components/certificates-view';
import ParticipantsView from '@/components/participants-view';
import EventsView from '@/components/events-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Users, Calendar } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState("workflow");

  return (
    <AppLayout>
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">EventChain Certificate Automation Hub</h1>
        </div>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Securely generate, customize, and verify certificates with Web3 technology.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="workflow">
            <Award className="mr-2 h-4 w-4" />
            Certification Workflow
          </TabsTrigger>
          <TabsTrigger value="participants">
            <Users className="mr-2 h-4 w-4" />
            Participants & Status
          </TabsTrigger>
          <TabsTrigger value="management">
            <Calendar className="mr-2 h-4 w-4" />
            Event Management
          </TabsTrigger>
        </TabsList>
        <Card className="mt-6">
          <CardContent className="p-6">
            <TabsContent value="workflow">
              <CertificatesView />
            </TabsContent>
            <TabsContent value="participants">
              <ParticipantsView />
            </TabsContent>
            <TabsContent value="management">
              <EventsView />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </AppLayout>
  );
}
