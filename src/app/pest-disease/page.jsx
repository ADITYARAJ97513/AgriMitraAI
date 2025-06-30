'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { pestAndDiseaseAI } from '@/ai/flows/pest-and-disease-ai';
import { Bug, AlertTriangle, Lightbulb, Leaf, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

export default function PestDiseasePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const form = useForm({
    defaultValues: {
      cropType: '',
      weatherConditions: '',
      chemicalsUsedEarlier: '',
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setResult(null);

    try {
      const advice = await pestAndDiseaseAI(values);
      if (advice.error) {
        throw new Error(advice.error);
      }
      setResult(advice);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get advice. Please try again.',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderList = (items, icon, title) => {
    if (!items || items.length === 0) return null;
    const Icon = icon;
    return (
      <div>
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Icon className="h-5 w-5 text-primary" />{title}</h3>
        <ul className="space-y-4 text-muted-foreground pl-4">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3">
              <span className="font-semibold text-primary mt-1"> • </span>
              {typeof item === 'object' && item !== null ? (
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{item.recommendation || item.name}</span>
                  {item.description && <span className="text-sm">{item.description}</span>}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.dosage && <span className="text-xs font-mono p-1 bg-muted rounded">Dosage: {item.dosage}</span>}
                    {item.applicationTiming && <span className="text-xs font-mono p-1 bg-muted rounded">Timing: {item.applicationTiming}</span>}
                  </div>
                </div>
              ) : (
                <span>{item}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Pest & Disease Advisor</CardTitle>
            <CardDescription>Provide pest and disease control suggestions.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="cropType" render={({ field }) => (
                  <FormItem><FormLabel>Crop Type</FormLabel><FormControl><Input placeholder="e.g., Rice" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="growthStage" render={({ field }) => (
                  <FormItem><FormLabel>Growth Stage</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Seedling">Seedling</SelectItem><SelectItem value="Vegetative">Vegetative</SelectItem><SelectItem value="Flowering">Flowering</SelectItem><SelectItem value="Harvest">Harvest</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="symptomsObserved" render={({ field }) => (
                  <FormItem><FormLabel>Symptoms Observed</FormLabel><FormControl><Textarea placeholder="e.g., yellowing leaves, spots, pests on underside..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="organicPreference" render={({ field }) => (
                  <FormItem className="space-y-2"><FormLabel>Organic Preference?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="No" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="weatherConditions" render={({ field }) => (
                  <FormItem><FormLabel>Weather Conditions (Optional)</FormLabel><FormControl><Input placeholder="e.g., Humid, rainy" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="chemicalsUsedEarlier" render={({ field }) => (
                  <FormItem><FormLabel>Chemicals Used Earlier (Optional)</FormLabel><FormControl><Input placeholder="e.g., Imidacloprid" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Getting Advice...' : 'Get AI Advice'}
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
                <Bug /> AI Recommendations for {form.getValues('cropType')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {renderList(result.pestThreats, Bug, "Potential Pest Threats")}
                {renderList(result.diseaseThreats, AlertTriangle, "Potential Disease Threats")}
                {renderList(result.preventativeMeasures, ShieldCheck, "Preventative Measures")}
                {renderList(result.organicTreatments, Leaf, "Organic Treatments")}
                {renderList(result.chemicalTreatments, Lightbulb, "Chemical Treatments")}
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-12 h-full min-h-[400px] bg-card/50 border-dashed">
            <Bug className="h-24 w-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground">Get Pest & Disease Advice</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Enter your crop and farm details to get AI-powered pest and disease control strategies.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
