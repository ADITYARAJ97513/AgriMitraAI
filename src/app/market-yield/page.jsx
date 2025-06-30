'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { marketAndYieldForecast } from '@/ai/flows/market-and-yield-forecaster';
import { AreaChart, Tractor, TrendingUp, CircleDollarSign } from 'lucide-react';
import React, { useState } from 'react';

export default function MarketYieldPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const form = useForm({
    defaultValues: {
      cropName: '',
      location: '',
      landSize: '1.5',
      cropVariety: '',
      expectedHarvestMonth: '',
      mandiPreference: '',
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setResult(null);

    try {
      const forecast = await marketAndYieldForecast(values);
      if (forecast.error) {
        throw new Error(forecast.error);
      }
      setResult(forecast);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get forecast. Please try again.',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Market & Yield Estimator</CardTitle>
            <CardDescription>Estimate expected yield and market prices.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="cropName" render={({ field }) => (
                  <FormItem><FormLabel>Crop Name</FormLabel><FormControl><Input placeholder="e.g., Wheat" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location (District/State)</FormLabel><FormControl><Input placeholder="e.g., Ludhiana, Punjab" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="landSize" render={({ field }) => (
                  <FormItem><FormLabel>Land Size (in acres)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1.5" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="farmingMethod" render={({ field }) => (
                  <FormItem><FormLabel>Farming Method</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a method" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Organic">Organic</SelectItem><SelectItem value="Traditional">Traditional</SelectItem><SelectItem value="High-yield hybrid">High-yield hybrid</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="expectedHarvestMonth" render={({ field }) => (
                  <FormItem><FormLabel>Expected Harvest Month</FormLabel><FormControl><Input placeholder="e.g., April" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="cropVariety" render={({ field }) => (
                  <FormItem><FormLabel>Crop Variety (Optional)</FormLabel><FormControl><Input placeholder="e.g., HD 3086" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="inputCosts" render={({ field }) => (
                  <FormItem><FormLabel>Input Costs (Optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 15000" {...field} /></FormControl><FormDescription>Helps in calculating profit.</FormDescription><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="mandiPreference" render={({ field }) => (
                  <FormItem><FormLabel>Mandi Preference (Optional)</FormLabel><FormControl><Input placeholder="e.g., Khanna Mandi" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Getting Forecast...' : 'Get AI Forecast'}
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
                <AreaChart /> AI Forecast for {form.getValues('cropName')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                    <Tractor className="h-8 w-8 text-primary flex-shrink-0 mt-1"/>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Yield Estimation</h3>
                        <p className="text-muted-foreground">{result.yieldEstimation}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <TrendingUp className="h-8 w-8 text-primary flex-shrink-0 mt-1"/>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Market Advice</h3>
                        <p className="text-muted-foreground">{result.marketAdvice}</p>
                    </div>
                </div>
                {result.profitAnalysis && (
                  <div className="flex items-start gap-4">
                      <CircleDollarSign className="h-8 w-8 text-primary flex-shrink-0 mt-1"/>
                      <div>
                          <h3 className="font-semibold text-lg mb-1">Profit Analysis</h3>
                          <p className="text-muted-foreground">{result.profitAnalysis}</p>
                      </div>
                  </div>
                )}
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-12 h-full min-h-[400px] bg-card/50 border-dashed">
            <AreaChart className="h-24 w-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground">Get Market & Yield Forecast</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Enter your crop and farm details for an AI-powered forecast.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
