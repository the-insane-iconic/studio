
"use client";

import Link from 'next/link';
import { Award, Calendar, Users, Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/participants", label: "Participants", icon: Users },
    { href: "/certificates", label: "Certificates", icon: Award },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center max-w-7xl mx-auto px-4">
        <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
                 <Award className="h-6 w-6 text-primary-foreground" />
            </div>
          <span className="font-bold inline-block">EventChain<br/><span className="text-xs font-normal text-muted-foreground -mt-2 block">CERTIFICATE HUB</span></span>
        </Link>
        
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-2 transition-colors hover:text-foreground",
                pathname.startsWith(href) ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button onClick={() => router.push('/events/new')}>
            + Create Event
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarImage src="https://picsum.photos/seed/avatar1/40/40" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
