"use client";

import { Eye, Link2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface Stats {
  totalUrls: number;
  totalClicks: number;
  averageClicks: number;
}

export function Stats() {
  const [stats, setStats] = useState<Stats>({
    totalUrls: 0,
    totalClicks: 0,
    averageClicks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error(error);
        console.error("Failed to fetch stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-lg animate-pulse"
          >
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total URLs</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalUrls}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Link2 className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Clicks</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalClicks}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Eye className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Clicks</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.averageClicks.toFixed(1)}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
