import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Tactyqal Labs",
  // The admin area must never be indexed.
  robots: { index: false, follow: false },
};

/**
 * Wraps the sign-in page as well as the dashboard, so it carries only the
 * metadata. The dashboard chrome lives in the (dashboard) route group, which
 * the sign-in page is deliberately outside of.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
