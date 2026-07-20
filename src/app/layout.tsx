import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AnalyticsRoot } from "@/components/AnalyticsRoot";
import { fetchSeoContent } from "@/lib/data-fetcher";
import { cn } from "@/lib/utils";
import "./globals.css";

const montserrat = localFont({
  src: [
    {
      path: "../fonts/montserrat/montserrat-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/montserrat/montserrat-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/montserrat/montserrat-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/montserrat/montserrat-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/montserrat/montserrat-latin-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-montserrat",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoContent();
  const metadataBase = new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://solagracia.id",
  );

  return {
    metadataBase,
    title: {
      default: seo.title,
      template: `%s | ${seo.siteName}`,
    },
    description: seo.description,
    applicationName: seo.siteName,
    icons: {
      icon: [{ url: seo.faviconUrl || "/favicon.ico", sizes: "any" }],
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      siteName: seo.siteName,
      locale: "id_ID",
      type: "website",
      ...(seo.ogImageUrl
        ? { images: [{ url: seo.ogImageUrl }] }
        : {}),
    },
    twitter: {
      card: seo.ogImageUrl ? "summary_large_image" : "summary",
      title: seo.title,
      description: seo.description,
      ...(seo.ogImageUrl ? { images: [seo.ogImageUrl] } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0c0c0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("antialiased", montserrat.variable)}>
      <body className="min-h-screen font-[family-name:var(--font-montserrat)]">
        <AnalyticsRoot>{children}</AnalyticsRoot>
      </body>
    </html>
  );
}
