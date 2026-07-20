package com.lynxiglam.store.catalog;

import com.lynxiglam.store.common.Money;
import com.lynxiglam.store.common.dto.Dtos.FacetValueDto;
import com.lynxiglam.store.common.dto.Dtos.PriceRangeDto;
import com.lynxiglam.store.common.dto.Dtos.ProductDto;
import com.lynxiglam.store.common.dto.Dtos.ProductFacetsDto;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class CatalogService {
    /** Bounds a single response; also keeps page*pageSize well inside a long. */
    private static final int MAX_PAGE_SIZE = 200;
    private static final int MAX_PAGE = 10_000;

    private static final Map<String, String> SORTS = Map.of(
            "featured", "p.featured_position ASC",
            "price-asc", "p.price_cents ASC, p.featured_position ASC",
            "price-desc", "p.price_cents DESC, p.featured_position ASC",
            "rating", "p.rating DESC, p.review_count DESC",
            "best-selling", "p.review_count DESC, p.rating DESC",
            "newest", "p.created_at DESC, p.featured_position ASC"
    );

    private final NamedParameterJdbcTemplate jdbc;

    public CatalogService(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ProductDto> findProducts(ProductQuery query) {
        MapSqlParameterSource params = new MapSqlParameterSource();
        String where = buildWhere(query, params);
        // Append p.id so every sort is a TOTAL order. Today's data happens to have
        // no ties on featured_position, but "rating" and "best-selling" can tie, and
        // an unstable ORDER BY under LIMIT/OFFSET makes paging lose and duplicate
        // rows between pages. Correctness here must not rest on incidental data.
        String order = SORTS.getOrDefault(query.sort(), SORTS.get("featured")) + ", p.id ASC";
        StringBuilder sql = new StringBuilder(BASE_SELECT).append(where).append(" ORDER BY ").append(order);

        // Reject out-of-range paging instead of silently ignoring it. positive()
        // mapped page=0/-1 to null, which dropped the LIMIT clause entirely and
        // returned the WHOLE catalog — the opposite of what the caller asked for,
        // and an unbounded response as the catalog grows.
        requireInRange("page", query.page(), 1, MAX_PAGE);
        requireInRange("pageSize", query.pageSize(), 1, MAX_PAGE_SIZE);
        requireInRange("limit", query.limit(), 1, MAX_PAGE_SIZE);

        Integer pageSize = query.pageSize();
        Integer page = query.page();
        Integer limit = query.limit();
        if (page != null && pageSize != null) {
            // long offset: page * pageSize at the upper bounds exceeds int range.
            long offset = (long) (page - 1) * pageSize;
            params.addValue("limit", pageSize).addValue("offset", offset);
            sql.append(" LIMIT :limit OFFSET :offset");
        } else if (limit != null) {
            params.addValue("limit", limit);
            sql.append(" LIMIT :limit");
        }
        return hydrate(jdbc.query(sql.toString(), params, this::mapBase));
    }

    public Optional<ProductDto> findProduct(String handle) {
        MapSqlParameterSource params = new MapSqlParameterSource("handle", handle);
        List<ProductBase> rows = jdbc.query(BASE_SELECT + " WHERE p.handle = :handle", params, this::mapBase);
        return hydrate(rows).stream().findFirst();
    }

    public List<ProductDto> findByHandles(List<String> handles) {
        if (handles == null || handles.isEmpty()) return List.of();
        MapSqlParameterSource params = new MapSqlParameterSource("handles", handles);
        List<ProductDto> products = hydrate(jdbc.query(BASE_SELECT + " WHERE p.handle IN (:handles)", params, this::mapBase));
        Map<String, ProductDto> byHandle = new HashMap<>();
        products.forEach(product -> byHandle.put(product.handle(), product));
        return handles.stream().map(byHandle::get).filter(java.util.Objects::nonNull).toList();
    }

    public List<String> handles() {
        return jdbc.queryForList("SELECT handle FROM products ORDER BY featured_position", Map.of(), String.class);
    }

    public ProductFacetsDto facets(String collection, String search) {
        ProductQuery scope = new ProductQuery(collection, search, "featured", List.of(), List.of(), null, null, null, null, null, null);
        MapSqlParameterSource params = new MapSqlParameterSource();
        String where = buildWhere(scope, params);

        List<FacetValueDto> shapes = jdbc.query(
                "SELECT p.shape AS value, COUNT(*) AS count FROM products p " + where +
                        " GROUP BY p.shape ORDER BY count DESC, value ASC",
                params,
                (rs, rowNum) -> new FacetValueDto(rs.getString("value"), titleCase(rs.getString("value")), rs.getLong("count"))
        );

        List<FacetValueDto> tags = jdbc.query(
                "SELECT pt.tag AS value, COUNT(DISTINCT p.id) AS count FROM products p " +
                        "JOIN product_tags pt ON pt.product_id = p.id " + where +
                        " GROUP BY pt.tag ORDER BY count DESC, value ASC",
                params,
                (rs, rowNum) -> new FacetValueDto(rs.getString("value"), titleCase(rs.getString("value")), rs.getLong("count"))
        );

        Map<String, Object> range = jdbc.queryForMap(
                "SELECT COALESCE(MIN(p.price_cents), 0) AS min_price, COALESCE(MAX(p.price_cents), 0) AS max_price FROM products p " + where,
                params
        );
        long minCents = ((Number) range.get("min_price")).longValue();
        long maxCents = ((Number) range.get("max_price")).longValue();
        // Match the mock's slider bounds exactly: floor the min and ceil the max to
        // whole major units so the price filter behaves identically on both sources.
        return new ProductFacetsDto(
                shapes,
                tags,
                new PriceRangeDto(
                        BigDecimal.valueOf(Math.floorDiv(minCents, 100)),
                        BigDecimal.valueOf(Math.ceilDiv(maxCents, 100))
                )
        );
    }

    public List<ProductDto> recommendations(String handle, int requestedLimit) {
        // A negative limit used to clamp to 1 and quietly return a result; say so instead.
        if (requestedLimit < 1) throw new IllegalArgumentException("limit must be at least 1.");
        int limit = Math.min(requestedLimit, 12);
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("handle", handle).addValue("limit", limit);
        String sql = BASE_SELECT +
                " JOIN (" +
                "   SELECT candidate.product_id AS product_id, COUNT(*) AS common_collections" +
                "   FROM product_collections source" +
                "   JOIN products source_product ON source_product.id = source.product_id" +
                "   JOIN product_collections candidate ON candidate.collection_handle = source.collection_handle" +
                "   WHERE source_product.handle = :handle AND candidate.product_id <> source.product_id" +
                "   GROUP BY candidate.product_id" +
                " ) scored ON scored.product_id = p.id" +
                " WHERE p.available = TRUE" +
                " ORDER BY scored.common_collections DESC, p.rating DESC, p.featured_position ASC LIMIT :limit";
        return hydrate(jdbc.query(sql, params, this::mapBase));
    }

    private String buildWhere(ProductQuery query, MapSqlParameterSource params) {
        List<String> conditions = new ArrayList<>();
        if (!Boolean.FALSE.equals(query.inStock())) conditions.add("p.available = TRUE");
        if (query.collection() != null && !query.collection().isBlank()) {
            conditions.add("EXISTS (SELECT 1 FROM product_collections pc WHERE pc.product_id = p.id AND pc.collection_handle = :collection)");
            params.addValue("collection", query.collection());
        }
        if (query.search() != null && !query.search().isBlank()) {
            conditions.add("(LOWER(p.title) LIKE :search OR LOWER(p.shape) LIKE :search OR EXISTS " +
                    "(SELECT 1 FROM product_tags pts WHERE pts.product_id = p.id AND LOWER(pts.tag) LIKE :search))");
            params.addValue("search", "%" + query.search().toLowerCase(Locale.ROOT) + "%");
        }
        if (query.shapes() != null && !query.shapes().isEmpty()) {
            conditions.add("p.shape IN (:shapes)");
            params.addValue("shapes", query.shapes());
        }
        if (query.tags() != null && !query.tags().isEmpty()) {
            conditions.add("EXISTS (SELECT 1 FROM product_tags ptt WHERE ptt.product_id = p.id AND ptt.tag IN (:tags))");
            params.addValue("tags", query.tags());
        }
        if (query.priceMin() != null) {
            conditions.add("p.price_cents >= :priceMin");
            params.addValue("priceMin", Money.toCents(query.priceMin()));
        }
        if (query.priceMax() != null) {
            conditions.add("p.price_cents <= :priceMax");
            params.addValue("priceMax", Money.toCents(query.priceMax()));
        }
        return conditions.isEmpty() ? "" : " WHERE " + String.join(" AND ", conditions);
    }

    private List<ProductDto> hydrate(List<ProductBase> bases) {
        if (bases.isEmpty()) return List.of();
        List<String> ids = bases.stream().map(ProductBase::id).toList();
        MapSqlParameterSource params = new MapSqlParameterSource("ids", ids);
        Map<String, List<String>> images = grouped(
                "SELECT product_id, url AS value FROM product_images WHERE product_id IN (:ids) ORDER BY product_id, position",
                params
        );
        Map<String, List<String>> tags = grouped(
                "SELECT product_id, tag AS value FROM product_tags WHERE product_id IN (:ids) ORDER BY product_id, tag",
                params
        );
        Map<String, List<String>> collections = grouped(
                "SELECT product_id, collection_handle AS value FROM product_collections WHERE product_id IN (:ids) ORDER BY product_id, position",
                params
        );
        return bases.stream().map(base -> new ProductDto(
                base.id(), base.handle(), base.title(), base.shape(), Money.fromCents(base.priceCents()),
                base.compareAtPriceCents() == null ? null : Money.fromCents(base.compareAtPriceCents()),
                base.currency(), base.rating(), base.reviewCount(),
                images.getOrDefault(base.id(), List.of()), base.hoverImage(), base.video(), base.badge(),
                collections.getOrDefault(base.id(), List.of()), base.description(), base.available(),
                tags.getOrDefault(base.id(), List.of()), base.createdAt()
        )).toList();
    }

    private Map<String, List<String>> grouped(String sql, MapSqlParameterSource params) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        jdbc.query(sql, params, rs -> {
            result.computeIfAbsent(rs.getString("product_id"), ignored -> new ArrayList<>())
                    .add(rs.getString("value"));
        });
        result.replaceAll((key, value) -> Collections.unmodifiableList(value));
        return result;
    }

    private ProductBase mapBase(ResultSet rs, int rowNum) throws SQLException {
        Number compare = (Number) rs.getObject("compare_at_price_cents");
        return new ProductBase(
                rs.getString("id"), rs.getString("handle"), rs.getString("title"), rs.getString("shape"),
                rs.getLong("price_cents"), compare == null ? null : compare.longValue(), rs.getString("currency"),
                rs.getBigDecimal("rating"), rs.getLong("review_count"), rs.getString("hover_image"),
                rs.getString("video"), rs.getString("badge"), rs.getString("description"),
                rs.getBoolean("available"), rs.getTimestamp("created_at").toInstant()
        );
    }

    /** Absent is fine (the parameter is optional); present-but-out-of-range is a 400. */
    private static void requireInRange(String name, Integer value, int min, int max) {
        if (value == null) return;
        if (value < min || value > max) {
            throw new IllegalArgumentException(
                    name + " must be between " + min + " and " + max + ".");
        }
    }

    private static String titleCase(String value) {
        String[] words = value.split("\\s+");
        for (int i = 0; i < words.length; i++) {
            if (!words[i].isEmpty()) words[i] = Character.toUpperCase(words[i].charAt(0)) + words[i].substring(1);
        }
        return String.join(" ", words);
    }

    private static final String BASE_SELECT = """
            SELECT p.id, p.handle, p.title, p.shape, p.price_cents, p.compare_at_price_cents,
                   p.currency, p.rating, p.review_count, p.hover_image, p.video, p.badge,
                   p.description, p.available, p.created_at
              FROM products p
            """;

    private record ProductBase(
            String id, String handle, String title, String shape, long priceCents,
            Long compareAtPriceCents, String currency, BigDecimal rating, long reviewCount,
            String hoverImage, String video, String badge, String description,
            boolean available, Instant createdAt
    ) {}
}
