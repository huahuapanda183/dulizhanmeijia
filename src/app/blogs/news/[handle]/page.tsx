import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getBlogPosts, getBlogPost } from "@/lib/api";

// Serve from cache but re-fetch every 5 minutes. Previously this page was
// prerendered at build with no refresh path at all, so newly published
// content never appeared until the next deploy.
export const revalidate = 300;

type Params = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const post = await getBlogPost(handle);
  return { title: post ? `${post.title} | LynxiGlam` : "Blog | LynxiGlam" };
}

export default async function BlogPostPage({ params }: Params) {
  const { handle } = await params;
  const post = await getBlogPost(handle);
  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <article className="mx-auto max-w-[760px] px-4 py-12 md:px-8">
          <Link href="/blogs/news" className="text-[13px] text-mauve">
            ← Back to Blog
          </Link>
          <p className="mt-4 text-[12px] text-body">{formattedDate}</p>
          <h1 className="mt-2 text-[32px] font-medium text-ink md:text-[38px]">
            {post.title}
          </h1>
          <p className="mt-2 text-[14px] text-body">By {post.author}</p>
          <div className="my-6 aspect-[16/9] overflow-hidden rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/${post.image}`}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
          {post.body.map((paragraph, i) => (
            <p key={i} className="mt-4 text-[16px] leading-relaxed text-body">
              {paragraph}
            </p>
          ))}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
