'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { recommendCrops } from '@/ai/flows/intelligent-crop-advisor';
import { Leaf, Sprout } from 'lucide-react';
import React, { useState } from 'react';

export default function CropAdvisorPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const form = useForm({
    defaultValues: {
      location: '',
      landSize: '1.5',
      preferredCrops: '',
      pastCrops: '',
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setResult(null);

    try {
      const cropAdvice = await recommendCrops(values);
      if (cropAdvice.error) {
        throw new Error(cropAdvice.error);
      }
      setResult(cropAdvice);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get crop advice. Please try again.',
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
            <CardTitle>Crop Advisor</CardTitle>
            <CardDescription>Suggest best crops to grow based on land and conditions.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Patna, Bihar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soilType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soil Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select soil type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Alluvial">Alluvial</SelectItem>
                          <SelectItem value="Black">Black</SelectItem>
                          <SelectItem value="Red">Red</SelectItem>
                          <SelectItem value="Laterite">Laterite</SelectItem>
                          <SelectItem value="Desert">Desert</SelectItem>
                          <SelectItem value="Mountain">Mountain</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Season</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select season" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Kharif">Kharif (Jun-Oct)</SelectItem>
                          <SelectItem value="Rabi">Rabi (Oct-Mar)</SelectItem>
                          <SelectItem value="Zaid">Zaid (Mar-Jun)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="landSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Land Size (in acres)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="irrigationAvailable"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Irrigation Available?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Yes" />
                            </FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="No" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budgetLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferredCrops"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Crops (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Rice, Wheat" {...field} />
                      </FormControl>
                      <FormDescription>Separate crop names with a comma.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pastCrops"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Past Crops (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Lentils, Mustard" {...field} />
                      </FormControl>
                       <FormDescription>For crop rotation advice. Separate with a comma.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <Leaf /> Crop Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Sprout />
                  Suitable Crops
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.crops.map((crop) => (
                    <div key={crop} className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full">
                      {crop}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <p>
                  <strong className="font-semibold">Fertilizer Suggestions:</strong>{' '}
                  {result.fertilizerSuggestions}
                </p>
                <p>
                  <strong className="font-semibold">Pest/Disease Control:</strong> {result.pestDiseaseControl}
                </p>
                <p>
                  <strong className="font-semibold">Weather Precautions:</strong> {result.weatherPrecautions}
                </p>
                <p>
                  <strong className="font-semibold">Estimated Yield:</strong> {result.estimatedYield}
                </p>
                <p>
                  <strong className="font-semibold">Market Advice:</strong> {result.marketAdvice}
                </p>
              </div>
              <p className="text-primary font-semibold italic pt-4 border-t mt-4">
                🌱 {result.motivationalMessage}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-12 h-full min-h-[400px] bg-card/50 border-dashed">
             <Leaf className="h-24 w-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground">Get Crop Advice</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Fill in your farm details to receive personalized crop recommendations from our AI expert.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
