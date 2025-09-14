"use client";

import { Github, Link2 } from "lucide-react";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignInForm() {
  const [providers, setProviders] = useState<Record<
    string,
    { id: string; name: string }
  > | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  const handleSignIn = async (providerId: string) => {
    setIsLoading(providerId);
    await signIn(providerId, { callbackUrl: "/dashboard" });
  };

  const handleGuestContinue = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-4 shadow-lg">
            <Link2 size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            URL Shortener Pro
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access advanced analytics and link management
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {providers && (
              <>
                {providers.google && (
                  <Button
                    onClick={() => handleSignIn("google")}
                    disabled={isLoading === "google"}
                    className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm"
                    variant="outline"
                  >
                    {isLoading === "google" ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                    ) : (
                      <FcGoogle className="w-5 h-5 mr-2" />
                    )}
                    Continue with Google
                  </Button>
                )}

                {providers.github && (
                  <Button
                    onClick={() => handleSignIn("github")}
                    disabled={isLoading === "github"}
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {isLoading === "github" ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin mr-2" />
                    ) : (
                      <Github className="w-5 h-5 mr-2" />
                    )}
                    Continue with GitHub
                  </Button>
                )}
              </>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue as guest
                </span>
              </div>
            </div>

            <Button
              onClick={handleGuestContinue}
              variant="ghost"
              className="w-full"
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
