"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { recommendCrops } from "@/ai/flows/intelligent-crop-advisor";
import { getFertilizerAndSoilAdvice } from "@/ai/flows/fertilizer-and-soil-ai";
import { pestAndDiseaseAI } from "@/ai/flows/pest-and-disease-ai";
import { getWeatherAlerts } from "@/ai/flows/weather-watch-ai";
import { marketAndYieldForecast } from "@/ai/flows/market-and-yield-forecaster";
import { Sprout, Leaf, FlaskConical, Bug, Cloudy, AreaChart, AlertTriangle, Lightbulb, Tractor, TrendingUp } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

const formSchema = z.object({
  state: z.string().min(2, { message: "State is required." }),
  soilType: z.string({ required_error: "Please select a soil type." }),
  season: z.string({ required_error: "Please select a season." }),
  landSize: z.string().min(1, { message: "Land size is required." }),
  irrigationAvailable: z.enum(["Yes", "No"], { required_error: "Please select an option." }),
  budget: z.enum(["Low", "Medium", "High"], { required_error: "Please select a budget." }),
});

export default function AgriMitraClient() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingSecondary, setLoadingSecondary] = useState(false);
  const [results, setResults] = useState({
    cropAdvice: null,
    fertilizerAdvice: null,
    pestAdvice: null,
    weatherAlerts: null,
    marketForecast: null,
  });
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [formValues, setFormValues] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: "",
      landSize: "1.5",
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    setResults({ cropAdvice: null, fertilizerAdvice: null, pestAdvice: null, weatherAlerts: null, marketForecast: null });
    setSelectedCrop(null);
    setFormValues(values);

    try {
      const [cropAdvice, fertilizerAdvice] = await Promise.all([
        recommendCrops(values),
        getFertilizerAndSoilAdvice(values)
      ]);
      setResults(prev => ({ ...prev, cropAdvice, fertilizerAdvice }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get initial advice. Please try again.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSecondaryAdvice = useCallback(async (crop, values) => {
    setLoadingSecondary(true);
    setResults(prev => ({ ...prev, pestAdvice: null, weatherAlerts: null, marketForecast: null }));
    try {
      const pestAndDiseaseInput = { ...values, crop };
      const weatherAlertsInput = { state: values.state, crop, currentSeason: values.season };
      const marketAndYieldInput = { ...values, crop };

      const [pestAdvice, weatherAlerts, marketForecast] = await Promise.all([
        pestAndDiseaseAI(pestAndDiseaseInput),
        getWeatherAlerts(weatherAlertsInput),
        marketAndYieldForecast(marketAndYieldInput)
      ]);

      setResults(prev => ({ ...prev, pestAdvice, weatherAlerts, marketForecast }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get detailed advice for the selected crop.",
      });
      console.error(error);
    } finally {
      setLoadingSecondary(false);
    }
  }, [toast]);


  useEffect(() => {
    if (selectedCrop && formValues) {
      fetchSecondaryAdvice(selectedCrop, formValues);
    }
  }, [selectedCrop, formValues, fetchSecondaryAdvice]);
  
  const renderList = (items, icon) => {
    const Icon = icon;
    return (
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3">
            <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <span>{item}</span>
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
            <CardTitle>Farmer Details</CardTitle>
            <CardDescription>Enter your farm details to get tailored AI advice.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem><FormLabel>State/Region</FormLabel><FormControl><Input placeholder="e.g., Bihar" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="soilType" render={({ field }) => (
                  <FormItem><FormLabel>Soil Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Alluvial">Alluvial</SelectItem><SelectItem value="Black">Black</SelectItem><SelectItem value="Red">Red</SelectItem><SelectItem value="Laterite">Laterite</SelectItem><SelectItem value="Desert">Desert</SelectItem><SelectItem value="Mountain">Mountain</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="season" render={({ field }) => (
                  <FormItem><FormLabel>Current Season</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Kharif">Kharif (Jun-Oct)</SelectItem><SelectItem value="Rabi">Rabi (Oct-Mar)</SelectItem><SelectItem value="Zaid">Zaid (Mar-Jun)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="landSize" render={({ field }) => (
                  <FormItem><FormLabel>Land Size (in acres)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1.5" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="irrigationAvailable" render={({ field }) => (
                  <FormItem className="space-y-2"><FormLabel>Irrigation Available?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="No" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="budget" render={({ field }) => (
                  <FormItem><FormLabel>Budget</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
                  {loading ? 'Getting Advice...' : 'Get AI Advice'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {(loading || results.cropAdvice) ? (
        <Tabs defaultValue="crop-advisor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
            <TabsTrigger value="crop-advisor"><Leaf className="w-4 h-4 mr-2"/>Crop Advisor</TabsTrigger>
            <TabsTrigger value="fertilizer-soil"><FlaskConical className="w-4 h-4 mr-2"/>Fertilizer & Soil</TabsTrigger>
            <TabsTrigger value="pest-disease" disabled={!selectedCrop && !loadingSecondary}><Bug className="w-4 h-4 mr-2"/>Pest & Disease</TabsTrigger>
            <TabsTrigger value="weather" disabled={!selectedCrop && !loadingSecondary}><Cloudy className="w-4 h-4 mr-2"/>Weather Watch</TabsTrigger>
            <TabsTrigger value="market-yield" disabled={!selectedCrop && !loadingSecondary}><AreaChart className="w-4 h-4 mr-2"/>Market & Yield</TabsTrigger>
          </TabsList>
          
          <TabsContent value="crop-advisor" className="mt-4">
            {loading ? <Skeleton className="h-64 w-full" /> : results.cropAdvice && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Leaf />Crop Recommendations</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Sprout/>Suitable Crops</h3>
                      <p className="mb-4 text-muted-foreground">Based on your inputs, here are the most suitable crops. Select one to get more specific advice.</p>
                      <RadioGroup onValueChange={setSelectedCrop} value={selectedCrop || undefined} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {results.cropAdvice.crops.map(crop => (
                          <Label key={crop} htmlFor={crop} className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${selectedCrop === crop ? 'border-primary bg-primary/10' : 'border-border'}`}>
                             <RadioGroupItem value={crop} id={crop} className="sr-only"/>
                             {crop}
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-4">
                        <p><strong className="font-semibold">Fertilizer Suggestions:</strong> {results.cropAdvice.fertilizerSuggestions}</p>
                        <p><strong className="font-semibold">Pest/Disease Control:</strong> {results.cropAdvice.pestDiseaseControl}</p>
                        <p><strong className="font-semibold">Weather Precautions:</strong> {results.cropAdvice.weatherPrecautions}</p>
                        <p><strong className="font-semibold">Estimated Yield:</strong> {results.cropAdvice.estimatedYield}</p>
                        <p><strong className="font-semibold">Market Advice:</strong> {results.cropAdvice.marketAdvice}</p>
                    </div>
                    <p className="text-primary font-semibold italic pt-4 border-t mt-4">🌱 {results.cropAdvice.motivationalMessage}</p>
                  </CardContent>
                </Card>
            )}
          </TabsContent>

          <TabsContent value="fertilizer-soil" className="mt-4">
             {loading ? <Skeleton className="h-64 w-full" /> : results.fertilizerAdvice && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><FlaskConical/>Fertilizer & Soil AI</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><h3 className="font-semibold text-lg mb-2">Fertilizer Suggestions</h3><p>{results.fertilizerAdvice.fertilizerSuggestions}</p></div>
                    <div><h3 className="font-semibold text-lg mb-2">Soil Improvement Suggestions</h3><p>{results.fertilizerAdvice.soilImprovementSuggestions}</p></div>
                  </CardContent>
                </Card>
             )}
          </TabsContent>
          
          <TabsContent value="pest-disease" className="mt-4">
             {loadingSecondary ? <Skeleton className="h-64 w-full" /> : results.pestAdvice && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Bug/>Pest & Disease AI for {selectedCrop}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Bug/>Pest Threats</h3>{renderList(results.pestAdvice.pestThreats, Bug)}</div>
                    <div><h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><AlertTriangle/>Disease Threats</h3>{renderList(results.pestAdvice.diseaseThreats, AlertTriangle)}</div>
                    <div><h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Lightbulb/>Preventative Measures</h3>{renderList(results.pestAdvice.preventativeMeasures, Lightbulb)}</div>
                    <div><h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Leaf/>Organic Treatments</h3>{renderList(results.pestAdvice.organicTreatments, Leaf)}</div>
                  </CardContent>
                </Card>
             )}
          </TabsContent>
          
          <TabsContent value="weather" className="mt-4">
             {loadingSecondary ? <Skeleton className="h-64 w-full" /> : results.weatherAlerts && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Cloudy/>Weather Watch for {selectedCrop}</CardTitle></CardHeader>
                  <CardContent>
                    {renderList(results.weatherAlerts.alerts, AlertTriangle)}
                  </CardContent>
                </Card>
             )}
          </TabsContent>

          <TabsContent value="market-yield" className="mt-4">
             {loadingSecondary ? <Skeleton className="h-64 w-full" /> : results.marketForecast && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><AreaChart/>Market & Yield Forecast for {selectedCrop}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4"><Tractor className="h-8 w-8 text-primary flex-shrink-0 mt-1"/><p><strong className="font-semibold block">Yield Estimation</strong> {results.marketForecast.yieldEstimation}</p></div>
                    <div className="flex items-start gap-4"><TrendingUp className="h-8 w-8 text-primary flex-shrink-0 mt-1"/><p><strong className="font-semibold block">Market Advice</strong> {results.marketForecast.marketAdvice}</p></div>
                  </CardContent>
                </Card>
             )}
          </TabsContent>

        </Tabs>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-12 h-[calc(100vh-20rem)] bg-card/50 border-dashed">
            <Sprout className="h-24 w-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground">Welcome to AgriMitraAI</h2>
            <p className="text-muted-foreground mt-2 max-w-md">Fill in your details on the left to receive personalized farming advice from our AI expert.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
