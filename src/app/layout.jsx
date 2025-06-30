
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'AgriMitraAI',
  description: 'Your AI-powered farming companion for a richer harvest.',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-sans antialiased bg-background/50")}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Nav />
            <main className="flex-grow pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
