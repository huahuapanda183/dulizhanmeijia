package com.lynxiglam.store.analytics;

import com.lynxiglam.store.common.NotFoundException;
import com.lynxiglam.store.common.dto.Dtos.AnalyticsSummaryDto;
import com.lynxiglam.store.common.dto.Dtos.ProductAnalyticsDto;
import com.lynxiglam.store.common.dto.Dtos.TrackEventRequest;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AnalyticsService {
    private static final Set<String> TYPES = Set.of("view", "click", "add");
    private final NamedParameterJdbcTemplate jdbc;

    public AnalyticsService(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void track(TrackEventRequest event) {
        if (!TYPES.contains(event.type())) throw new IllegalArgumentException("Unknown analytics event type.");

        // Resolve the title from the catalog — never from the request body. This
        // endpoint is unauthenticated, and the previous `title = VALUES(title)` wrote
        // caller-supplied text straight into the admin report: anyone could POST a
        // title and change what an admin sees for that product (and a >255-char value
        // additionally errored under strict mode). Fetching the title here also
        // replaces the separate EXISTS check — one query instead of two, and an
        // unknown handle still 404s.
        List<String> titles = jdbc.queryForList(
                "SELECT title FROM products WHERE handle = :handle",
                new MapSqlParameterSource("handle", event.handle()), String.class
        );
        if (titles.isEmpty()) throw new NotFoundException("Product not found: " + event.handle());
        String title = titles.getFirst();

        String counter = switch (event.type()) {
            case "view" -> "views";
            case "click" -> "clicks";
            case "add" -> "adds";
            default -> throw new IllegalArgumentException("Unknown analytics event type.");
        };
        String sql = "INSERT INTO analytics_daily (product_handle, title, day, " + counter + ") " +
                "VALUES (:handle, :title, :day, 1) ON DUPLICATE KEY UPDATE " +
                counter + " = " + counter + " + 1, title = VALUES(title)";
        jdbc.update(sql, new MapSqlParameterSource()
                .addValue("handle", event.handle()).addValue("title", title)
                .addValue("day", LocalDate.now(ZoneOffset.UTC)));
    }

    public AnalyticsSummaryDto summary() {
        List<ProductAnalyticsDto> products = jdbc.query(
                "SELECT product_handle, MAX(title) title, SUM(views) views, SUM(clicks) clicks, SUM(adds) adds " +
                        "FROM analytics_daily GROUP BY product_handle ORDER BY views DESC, clicks DESC",
                Map.of(),
                (rs, rowNum) -> new ProductAnalyticsDto(
                        rs.getString("product_handle"), rs.getString("title"), rs.getLong("views"),
                        rs.getLong("clicks"), rs.getLong("adds")
                )
        );
        return new AnalyticsSummaryDto(
                products.stream().mapToLong(ProductAnalyticsDto::views).sum(),
                products.stream().mapToLong(ProductAnalyticsDto::clicks).sum(),
                products.stream().mapToLong(ProductAnalyticsDto::adds).sum(),
                products
        );
    }
}
