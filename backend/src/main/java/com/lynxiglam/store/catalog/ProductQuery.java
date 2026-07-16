package com.lynxiglam.store.catalog;

import java.math.BigDecimal;
import java.util.List;

public record ProductQuery(
        String collection,
        String search,
        String sort,
        List<String> shapes,
        List<String> tags,
        BigDecimal priceMin,
        BigDecimal priceMax,
        Boolean inStock,
        Integer page,
        Integer pageSize,
        Integer limit
) {}
