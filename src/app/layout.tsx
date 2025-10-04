
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Card } from '@/components/ui/card';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'EventChain Pro',
  description: 'A comprehensive event and certificate management system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning={true}
        className={cn(
          'h-full font-body antialiased',
          'bg-background text-foreground'
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
