import { Link } from "lucide-react";
import { Stats } from "@/components/stats";
import { UrlList } from "@/components/url-list";
import { UrlShortener } from "@/components/url-shortener";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full mr-4">
              <Link className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              URL Shortener
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create custom short links or generate random ones. Fast, secure, and
            reliable URL shortening service.
          </p>
        </header>

        <Stats />

        <div className="max-w-4xl mx-auto mb-12">
          <UrlShortener />
        </div>

        <div className="max-w-6xl mx-auto">
          <UrlList />
        </div>
      </div>
    </div>
  );
}
