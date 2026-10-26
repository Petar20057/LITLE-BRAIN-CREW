import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/design";

// Private funnel steps. (/support is public and carries its own noindex, so crawlers may read it.)
const PRIVATE = ["/checkout/", "/offer/", "/thank-you", "/account"];

// Search and AI crawlers we want, named on purpose. A crawler with its own group ignores "*", so each repeats the disallows.
const BOTS = [
  "Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot",
  "ClaudeBot", "Claude-SearchBot", "Claude-User", "Google-Extended", "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }, ...BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE }))],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
