
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Menu, X, LogOut, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  
  const publicPaths = ['/login', '/signup'];
  if (publicPaths.includes(pathname)) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/crop-advisor', label: 'Crop Advisor' },
    { href: '/fertilizer-soil', label: 'Fertilizer' },
    { href: '/pest-disease', label: 'Pest Control' },
    { href: '/weather-watch', label: 'Weather' },
    { href: '/market-yield', label: 'Market' },
    { href: '/disease-detection', label: 'Disease Detection' },
    { href: '/govt-schemes', label: 'Subsidies' },
    { href: '/community', label: 'Community' },
  ];

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
            <div className="bg-primary p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-primary">AgriMitraAI</span>
              <p className="text-xs text-muted-foreground hidden sm:block">AI Agritech Advisor</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
             <div className="hidden lg:flex items-center gap-2">
              {loading ? (
                  <Skeleton className="h-8 w-24 rounded-md" />
                ) : user ? (
                  <>
                    <span className="text-sm text-muted-foreground hidden md:inline">{user.username}</span>
                    <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )
              }
             </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-foreground/70 hover:bg-muted"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <ul className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
               <li className="pt-4 mt-4 border-t">
                {loading ? (
                    <Skeleton className="h-10 w-full" />
                    ) : user ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-3 py-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-base font-medium text-foreground/70 truncate">{user.username}</span>
                        </div>
                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-base">
                        <LogOut className="mr-2 h-5 w-5" /> Logout
                        </Button>
                    </div>
                    ) : (
                    <div className="flex flex-col gap-2">
                        <Button asChild variant="ghost" className="w-full justify-start text-base">
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                        </Button>
                        <Button asChild className="w-full justify-start text-base">
                        <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                        </Button>
                    </div>
                    )
                }
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
