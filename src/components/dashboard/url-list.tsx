"use client";

import {
  BarChart3,
  Calendar,
  Copy,
  ExternalLink,
  Eye,
  Lock,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QRCodeDialog } from "../qr-code-dialog";
import { EditUrlDialog } from "./edit-url-dialog";

interface Url {
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
}

export function UrlList() {
  const { data: session } = useSession();
  const [urls, setUrls] = useState<Url[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchUrls = async () => {
    try {
      const response = await fetch("/api/urls");
      if (response.ok) {
        const data = await response.json();
        setUrls(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch URLs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await fetch("/api/urls");
        if (response.ok) {
          const data = await response.json();
          setUrls(data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch URLs");
      } finally {
        setIsLoading(false);
      }
    };
    if (session) {
      fetchUrls();
    }
  }, [session]);

  const copyToClipboard = async (shortCode: string) => {
    const shortUrl = `${window.location.origin}/${shortCode}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy: ", error);
      toast.error("Failed to copy");
    }
  };

  const deleteUrl = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUrls(urls.filter((url) => url.id !== id));
        toast.success("Link deleted successfully");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete link");
    }
  };

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setUrls(
          urls.map((url) =>
            url.id === id ? { ...url, isActive: !isActive } : url,
          ),
        );
        toast.success(isActive ? "Link deactivated" : "Link activated");
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update link status");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Links</CardTitle>
          <CardDescription>Manage your shortened links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_) => (
              <div key={Math.random()} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (urls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Links</CardTitle>
          <CardDescription>You haven't created any links yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ExternalLink className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No links yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first short URL to get started!
            </p>
            <Button asChild>
              <a href="/">Create Link</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Links</CardTitle>
        <CardDescription>Manage your shortened links</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {urls.map((url) => (
            <div
              key={url.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <a
                    href={`/${url.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary hover:underline font-medium"
                  >
                    {typeof window !== "undefined"
                      ? window.location.origin
                      : ""}
                    /{url.shortCode}
                  </a>

                  <div className="flex gap-2">
                    {url.customCode && (
                      <Badge variant="secondary">Custom</Badge>
                    )}
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
                </div>

                <div className="space-y-1">
                  {url.title && (
                    <h4 className="font-medium text-sm">{url.title}</h4>
                  )}
                  <p className="text-sm text-muted-foreground truncate">
                    {url.originalUrl}
                  </p>
                  {url.description && (
                    <p className="text-sm text-muted-foreground">
                      {url.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {url.clicks.toLocaleString()} clicks
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(url.createdAt).toLocaleDateString()}
                  </span>
                  {url.expiresAt && (
                    <span className="flex items-center">
                      Expires: {new Date(url.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  onClick={() => copyToClipboard(url.shortCode)}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>

                <QRCodeDialog
                  url={`${window.location.origin}/${url.shortCode}`}
                />

                <Button asChild size="sm" variant="outline">
                  <Link href={`/analytics/${url.id}`}>
                    <BarChart3 className="h-4 w-4" />
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <EditUrlDialog url={url} onUpdate={fetchUrls} />
                    <DropdownMenuItem asChild>
                      <Link href={`/analytics/${url.id}`}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a
                        href={url.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Original
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => toggleStatus(url.id, url.isActive)}
                    >
                      {url.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteUrl(url.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
