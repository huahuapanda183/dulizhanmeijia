import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getPageSlugs } from "@/lib/api";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPageSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  return {
    title: page ? `${page.title} | LynxiGlam` : "LynxiGlam",
  };
}

export default async function InfoPage({ params }: Params) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <article className="mx-auto max-w-[820px] px-4 py-12 md:px-8 md:py-16">
          <h1 className="heading-track text-[32px] md:text-[40px] font-medium text-ink text-center">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="mt-3 text-center text-[16px] text-body">{page.subtitle}</p>
          )}

          {page.sections.map((section, i) => (
            <section key={i} className="mt-10">
              {section.heading && (
                <h2 className="text-[20px] font-semibold text-ink mb-3">{section.heading}</h2>
              )}
              {section.body.map((para, j) => (
                <p key={j} className="mt-3 text-[15px] leading-relaxed text-body">
                  {para}
                </p>
              ))}
            </section>
          ))}

          {page.faq && page.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="text-[20px] font-semibold text-ink mb-4">FAQ</h2>
              {page.faq.map((item, i) => (
                <div key={i} className="border-t border-line py-4">
                  <h3 className="text-[15px] font-medium text-ink">{item.q}</h3>
                  <p className="mt-2 text-[14px] text-body">{item.a}</p>
                </div>
              ))}
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
