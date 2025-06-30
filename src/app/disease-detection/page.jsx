'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { detectPlantDisease } from '@/ai/flows/plant-disease-detector';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, FileUp, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function DiseaseDetectionPage() {
  const { toast } = useToast();
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const form = useForm({
    defaultValues: {
      cropType: 'Tomato',
      growthStage: 'Vegetative',
      location: '',
      symptomsObserved: '',
    }
  });

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!showCamera) {
      stopCamera();
      return;
    }

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setShowCamera(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };
    getCameraPermission();

    return () => {
      stopCamera();
    };
  }, [showCamera, toast, stopCamera]);

  const handleDetect = async (photoDataUri) => {
    setLoading(true);
    setResult(null);
    try {
      const formValues = form.getValues();
      const response = await detectPlantDisease({ photoDataUri, ...formValues });
      if (response.error) {
        throw new Error(response.error);
      }
      setResult(response);
    } catch (error) {
      console.error('Error detecting disease:', error);
      toast({
        variant: 'destructive',
        title: 'Detection Failed',
        description: error.message || 'An error occurred while analyzing the image. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result;
        setImage(dataUri);
        setShowCamera(false);
        handleDetect(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImage(dataUri);
        setShowCamera(false);
        handleDetect(dataUri);
      }
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload or Capture an Image</CardTitle>
            <CardDescription>Use a clear image of a plant leaf for best results.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border-2 border-dashed rounded-lg flex items-center justify-center min-h-[200px] bg-muted/50">
              {image ? (
                <Image src={image} alt="Uploaded plant leaf" width={400} height={300} className="rounded-md max-h-[300px] w-auto" />
              ) : showCamera ? (
                <div className="w-full space-y-2">
                  <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
                  {hasCameraPermission === false && (
                      <Alert variant="destructive">
                          <AlertTitle>Camera Access Required</AlertTitle>
                          <AlertDescription>
                            Please allow camera access to use this feature.
                          </AlertDescription>
                      </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Camera className="mx-auto h-12 w-12" />
                  <p>Upload an image or use your camera</p>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="outline" disabled={loading}>
                <FileUp className="mr-2 h-4 w-4" /> Upload Image
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              
              {showCamera ? (
                   <Button onClick={handleCapture} className="w-full" disabled={!hasCameraPermission || loading}>
                      <Camera className="mr-2 h-4 w-4" /> Capture
                  </Button>
              ) : (
                  <Button onClick={() => setShowCamera(true)} className="w-full" disabled={loading}>
                      <Camera className="mr-2 h-4 w-4" /> Use Camera
                  </Button>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Additional Details (Optional)</CardTitle>
                <CardDescription>Providing more context can improve diagnosis accuracy.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="space-y-4">
                       <FormField
                          control={form.control}
                          name="cropType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Crop Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Select crop type" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Tomato">Tomato</SelectItem>
                                  <SelectItem value="Paddy">Paddy (Rice)</SelectItem>
                                  <SelectItem value="Wheat">Wheat</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                            control={form.control}
                            name="growthStage"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Growth Stage</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select growth stage" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Seedling">Seedling</SelectItem>
                                        <SelectItem value="Vegetative">Vegetative</SelectItem>
                                        <SelectItem value="Flowering">Flowering</SelectItem>
                                        <SelectItem value="Harvest">Harvest</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Nashik, Maharashtra" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="symptomsObserved"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Symptoms Observed</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., Yellow spots with brown edges, curled leaves..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Diagnosis & Solution</CardTitle>
          <CardDescription>Results will appear here after analysis.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-8 w-1/3 mt-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : result ? (
            result.isPlant ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {result.disease.toLowerCase() === 'healthy' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive" />
                  )}
                  <h3 className="text-xl font-semibold">{result.disease}</h3>
                </div>
                <div>
                    <h4 className="font-semibold text-lg mb-2">Description</h4>
                    <p className="text-muted-foreground">{result.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Lightbulb />Solution</h4>
                  <p className="text-muted-foreground">{result.solution}</p>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTitle>Not a Plant</AlertTitle>
                <AlertDescription>The AI could not detect a plant leaf in the image. Please try another one.</AlertDescription>
              </Alert>
            )
          ) : (
            <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center h-full">
                <Lightbulb className="h-12 w-12 mb-4" />
                <p>Results will appear here after you provide an image.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
