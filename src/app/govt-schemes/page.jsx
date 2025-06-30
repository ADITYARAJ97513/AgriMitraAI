'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getGovtSchemes } from '@/ai/flows/govt-schemes-advisor';
import { Landmark } from 'lucide-react';
import React, { useState } from 'react';

export default function GovtSchemesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const form = useForm({
    defaultValues: {
      state: '',
      landholdingSize: '2.5',
      cropsGrown: '',
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setResult(null);

    try {
      const schemes = await getGovtSchemes(values);
      if (schemes.error) {
        throw new Error(schemes.error);
      }
      setResult(schemes);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get scheme information. Please try again.',
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
            <CardTitle>Government Schemes Advisor</CardTitle>
            <CardDescription>Find relevant subsidy schemes for you.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Maharashtra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="landholdingSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landholding Size (in acres)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="cropsGrown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crops Grown</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cotton, Sugarcane" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="farmerCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farmer Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Small and Marginal">Small and Marginal (Up to 5 acres)</SelectItem>
                          <SelectItem value="Medium">Medium (5-10 acres)</SelectItem>
                          <SelectItem value="Large">Large (More than 10 acres)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Finding Schemes...' : 'Get AI Advice'}
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
                <Landmark /> Relevant Government Schemes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.schemes.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {result.schemes.map((scheme, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>{scheme.name}</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-1">Summary</h4>
                          <p className="text-muted-foreground">{scheme.summary}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Eligibility</h4>
                          <p className="text-muted-foreground">{scheme.eligibility}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">How to Apply</h4>
                          <p className="text-muted-foreground whitespace-pre-wrap">{scheme.howToApply}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <p>No specific schemes found based on your profile. Please try adjusting your inputs.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-12 h-full min-h-[400px] bg-card/50 border-dashed">
            <Landmark className="h-24 w-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground">Find Government Schemes</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Fill in your details to get a list of government agricultural schemes you might be eligible for.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
