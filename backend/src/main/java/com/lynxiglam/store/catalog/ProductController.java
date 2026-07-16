package com.lynxiglam.store.catalog;

import com.lynxiglam.store.common.NotFoundException;
import com.lynxiglam.store.common.dto.Dtos.ProductDto;
import com.lynxiglam.store.common.dto.Dtos.ProductFacetsDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
public class ProductController {
    private final CatalogService catalog;

    public ProductController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/products")
    List<ProductDto> products(
            @RequestParam(required = false) String collection,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "featured") String sort,
            @RequestParam(required = false) List<String> shapes,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) BigDecimal priceMin,
            @RequestParam(required = false) BigDecimal priceMax,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(required = false) Integer limit
    ) {
        return catalog.findProducts(new ProductQuery(
                collection, search, sort, shapes, tags, priceMin, priceMax, inStock, page, pageSize, limit
        ));
    }

    @GetMapping("/products/facets")
    ProductFacetsDto facets(
            @RequestParam(required = false) String collection,
            @RequestParam(required = false) String search
    ) {
        return catalog.facets(collection, search);
    }

    @GetMapping("/products/handles")
    List<String> handles() {
        return catalog.handles();
    }

    @GetMapping("/products/batch")
    List<ProductDto> batch(@RequestParam(name = "handle") List<String> handles) {
        return catalog.findByHandles(handles);
    }

    @GetMapping("/products/{handle}/recommendations")
    List<ProductDto> recommendations(
            @PathVariable String handle,
            @RequestParam(defaultValue = "4") int limit
    ) {
        ensureExists(handle);
        return catalog.recommendations(handle, limit);
    }

    @GetMapping("/products/{handle}")
    ProductDto product(@PathVariable String handle) {
        return catalog.findProduct(handle)
                .orElseThrow(() -> new NotFoundException("Product not found: " + handle));
    }

    private void ensureExists(String handle) {
        if (catalog.findProduct(handle).isEmpty()) throw new NotFoundException("Product not found: " + handle);
    }
}
