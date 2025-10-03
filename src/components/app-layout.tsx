"use client";

import React, { useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Calendar, LayoutDashboard, LogOut, Settings, Users2 } from 'lucide-react';

import DashboardView from './dashboard-view';
import EventsView from './events-view';
import ParticipantsView from './participants-view';

type View = 'dashboard' | 'events' | 'participants';

export default function AppLayout() {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'events':
        return <EventsView />;
      case 'participants':
        return <ParticipantsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 text-primary hover:bg-primary/10">
              <Award className="size-5" />
            </Button>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold tracking-tight">EventChain Pro</h2>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('dashboard')}
                isActive={activeView === 'dashboard'}
                tooltip="Dashboard"
              >
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('events')}
                isActive={activeView === 'events'}
                tooltip="Events"
              >
                <Calendar />
                Event Management
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveView('participants')}
                isActive={activeView === 'participants'}
                tooltip="Participants"
              >
                <Users2 />
                Participants &amp; Status
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://picsum.photos/seed/avatar/40/40" alt="Admin" />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Admin User</span>
                        <span className="text-xs text-muted-foreground">admin@eventchain.pro</span>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-auto">
                        <LogOut className="size-4"/>
                    </Button>
                </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="text-lg font-semibold md:text-xl capitalize">{activeView.replace('-', ' ')}</h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderView()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
