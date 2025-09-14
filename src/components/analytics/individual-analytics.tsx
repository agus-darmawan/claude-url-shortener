"use client";

import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Lock,
  Mouse as MouseClick,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { QRCodeDialog } from "@/components/qr-code-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LinkAnalytics {
  url: {
    id: string;
    originalUrl: string;
    shortCode: string;
    customCode: string | null;
    title: string | null;
    description: string | null;
    clicks: number;
    isActive: boolean;
    isPasswordProtected: boolean;
    createdAt: string;
    expiresAt: string | null;
  };
  analytics: {
    totalClicks: number;
    todayClicks: number;
    topCountries: { name: string; clicks: number }[];
    topDevices: { name: string; clicks: number }[];
    topBrowsers: { name: string; clicks: number }[];
    clicksOverTime: { date: string; clicks: number }[];
    topReferrers: { name: string; clicks: number }[];
  };
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

export function IndividualAnalytics() {
  const params = useParams();
  const [data, setData] = useState<LinkAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics/link/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Link not found");
          } else if (response.status === 401) {
            setError("Unauthorized access");
          } else {
            setError("Failed to load analytics");
          }
          return;
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.log(error);
        setError("Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [params.id]);

  const copyToClipboard = async () => {
    if (!data) return;
    const shortUrl = `${window.location.origin}/${data.url.shortCode}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy: ", error);
      toast.error("Failed to copy");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_) => (
              <div
                key={Math.random()}
                className="h-24 bg-muted rounded-lg"
              ></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">
            {error || "Analytics not found"}
          </h2>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { url, analytics } = data;
  const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${url.shortCode}`;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Link Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {url.title || "Untitled Link"}
                <div className="flex gap-2">
                  {url.customCode && <Badge variant="secondary">Custom</Badge>}
                  {!url.isActive && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                  {url.isPasswordProtected && (
                    <Badge variant="outline">
                      <Lock className="w-3 h-3 mr-1" />
                      Protected
                    </Badge>
                  )}
                  {url.expiresAt && new Date(url.expiresAt) < new Date() && (
                    <Badge variant="outline">Expired</Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Analytics for your shortened link
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="px-3 py-2 bg-muted rounded font-mono text-sm">
                {shortUrl}
              </code>
              <Button onClick={copyToClipboard} size="sm" variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
              <QRCodeDialog url={shortUrl} />
              <Button asChild size="sm" variant="outline">
                <a
                  href={url.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open original URL in a new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {url.description && (
              <p className="text-muted-foreground">{url.description}</p>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="break-all">Original: {url.originalUrl}</p>
              <div className="flex gap-4 mt-2">
                <span>
                  Created: {new Date(url.createdAt).toLocaleDateString()}
                </span>
                {url.expiresAt && (
                  <span>
                    Expires: {new Date(url.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MouseClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Clicks
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.todayClicks}</div>
            <p className="text-xs text-muted-foreground">Clicks today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Country</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.topCountries[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.topCountries[0]?.clicks || 0} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Device</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.topDevices[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.topDevices[0]?.clicks || 0} clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Clicks Over Time */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Clicks Over Time</CardTitle>
            <CardDescription>Daily clicks for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.clicksOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Clicks by country</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.topCountries.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => {
                    const totalClicks = analytics.topCountries
                      .slice(0, 5)
                      .reduce((sum, country) => sum + country.clicks, 0);
                    const percent =
                      typeof value === "number" && totalClicks > 0
                        ? (value / totalClicks) * 100
                        : 0;
                    return `${name} ${percent.toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="clicks"
                >
                  {analytics.topCountries.slice(0, 5).map((_, index) => (
                    <Cell
                      key={
                        analytics.topCountries[index]?.name || `cell-${index}`
                      }
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Clicks by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.topDevices.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="clicks" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Browsers */}
        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
            <CardDescription>Clicks by browser</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.topBrowsers.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="clicks" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
            <CardDescription>Traffic sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topReferrers.slice(0, 5).map((referrer) => (
                <div
                  key={referrer.name}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm truncate">
                    {referrer.name === "Direct"
                      ? "Direct Traffic"
                      : referrer.name}
                  </span>
                  <span className="font-medium">{referrer.clicks}</span>
                </div>
              ))}
              {analytics.topReferrers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No referrer data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
