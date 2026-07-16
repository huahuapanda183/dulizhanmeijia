import type { Page, BlogPost } from "@/lib/data/types";
import { PAGES } from "@/lib/data/pages";
import { BLOG_POSTS } from "@/lib/data/blog";
import { ApiError, apiFetch, usingMock } from "./config";

export async function getPage(slug: string): Promise<Page | null> {
  if (!usingMock()) {
    try {
      return await apiFetch<Page>(`/pages/${slug}`);
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) return null;
      throw error;
    }
  }
  return PAGES.find((p) => p.slug === slug) ?? null;
}

export async function getPageSlugs(): Promise<string[]> {
  if (!usingMock()) return apiFetch<string[]>(`/pages/slugs`);
  return PAGES.map((p) => p.slug);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!usingMock()) return apiFetch<BlogPost[]>(`/blog`);
  return BLOG_POSTS;
}

export async function getBlogPost(handle: string): Promise<BlogPost | null> {
  if (!usingMock()) {
    try {
      return await apiFetch<BlogPost>(`/blog/${handle}`);
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) return null;
      throw error;
    }
  }
  return BLOG_POSTS.find((p) => p.handle === handle) ?? null;
}
