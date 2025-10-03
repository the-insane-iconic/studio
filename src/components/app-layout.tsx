
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
import { Award, Calendar, LayoutDashboard, LogOut, Settings, Users2, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import DashboardView from './dashboard-view';
import EventsView from './events-view';
import ParticipantsView from './participants-view';
import CertificatesView from './certificates-view';

type View = 'dashboard' | 'events' | 'participants' | 'certificates' | 'new-event';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  let activeView: View = 'dashboard';
  if (pathname === '/events') activeView = 'events';
  else if (pathname.startsWith('/events/new')) activeView = 'new-event';
  else if (pathname === '/participants') activeView = 'participants';
  else if (pathname === '/certificates') activeView = 'certificates';


  const getTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'events': return 'Event Management';
      case 'new-event': return 'Create New Event';
      case 'participants': return 'Participants & Status';
      case 'certificates': return 'Certificates';
      default: return 'Dashboard';
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 text-primary hover:bg-primary/10" asChild>
              <Link href="/">
                <Award className="size-5" />
              </Link>
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
                asChild
                isActive={activeView === 'dashboard'}
                tooltip="Dashboard"
              >
                <Link href="/">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeView === 'events' || activeView === 'new-event'}
                tooltip="Events"
              >
                <Link href="/events">
                  <Calendar />
                  Event Management
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeView === 'participants'}
                tooltip="Participants"
              >
                <Link href="/participants">
                  <Users2 />
                  Participants &amp; Status
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeView === 'certificates'}
                tooltip="Certificates"
              >
                <Link href="/certificates">
                  <BadgeCheck />
                  Certificates
                </Link>
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
            <h1 className="text-lg font-semibold md:text-xl capitalize">{getTitle()}</h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
