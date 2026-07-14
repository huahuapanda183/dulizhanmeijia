import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getBlogPosts } from "@/lib/api";

export const metadata: Metadata = { title: "Blog | LynxiGlam" };

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8">
          <h1 className="heading-track text-center text-[32px] font-medium text-ink md:text-[40px] mb-10">
            The Glam Edit
          </h1>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.handle}
                href={`/blogs/news/${post.handle}`}
                className="group block"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${post.image}`}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-[12px] text-body">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <h2 className="mt-1 text-[18px] font-medium text-ink group-hover:text-mauve">
                  {post.title}
                </h2>
                <p className="mt-1 text-[14px] text-body">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
