
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // If the auth state is not loading and a user exists, redirect them to the home page.
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await login(values.username, values.password);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      // On success, the `useEffect` above will trigger the redirect when the `user` state updates.
      // We don't set `isSubmitting` to false here, so the button remains disabled during redirection.
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
      setIsSubmitting(false); // Re-enable button only on failure.
    }
  };

  // Show a spinner only during the initial auth check on page load.
  // The previous logic (`if (loading || user)`) caused the "buffering" issue
  // by showing the spinner again after a successful login.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 bg-gray-50/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary p-2 rounded-lg inline-block mb-4">
                <Link href="/" aria-label="Home">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary-foreground"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
                </Link>
            </div>
          <CardTitle>Welcome Back to AgriMitraAI</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="yourusername" {...field} required/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} required/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
