package com.lynxiglam.store.collection;

import com.lynxiglam.store.common.dto.Dtos.CollectionDto;
import com.lynxiglam.store.common.dto.Dtos.NavColumnDto;
import com.lynxiglam.store.common.dto.Dtos.NavFeaturedDto;
import com.lynxiglam.store.common.dto.Dtos.NavItemDto;
import com.lynxiglam.store.common.dto.Dtos.NavLinkDto;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CollectionService {
    private final NamedParameterJdbcTemplate jdbc;

    public CollectionService(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<CollectionDto> collections() {
        List<CollectionBase> bases = jdbc.query(
                "SELECT handle, title, description, image FROM collections ORDER BY position",
                Map.of(),
                (rs, rowNum) -> new CollectionBase(
                        rs.getString("handle"), rs.getString("title"), rs.getString("description"), rs.getString("image")
                )
        );
        Map<String, List<String>> products = productsByCollection();
        return bases.stream().map(base -> new CollectionDto(
                base.handle(), base.title(), base.description(), base.image(),
                products.getOrDefault(base.handle(), List.of())
        )).toList();
    }

    public Optional<CollectionDto> collection(String handle) {
        return collections().stream().filter(collection -> collection.handle().equals(handle)).findFirst();
    }

    public List<String> handles() {
        return jdbc.queryForList("SELECT handle FROM collections ORDER BY position", Map.of(), String.class);
    }

    public List<NavItemDto> navigation() {
        List<NavItemBase> items = jdbc.query(
                "SELECT id, label, href FROM navigation_items ORDER BY position",
                Map.of(),
                (rs, rowNum) -> new NavItemBase(rs.getLong("id"), rs.getString("label"), rs.getString("href"))
        );
        if (items.isEmpty()) return List.of();
        List<Long> itemIds = items.stream().map(NavItemBase::id).toList();
        MapSqlParameterSource params = new MapSqlParameterSource("itemIds", itemIds);

        List<NavColumnBase> columns = jdbc.query(
                "SELECT id, navigation_item_id, heading FROM navigation_columns " +
                        "WHERE navigation_item_id IN (:itemIds) ORDER BY navigation_item_id, position",
                params,
                (rs, rowNum) -> new NavColumnBase(
                        rs.getLong("id"), rs.getLong("navigation_item_id"), rs.getString("heading")
                )
        );
        Map<Long, List<NavLinkDto>> linksByColumn = new LinkedHashMap<>();
        if (!columns.isEmpty()) {
            List<Long> columnIds = columns.stream().map(NavColumnBase::id).toList();
            jdbc.query(
                    "SELECT navigation_column_id, label, href FROM navigation_links " +
                            "WHERE navigation_column_id IN (:columnIds) ORDER BY navigation_column_id, position",
                    new MapSqlParameterSource("columnIds", columnIds),
                    rs -> {
                        linksByColumn.computeIfAbsent(rs.getLong("navigation_column_id"), ignored -> new ArrayList<>())
                                .add(new NavLinkDto(rs.getString("label"), rs.getString("href")));
                    }
            );
        }
        Map<Long, List<NavColumnDto>> columnsByItem = new LinkedHashMap<>();
        columns.forEach(column -> columnsByItem.computeIfAbsent(column.itemId(), ignored -> new ArrayList<>())
                .add(new NavColumnDto(column.heading(), linksByColumn.getOrDefault(column.id(), List.of()))));

        Map<Long, List<NavFeaturedDto>> featuredByItem = new LinkedHashMap<>();
        jdbc.query(
                "SELECT navigation_item_id, label, image, href FROM navigation_featured " +
                        "WHERE navigation_item_id IN (:itemIds) ORDER BY navigation_item_id, position",
                params,
                rs -> {
                    featuredByItem.computeIfAbsent(rs.getLong("navigation_item_id"), ignored -> new ArrayList<>())
                            .add(new NavFeaturedDto(rs.getString("label"), rs.getString("image"), rs.getString("href")));
                }
        );

        return items.stream().map(item -> new NavItemDto(
                item.label(), item.href(), columnsByItem.get(item.id()), featuredByItem.get(item.id())
        )).toList();
    }

    private Map<String, List<String>> productsByCollection() {
        Map<String, List<String>> result = new LinkedHashMap<>();
        jdbc.query(
                "SELECT pc.collection_handle, p.handle FROM product_collections pc " +
                        "JOIN products p ON p.id = pc.product_id ORDER BY pc.collection_handle, pc.position",
                rs -> {
                    result.computeIfAbsent(rs.getString("collection_handle"), ignored -> new ArrayList<>())
                            .add(rs.getString("handle"));
                }
        );
        return result;
    }

    private record CollectionBase(String handle, String title, String description, String image) {}
    private record NavItemBase(long id, String label, String href) {}
    private record NavColumnBase(long id, long itemId, String heading) {}
}
