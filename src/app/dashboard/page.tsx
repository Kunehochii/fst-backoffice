"use client";

import { useBusiness } from "@/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Calendar, User } from "lucide-react";

export default function DashboardPage() {
  const { business, user, isLoading, isAuthenticated } = useBusiness();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  // Get display values
  const displayName = business?.name ?? user?.email?.split("@")[0] ?? "User";
  const email = user?.email ?? business?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const createdAt = business?.createdAt
    ? new Date(business.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {displayName}!</h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your business profile.</p>
      </div>

      {/* Profile Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Overview Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{displayName}</CardTitle>
              <CardDescription>{email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{isAuthenticated ? "Active" : "Inactive"}</Badge>
          </CardContent>
        </Card>

        {/* Business Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{business?.name ?? "Not set"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{business?.email ?? email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined:</span>
              <span className="font-medium">{createdAt}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>Your business at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">Stats will appear here once you start using the platform.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content Area */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Widget Area</span>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Widget Area</span>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Widget Area</span>
        </div>
      </div>
    </div>
  );
}
