"use client";

import { Calendar, Copy, ExternalLink, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Url {
  id: string;
  originalUrl: string;
  shortCode: string;
  customCode: string | null;
  clicks: number;
  createdAt: string;
}

export function UrlList() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    fetchUrls();
  }, []);

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
        <div className="text-gray-500">
          <ExternalLink className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No URLs yet</h3>
          <p>Create your first short URL above to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent URLs</h2>
      <div className="space-y-4">
        {urls.map((url) => (
          <div
            key={url.id}
            className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <a
                    href={`/${url.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {typeof window !== "undefined"
                      ? window.location.origin
                      : ""}
                    /{url.shortCode}
                  </a>
                  {url.customCode && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-gray-600 truncate">{url.originalUrl}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {url.clicks} clicks
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(url.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(url.shortCode)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center text-sm"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </button>
                <a
                  href={url.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Visit
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
