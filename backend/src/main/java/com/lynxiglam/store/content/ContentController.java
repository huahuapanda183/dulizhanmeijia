package com.lynxiglam.store.content;

import com.lynxiglam.store.common.NotFoundException;
import com.lynxiglam.store.common.dto.Dtos.BlogPostDto;
import com.lynxiglam.store.common.dto.Dtos.PageDto;
import com.lynxiglam.store.common.dto.Dtos.ReviewDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ContentController {
    private final ContentService content;

    public ContentController(ContentService content) {
        this.content = content;
    }

    @GetMapping("/reviews")
    List<ReviewDto> reviews(@RequestParam(required = false, name = "product") String productHandle) {
        return content.reviews(productHandle);
    }

    @GetMapping("/pages/slugs")
    List<String> pageSlugs() {
        return content.pageSlugs();
    }

    @GetMapping("/pages/{slug}")
    PageDto page(@PathVariable String slug) {
        return content.page(slug).orElseThrow(() -> new NotFoundException("Page not found: " + slug));
    }

    @GetMapping("/blog")
    List<BlogPostDto> blog() {
        return content.blogPosts();
    }

    @GetMapping("/blog/{handle}")
    BlogPostDto blogPost(@PathVariable String handle) {
        return content.blogPost(handle).orElseThrow(() -> new NotFoundException("Blog post not found: " + handle));
    }
}
