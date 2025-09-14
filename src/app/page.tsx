import { getServerSession } from "next-auth/next";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { PublicStats } from "@/components/public-stats";
import { AdvancedUrlShortener } from "@/components/url-shortener-advanced";

export default async function HomePage() {
  const session = await getServerSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <main className="container mx-auto px-4 py-12 space-y-16">
        <Hero />
        <PublicStats />

        <div className="max-w-4xl mx-auto">
          <AdvancedUrlShortener />
        </div>

        {!session && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Want More Features?</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to get advanced analytics, custom domains, and link
              management
            </p>
            <a
              href="/auth/signin"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Sign In to Get Started
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
