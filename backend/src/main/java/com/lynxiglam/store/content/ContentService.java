package com.lynxiglam.store.content;

import com.lynxiglam.store.common.dto.Dtos.BlogPostDto;
import com.lynxiglam.store.common.dto.Dtos.FaqItemDto;
import com.lynxiglam.store.common.dto.Dtos.PageDto;
import com.lynxiglam.store.common.dto.Dtos.PageSectionDto;
import com.lynxiglam.store.common.dto.Dtos.ReviewDto;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ContentService {
    private final NamedParameterJdbcTemplate jdbc;

    public ContentService(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ReviewDto> reviews(String productHandle) {
        String sql = "SELECT id, author, rating, title, body, product_handle, product_title, product_image, verified, created_at " +
                "FROM reviews";
        MapSqlParameterSource params = new MapSqlParameterSource();
        if (productHandle != null && !productHandle.isBlank()) {
            sql += " WHERE product_handle = :productHandle";
            params.addValue("productHandle", productHandle);
        }
        sql += " ORDER BY created_at DESC";
        return jdbc.query(sql, params, (rs, rowNum) -> new ReviewDto(
                rs.getString("id"), rs.getString("author"), rs.getBigDecimal("rating"),
                rs.getString("title"), rs.getString("body"), rs.getString("product_handle"),
                rs.getString("product_title"), rs.getString("product_image"), rs.getBoolean("verified"),
                rs.getTimestamp("created_at").toInstant()
        ));
    }

    public List<String> pageSlugs() {
        return jdbc.queryForList("SELECT slug FROM pages ORDER BY slug", Map.of(), String.class);
    }

    public Optional<PageDto> page(String slug) {
        List<PageBase> pages = jdbc.query(
                "SELECT slug, title, subtitle FROM pages WHERE slug = :slug",
                new MapSqlParameterSource("slug", slug),
                (rs, rowNum) -> new PageBase(rs.getString("slug"), rs.getString("title"), rs.getString("subtitle"))
        );
        if (pages.isEmpty()) return Optional.empty();
        List<PageSectionDto> sections = new ArrayList<>();
        List<SectionBase> sectionBases = jdbc.query(
                "SELECT id, heading FROM page_sections WHERE page_slug = :slug ORDER BY position",
                new MapSqlParameterSource("slug", slug),
                (rs, rowNum) -> new SectionBase(rs.getLong("id"), rs.getString("heading"))
        );
        for (SectionBase section : sectionBases) {
            List<String> body = jdbc.queryForList(
                    "SELECT paragraph FROM page_section_body WHERE section_id = :id ORDER BY position",
                    new MapSqlParameterSource("id", section.id()), String.class
            );
            sections.add(new PageSectionDto(section.heading(), body));
        }
        List<FaqItemDto> faq = jdbc.query(
                "SELECT question, answer FROM faq_items WHERE page_slug = :slug ORDER BY position",
                new MapSqlParameterSource("slug", slug),
                (rs, rowNum) -> new FaqItemDto(rs.getString("question"), rs.getString("answer"))
        );
        PageBase page = pages.getFirst();
        return Optional.of(new PageDto(page.slug(), page.title(), page.subtitle(), sections, faq.isEmpty() ? null : faq));
    }

    public List<BlogPostDto> blogPosts() {
        List<BlogBase> bases = jdbc.query(
                "SELECT handle, title, excerpt, image, author, published_at FROM blog_posts ORDER BY published_at DESC",
                Map.of(),
                (rs, rowNum) -> new BlogBase(
                        rs.getString("handle"), rs.getString("title"), rs.getString("excerpt"),
                        rs.getString("image"), rs.getString("author"), rs.getTimestamp("published_at").toInstant()
                )
        );
        if (bases.isEmpty()) return List.of();
        List<String> handles = bases.stream().map(BlogBase::handle).toList();
        Map<String, List<String>> bodies = new LinkedHashMap<>();
        jdbc.query(
                "SELECT post_handle, paragraph FROM blog_post_body WHERE post_handle IN (:handles) ORDER BY post_handle, position",
                new MapSqlParameterSource("handles", handles),
                rs -> {
                    bodies.computeIfAbsent(rs.getString("post_handle"), ignored -> new ArrayList<>())
                            .add(rs.getString("paragraph"));
                }
        );
        return bases.stream().map(base -> new BlogPostDto(
                base.handle(), base.title(), base.excerpt(), base.image(), base.author(), base.date(),
                bodies.getOrDefault(base.handle(), List.of())
        )).toList();
    }

    public Optional<BlogPostDto> blogPost(String handle) {
        return blogPosts().stream().filter(post -> post.handle().equals(handle)).findFirst();
    }

    private record PageBase(String slug, String title, String subtitle) {}
    private record SectionBase(long id, String heading) {}
    private record BlogBase(
            String handle, String title, String excerpt, String image, String author, java.time.Instant date
    ) {}
}
