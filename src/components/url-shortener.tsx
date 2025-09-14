"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Link2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import type { z } from "zod";
import { urlSchema } from "@/lib/validator";

type FormData = z.infer<typeof urlSchema>;

export function UrlShortener() {
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(urlSchema),
  });

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
      toast.success("URL shortened successfully!");
      reset();
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
    } catch (error) {
      console.error("Failed to copy: ", error);
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
      <div className="flex items-center mb-6">
        <Link2 className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-semibold text-gray-800">
          Shorten Your URL
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="originalUrl"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Original URL *
          </label>
          <input
            {...register("originalUrl")}
            type="url"
            id="originalUrl"
            placeholder="https://example.com/very-long-url"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          {errors.originalUrl && (
            <p className="mt-2 text-sm text-red-600">
              {errors.originalUrl.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="customCode"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Custom Short Code (Optional)
          </label>
          <div className="relative">
            <input
              {...register("customCode")}
              type="text"
              id="customCode"
              placeholder="my-custom-link"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
            />
            <Sparkles className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          {errors.customCode && (
            <p className="mt-2 text-sm text-red-600">
              {errors.customCode.message}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Leave empty to generate a random short code
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Shortening...
            </>
          ) : (
            "Shorten URL"
          )}
        </button>
      </form>

      {shortUrl && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Your Short URL
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shortUrl}
              readOnly
              title="Shortened URL"
              className="flex-1 px-4 py-3 bg-white rounded-lg border border-gray-300 font-mono text-blue-600"
            />
            <button
              type="button"
              onClick={copyToClipboard}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
