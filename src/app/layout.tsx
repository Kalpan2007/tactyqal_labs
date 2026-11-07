import type { Metadata, Viewport } from "next";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  // Makes every relative `alternates`/`openGraph` URL in the app absolute.
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tactyqal Labs | Your teen builds a real app in 8 weeks",
    template: "%s | Tactyqal Labs",
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: { canonical: "/" },
  keywords: [
    "startup mentoring for teens",
    "teen entrepreneurship programme",
    "build an app without coding",
    "young founders",
    "Tactyqal Labs",
  ],
  openGraph: {
    type: "website",
    siteName,
    title: "Your teen builds a real app in 8 weeks",
    description: siteDescription,
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your teen builds a real app in 8 weeks",
    description: siteDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1b1b" },
  ],
  colorScheme: "light",
};

const organisationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  email: "tactyqal.labs@gmail.com",
  telephone: "+91-98047-72106",
  sameAs: ["https://tactyqal.com"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          // Static, written by us: no user input is interpolated here.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
        />
      </body>
    </html>
  );
}
