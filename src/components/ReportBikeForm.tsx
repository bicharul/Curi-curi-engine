"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Camera, MapPin, Calendar, FileText, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const bikeSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().optional(),
  color: z.string().optional(),
  category: z.string().optional(),
  vin: z.string().optional(),
  engineNumber: z.string().optional(),
  plateNumber: z.string().optional(),
  theftDate: z.string().min(1, "Theft date is required"),
  theftLocation: z.string().min(1, "Theft location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  policeReport: z.string().optional(),
  reporterName: z.string().min(1, "Your name is required"),
  reporterEmail: z.string().email("Valid email is required"),
  reporterPhone: z.string().optional(),
});

type BikeFormData = z.infer<typeof bikeSchema>;

interface ReportBikeFormProps {
  onSubmit: (data: BikeFormData & { images: File[] }) => void;
  isLoading?: boolean;
}

export function ReportBikeForm({ onSubmit, isLoading = false }: ReportBikeFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BikeFormData>({
    resolver: zodResolver(bikeSchema),
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages = [...images, ...files];
    const newPreviews = [...imagePreviews];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    setImages(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onFormSubmit = (data: BikeFormData) => {
    onSubmit({ ...data, images });
  };

  const bikeCategories = [
    "Sport",
    "Cruiser",
    "Touring",
    "Standard",
    "Dual-Sport",
    "Off-Road",
    "Scooter",
    "Moped",
    "Other",
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-orange-500" />
          Report Lost Bike
        </CardTitle>
        <CardDescription>
          Fill out the form below to report your stolen motorcycle. All information will help in the recovery process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Bike Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Bike Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  {...register("make")}
                  placeholder="e.g., Honda, Yamaha, Kawasaki"
                />
                {errors.make && (
                  <p className="text-sm text-red-500 mt-1">{errors.make.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  {...register("model")}
                  placeholder="e.g., CBR, R1, Ninja"
                />
                {errors.model && (
                  <p className="text-sm text-red-500 mt-1">{errors.model.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  {...register("year")}
                  placeholder="e.g., 2023"
                />
              </div>
              
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  {...register("color")}
                  placeholder="e.g., Red, Black, Blue"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bike category" />
                  </SelectTrigger>
                  <SelectContent>
                    {bikeCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="vin">VIN Number</Label>
                <Input
                  id="vin"
                  {...register("vin")}
                  placeholder="Vehicle Identification Number"
                />
              </div>
              
              <div>
                <Label htmlFor="engineNumber">Engine Number</Label>
                <Input
                  id="engineNumber"
                  {...register("engineNumber")}
                  placeholder="Engine serial number"
                />
              </div>
              
              <div>
                <Label htmlFor="plateNumber">License Plate</Label>
                <Input
                  id="plateNumber"
                  {...register("plateNumber")}
                  placeholder="License plate number"
                />
              </div>
            </div>
          </div>

          {/* Theft Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Theft Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="theftDate">Theft Date *</Label>
                <Input
                  id="theftDate"
                  type="datetime-local"
                  {...register("theftDate")}
                />
                {errors.theftDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.theftDate.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="theftLocation">Theft Location *</Label>
                <Input
                  id="theftLocation"
                  {...register("theftLocation")}
                  placeholder="e.g., Downtown parking lot, 123 Main St"
                />
                {errors.theftLocation && (
                  <p className="text-sm text-red-500 mt-1">{errors.theftLocation.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Provide detailed description of the theft incident, any distinguishing features of the bike, circumstances, etc."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="policeReport">Police Report Number</Label>
              <Input
                id="policeReport"
                {...register("policeReport")}
                placeholder="Police report reference number (if available)"
              />
            </div>
          </div>

          {/* Reporter Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reporterName">Your Name *</Label>
                <Input
                  id="reporterName"
                  {...register("reporterName")}
                  placeholder="Your full name"
                />
                {errors.reporterName && (
                  <p className="text-sm text-red-500 mt-1">{errors.reporterName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="reporterEmail">Email *</Label>
                <Input
                  id="reporterEmail"
                  type="email"
                  {...register("reporterEmail")}
                  placeholder="your.email@example.com"
                />
                {errors.reporterEmail && (
                  <p className="text-sm text-red-500 mt-1">{errors.reporterEmail.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="reporterPhone">Phone Number</Label>
                <Input
                  id="reporterPhone"
                  {...register("reporterPhone")}
                  placeholder="Your phone number"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bike Images
            </h3>
            
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Click to upload images of your bike
                </p>
                <p className="text-sm text-slate-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </label>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Bike image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Your report will be reviewed by our team within 24 hours. You'll receive a confirmation email once your report is processed.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            disabled={isLoading}
          >
            {isLoading ? "Submitting Report..." : "Submit Theft Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}