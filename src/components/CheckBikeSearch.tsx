"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, AlertTriangle, CheckCircle, Clock, Bike } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const searchSchema = z.object({
  searchType: z.enum(["vin", "engine", "plate"]),
  searchValue: z.string().min(1, "Search value is required"),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface SearchResult {
  id: string;
  status: "stolen" | "clean" | "pending";
  bike: {
    make: string;
    model: string;
    year?: number;
    color?: string;
    category?: string;
  };
  theftReport?: {
    theftDate: string;
    theftLocation: string;
    description: string;
  };
  lastUpdated: string;
}

interface CheckBikeSearchProps {
  onSearch?: (data: SearchFormData) => void;
}

export function CheckBikeSearch({ onSearch }: CheckBikeSearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  const searchType = watch("searchType");

  const onFormSubmit = async (data: SearchFormData) => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Call the actual API
      const response = await fetch(`/api/bikes/search?type=${data.searchType}&value=${encodeURIComponent(data.searchValue)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search bike');
      }

      if (result.found) {
        // Transform API response to match our component's expected format
        const searchResult: SearchResult = {
          id: result.bike.id,
          status: result.status,
          bike: {
            make: result.bike.make,
            model: result.bike.model,
            year: result.bike.year,
            color: result.bike.color,
            category: result.bike.category,
          },
          theftReport: result.theftReport ? {
            theftDate: result.theftReport.theftDate,
            theftLocation: result.theftReport.theftLocation,
            description: result.theftReport.description,
          } : undefined,
          lastUpdated: result.lastUpdated,
        };
        setSearchResults(searchResult);
      } else {
        setSearchResults(null);
      }
      
      if (onSearch) {
        onSearch(data);
      }
    } catch (error) {
      console.error("Error searching bike:", error);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "stolen":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "clean":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Search className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "stolen":
        return <Badge variant="destructive">Reported Stolen</Badge>;
      case "clean":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Clean Record</Badge>;
      case "pending":
        return <Badge variant="secondary">Under Review</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stolen":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
      case "clean":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
      case "pending":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950";
      default:
        return "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-6 w-6 text-blue-500" />
          Check Bike Status
        </CardTitle>
        <CardDescription>
          Enter a VIN, engine number, or license plate to check if a motorcycle has been reported stolen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="searchType">Search Type</Label>
              <Select onValueChange={(value) => setValue("searchType", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select search type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vin">VIN Number</SelectItem>
                  <SelectItem value="engine">Engine Number</SelectItem>
                  <SelectItem value="plate">License Plate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="searchValue">
                {searchType === "vin" ? "VIN Number" : 
                 searchType === "engine" ? "Engine Number" : 
                 "License Plate"} *
              </Label>
              <Input
                id="searchValue"
                {...register("searchValue")}
                placeholder={
                  searchType === "vin" ? "Enter VIN number" :
                  searchType === "engine" ? "Enter engine number" :
                  "Enter license plate"
                }
              />
              {errors.searchValue && (
                <p className="text-sm text-red-500 mt-1">{errors.searchValue.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search Bike"}
          </Button>
        </form>

        {hasSearched && searchResults && (
          <div className={`mt-6 p-4 rounded-lg border ${getStatusColor(searchResults.status)}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(searchResults.status)}
                <h3 className="font-semibold">
                  {searchResults.status === "stolen" ? "⚠️ Bike Reported Stolen" :
                   searchResults.status === "clean" ? "✅ Clean Record" :
                   "⏳ Under Review"}
                </h3>
              </div>
              {getStatusBadge(searchResults.status)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bike className="h-4 w-4 text-slate-500" />
                <span className="font-medium">
                  {searchResults.bike.year} {searchResults.bike.make} {searchResults.bike.model}
                </span>
                {searchResults.bike.color && (
                  <Badge variant="outline" className="text-xs">
                    {searchResults.bike.color}
                  </Badge>
                )}
              </div>

              {searchResults.theftReport && (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Theft Date:</span>{" "}
                    {new Date(searchResults.theftReport.theftDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>{" "}
                    {searchResults.theftReport.theftLocation}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span>{" "}
                    {searchResults.theftReport.description}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500">
                Last updated: {new Date(searchResults.lastUpdated).toLocaleString()}
              </div>
            </div>

            {searchResults.status === "stolen" && (
              <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  If you have information about this stolen motorcycle, please contact your local police department immediately.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {hasSearched && !searchResults && (
          <Alert className="mt-4">
            <Search className="h-4 w-4" />
            <AlertDescription>
              No records found for the provided information. This could mean the bike has not been reported stolen or the information is not in our database.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}