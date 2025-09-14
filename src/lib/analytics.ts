import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

interface AnalyticsData {
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
}

export function parseAnalytics(
  userAgent: string,
  ipAddress: string,
  referer?: string,
): AnalyticsData {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Get geo location
  const geo = geoip.lookup(ipAddress);

  return {
    ipAddress,
    userAgent,
    referer,
    country: geo?.country || "Unknown",
    city: geo?.city || "Unknown",
    device: result.device.type || "Desktop",
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
  };
}
