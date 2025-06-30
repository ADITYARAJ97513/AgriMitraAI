'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getWeatherAlerts } from '@/ai/flows/weather-watch-ai';
import { Cloudy, Lightbulb } from 'lucide-react';
import React, { useState } from 'react';

export default function WeatherWatchPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const form = useForm({
    defaultValues: {
      location: '',
      cropPlanned: '',
      alertType: 'All',
      dateRange: '3-day forecast',
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setResult(null);

    try {
      const alerts = await getWeatherAlerts(values);
      if (alerts.error) {
        throw new Error(alerts.error);
      }
      setResult(alerts);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get weather alerts. Please try again.',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderRecommendations = (items) => {
    return (
      <ul className="space-y-3 text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
            <span>{typeof item === 'string' ? item : item.recommendation}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Weather Watch AI</CardTitle>
            <CardDescription>Show real-time and upcoming weather alerts.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Pune, Maharashtra" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="alertType" render={({ field }) => (
                  <FormItem><FormLabel>Alert Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select alert type" /></SelectTrigger></FormControl><SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Rainfall">Rainfall</SelectItem>
                      <SelectItem value="Temperature">Temperature</SelectItem>
                      <SelectItem value="Wind">Wind</SelectItem>
                      <SelectItem value="Humidity">Humidity</SelectItem>
                    </SelectContent></Select><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="dateRange" render={({ field }) => (
                  <FormItem><FormLabel>Date Range</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select date range" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Today">Today</SelectItem><SelectItem value="3-day forecast">3-day forecast</SelectItem><SelectItem value="7-day forecast">7-day forecast</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="cropPlanned" render={({ field }) => (
                  <FormItem><FormLabel>Crop Planned (Optional)</FormLabel><FormControl><Input placeholder="e.g., Tomato" {...field} /></FormControl><FormDescription>For tailored weather advice.</FormDescription><FormMessage /></FormItem>
                )} />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Getting Alerts...' : 'Get Weather Alerts'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {loading ? (
          <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
        ) : result ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloudy /> {result.reportTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                  <h3 className="font-semibold text-lg mb-2">Overall Summary</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{result.overallSummary}</p>
              </div>
              {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                      <h3 className="font-semibold text-lg mb-2">Recommendations</h3>
                      {renderRecommendations(result.recommendations)}
                  </div>
              )}
               <p className="text-primary font-semibold italic pt-4 border-t mt-4">
                🌱 {result.motivationalMessage}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-12 h-full min-h-[400px] bg-card/50 border-dashed">
            <Cloudy className="h-24 w-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground">Get Weather Alerts</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Enter your location to get relevant weather alerts and recommendations.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
