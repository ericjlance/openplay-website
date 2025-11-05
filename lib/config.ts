export const SITE_CONFIG = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  exportUrl: process.env.EXPORT_URL || process.env.NEXT_PUBLIC_EXPORT_URL || "https://openplay.replit.app/api/export",
  fallbackExportUrl: process.env.FALLBACK_EXPORT_URL || "",
  title: "OpenPlay Pickleball Directory",
  description: "Find open play / drop-in pickleball courts near you.",
  canonical: (path = "") => {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
  },
};
