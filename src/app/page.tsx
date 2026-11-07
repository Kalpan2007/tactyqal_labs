import { prisma } from "@/lib/db";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Programme } from "@/components/Programme";
import { Cases } from "@/components/Cases";
import { Benefits, Faq, Outcomes, Pricing, Resources, Testimonials } from "@/components/Sections";
import { Contact, Footer } from "@/components/Contact";

// Re-rendered at most once an hour; publishing a post shows up without a deploy.
export const revalidate = 3600;

const latestPostSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  readTimeMinutes: true,
  publishedAt: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
} as const;

export default async function Home() {
  // Featured posts if an editor has chosen any, otherwise the three newest.
  const featured = await prisma.post.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: latestPostSelect,
  });

  const posts =
    featured.length === 3
      ? featured
      : await prisma.post.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          take: 3,
          select: latestPostSelect,
        });

  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Programme />
        <Cases />
        <Outcomes />
        <Benefits />
        <Testimonials />
        <Pricing />
        <Resources posts={posts} />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

