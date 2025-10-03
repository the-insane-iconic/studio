
"use client";

import AppLayout from '@/components/app-layout';
import DashboardView from '@/components/dashboard-view';

export default function Home() {
  return (
    <AppLayout>
      <DashboardView setActiveView={() => {}}/>
    </AppLayout>
  );
}
