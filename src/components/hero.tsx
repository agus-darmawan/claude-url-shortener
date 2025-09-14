import { BarChart3, Link2, Shield, Zap } from "lucide-react";

export function Hero() {
  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-6 shadow-lg">
        <Link2 size={32} className="text-primary-foreground" />
      </div>

      <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
        Professional URL Shortener
      </h1>

      <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        Create short, memorable links with powerful analytics, QR codes, and
        advanced management features. Perfect for businesses and professionals.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Lightning Fast</h3>
          <p className="text-sm text-muted-foreground">
            Instant link generation with reliable redirects worldwide
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Advanced Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Track clicks, countries, devices, and browsers with detailed
            insights
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Secure & Reliable</h3>
          <p className="text-sm text-muted-foreground">
            Enterprise-grade security with 99.9% uptime guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
