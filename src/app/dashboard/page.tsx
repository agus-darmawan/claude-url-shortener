import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { DashboardHeader } from "@/components/dashboard/header";
import { UrlList } from "@/components/dashboard/url-list";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name}! Here's an overview of your links
            and analytics.
          </p>
        </div>

        <AnalyticsDashboard />
        <UrlList />
      </main>
    </div>
  );
}
