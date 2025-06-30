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
import { getFertilizerAndSoilAdvice } from '@/ai/flows/fertilizer-and-soil-ai';
import { FlaskConical, Lightbulb } from 'lucide-react';
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function FertilizerSoilPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const form = useForm({
    defaultValues: {
      cropSelected: '',
      landSize: '1.5',
      recentFertilizerUsed: '',
      soilTestAvailable: 'No',
      nitrogenLevel: 120,
      phosphorusLevel: 60,
      potassiumLevel: 40,
      pH: 6.5,
    },
  });

  const soilTestAvailable = form.watch('soilTestAvailable');

  const onSubmit = async (values) => {
    setLoading(true);
    setResult(null);

    const submissionValues = {
        ...values,
        nitrogenLevel: values.soilTestAvailable === 'Yes' ? values.nitrogenLevel : undefined,
        phosphorusLevel: values.soilTestAvailable === 'Yes' ? values.phosphorusLevel : undefined,
        potassiumLevel: values.soilTestAvailable === 'Yes' ? values.potassiumLevel : undefined,
        pH: values.soilTestAvailable === 'Yes' ? values.pH : undefined,
    }

    try {
      const advice = await getFertilizerAndSoilAdvice(submissionValues);
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

  const renderSuggestions = (suggestions) => {
    if (!suggestions) return null;

    if (Array.isArray(suggestions)) {
      return (
        <ul className="space-y-3 text-muted-foreground">
          {suggestions.map((item, index) => (
            <li key={index} className="flex gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
              <span>
                {typeof item === 'object' && item.suggestion ? item.suggestion : item}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    if (typeof suggestions === 'string') {
      return <p className="text-muted-foreground whitespace-pre-wrap">{suggestions}</p>;
    }

    return <p className="text-muted-foreground">No suggestions available.</p>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Fertilizer & Soil Advisor</CardTitle>
            <CardDescription>Recommend fertilizers and soil improvements.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="cropSelected" render={({ field }) => (
                  <FormItem><FormLabel>Crop Selected</FormLabel><FormControl><Input placeholder="e.g., Wheat" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="soilType" render={({ field }) => (
                  <FormItem><FormLabel>Soil Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Alluvial">Alluvial</SelectItem><SelectItem value="Black">Black</SelectItem><SelectItem value="Red">Red</SelectItem><SelectItem value="Laterite">Laterite</SelectItem><SelectItem value="Desert">Desert</SelectItem><SelectItem value="Mountain">Mountain</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="landSize" render={({ field }) => (
                  <FormItem><FormLabel>Land Size (in acres)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1.5" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="organicPreference" render={({ field }) => (
                  <FormItem className="space-y-2"><FormLabel>Organic Preference?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="No" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="recentFertilizerUsed" render={({ field }) => (
                  <FormItem><FormLabel>Recent Fertilizer Used (Optional)</FormLabel><FormControl><Input placeholder="e.g., Urea, DAP" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="soilTestAvailable" render={({ field }) => (
                  <FormItem className="space-y-2"><FormLabel>Soil Test Available?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="No" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                )} />
                
                {soilTestAvailable === 'Yes' && (
                    <Card className="p-4 bg-muted/50">
                        <CardContent className="space-y-4 p-0">
                             <FormField control={form.control} name="nitrogenLevel" render={({ field }) => (
                                <FormItem><Label>Nitrogen (N) - {field.value} kg/ha</Label><FormControl><Slider value={[field.value || 0]} max={300} step={10} onValueChange={(v) => field.onChange(v[0])} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="phosphorusLevel" render={({ field }) => (
                                <FormItem><Label>Phosphorus (P) - {field.value} kg/ha</Label><FormControl><Slider value={[field.value || 0]} max={150} step={5} onValueChange={(v) => field.onChange(v[0])} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="potassiumLevel" render={({ field }) => (
                                <FormItem><Label>Potassium (K) - {field.value} kg/ha</Label><FormControl><Slider value={[field.value || 0]} max={100} step={5} onValueChange={(v) => field.onChange(v[0])} /></FormControl></FormItem>
                            )} />
                             <FormField control={form.control} name="pH" render={({ field }) => (
                                <FormItem><Label>Soil pH - {field.value}</Label><FormControl><Slider value={[field.value || 0]} max={9} min={4} step={0.1} onValueChange={(v) => field.onChange(v[0])} /></FormControl></FormItem>
                            )} />
                        </CardContent>
                    </Card>
                )}

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
                <FlaskConical /> AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Fertilizer Suggestions</h3>
                    {renderSuggestions(result.fertilizerSuggestions)}
                </div>
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Soil Improvement Suggestions</h3>
                    {renderSuggestions(result.soilImprovementSuggestions)}
                </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-12 h-full min-h-[400px] bg-card/50 border-dashed">
            <FlaskConical className="h-24 w-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground">Get Fertilizer & Soil Advice</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Fill in your farm details for AI-powered suggestions.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
