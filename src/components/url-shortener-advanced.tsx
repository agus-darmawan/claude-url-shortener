"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  Lock,
  Settings,
  Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { urlSchema } from "@/lib/validation";
import { QRCodeDialog } from "./qr-code-dialog";

type FormData = z.infer<typeof urlSchema>;

export function AdvancedUrlShortener() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      isPasswordProtected: false,
      originalUrl: "",
      customCode: "",
      title: "",
      description: "",
      expiresAt: "",
      password: "",
    },
  });

  const isPasswordProtected = watch("isPasswordProtected");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to shorten URL");
      }

      const result = await response.json();
      setShortUrl(result.shortUrl);
      setQrCodeUrl(result.shortUrl);
      toast.success("URL shortened successfully!");
      reset();
      setValue("isPasswordProtected", false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link2 className="h-6 w-6 text-primary mr-2" />
            <CardTitle>Shorten Your URL</CardTitle>
          </div>
          {session && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvanced ? "Basic" : "Advanced"}
            </Button>
          )}
        </div>
        <CardDescription>
          {session
            ? "Create and manage your short links with advanced features"
            : "Create short links (sign in for advanced features)"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="originalUrl">Original URL *</Label>
            <Input
              {...register("originalUrl")}
              id="originalUrl"
              placeholder="https://example.com/very-long-url"
              className={errors.originalUrl ? "border-destructive" : ""}
            />
            {errors.originalUrl && (
              <p className="text-sm text-destructive">
                {errors.originalUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customCode">Custom Short Code (Optional)</Label>
            <div className="relative">
              <Input
                {...register("customCode")}
                id="customCode"
                placeholder="my-custom-link"
                className={errors.customCode ? "border-destructive" : ""}
              />
              <Sparkles className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.customCode && (
              <p className="text-sm text-destructive">
                {errors.customCode.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Leave empty to generate a random short code
            </p>
          </div>

          {session && showAdvanced && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  {...register("title")}
                  id="title"
                  placeholder="My awesome link"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  {...register("description")}
                  id="description"
                  placeholder="Link description for better organization"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                <div className="relative">
                  <Input
                    {...register("expiresAt")}
                    id="expiresAt"
                    type="datetime-local"
                  />
                  <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Password Protection */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPasswordProtected"
                    checked={isPasswordProtected || false}
                    onCheckedChange={(checked) =>
                      setValue("isPasswordProtected", checked)
                    }
                  />
                  <Label
                    htmlFor="isPasswordProtected"
                    className="flex items-center"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Password Protection
                  </Label>
                </div>

                {isPasswordProtected && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        {...register("password")}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter a strong password"
                        className={
                          errors.password ? "border-destructive pr-10" : "pr-10"
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Users will need this password to access the link
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Shortening...
              </>
            ) : (
              "Shorten URL"
            )}
          </Button>
        </form>

        {shortUrl && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-semibold text-sm mb-3">Your Short URL</h3>
            <div className="flex items-center gap-2">
              <Input
                value={shortUrl}
                readOnly
                className="font-mono text-primary"
              />
              <Button onClick={copyToClipboard} size="sm">
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <QRCodeDialog url={qrCodeUrl} />
              <Button asChild size="sm" variant="outline">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open short URL in a new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
