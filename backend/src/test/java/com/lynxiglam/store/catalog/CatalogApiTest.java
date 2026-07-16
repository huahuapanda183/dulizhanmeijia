package com.lynxiglam.store.catalog;

import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

class CatalogApiTest extends AbstractIntegrationTest {

    /** Query with proper param encoding (facet values may contain spaces). */
    private JsonNode getProducts(String key, String value) throws Exception {
        return mapper.readTree(mvc.perform(get("/products").param(key, value))
                .andReturn().getResponse().getContentAsString());
    }

    @Test
    void listsAvailableProductsAndPaginates() throws Exception {
        JsonNode all = getJson("/products");
        assertTrue(all.isArray());
        assertTrue(all.size() >= 30, "seed should expose the full catalog");
        for (JsonNode p : all) assertTrue(p.get("available").asBoolean());

        JsonNode firstPage = getJson("/products?page=1&pageSize=5");
        assertEquals(5, firstPage.size());
        JsonNode secondPage = getJson("/products?page=2&pageSize=5");
        assertFalse(firstPage.get(0).get("handle").asText().equals(secondPage.get(0).get("handle").asText()));

        assertEquals(3, getJson("/products?limit=3").size());
    }

    @Test
    void filtersByCollection() throws Exception {
        JsonNode handles = getJson("/collections/handles");
        String collection = handles.get(0).asText();
        JsonNode scoped = getJson("/products?collection=" + collection);
        assertTrue(scoped.size() > 0);
        for (JsonNode p : scoped) {
            boolean inCollection = false;
            for (JsonNode c : p.get("collections")) if (c.asText().equals(collection)) inCollection = true;
            assertTrue(inCollection, p.get("handle").asText() + " should belong to " + collection);
        }
    }

    @Test
    void searchMatchesTitleShapeOrTag() throws Exception {
        JsonNode first = getJson("/products").get(0);
        String word = first.get("title").asText().split("\\s+")[0];
        JsonNode results = getJson("/products?search=" + word);
        boolean found = false;
        for (JsonNode p : results) if (p.get("handle").asText().equals(first.get("handle").asText())) found = true;
        assertTrue(found, "search for '" + word + "' should return " + first.get("handle").asText());
    }

    @Test
    void filtersByShapeAndTagFromFacets() throws Exception {
        JsonNode facets = getJson("/products/facets");
        String shape = facets.get("shapes").get(0).get("value").asText();
        JsonNode byShape = getProducts("shapes", shape);
        assertTrue(byShape.size() > 0, "expected products for shape " + shape);
        for (JsonNode p : byShape) assertEquals(shape, p.get("shape").asText());

        String tag = facets.get("tags").get(0).get("value").asText();
        JsonNode byTag = getProducts("tags", tag);
        assertTrue(byTag.size() > 0, "expected products for tag " + tag);
        for (JsonNode p : byTag) {
            boolean tagged = false;
            for (JsonNode t : p.get("tags")) if (t.asText().equals(tag)) tagged = true;
            assertTrue(tagged);
        }
    }

    @Test
    void sortsByPriceAscending() throws Exception {
        JsonNode sorted = getJson("/products?sort=price-asc");
        double prev = -1;
        for (JsonNode p : sorted) {
            double price = p.get("price").asDouble();
            assertTrue(price >= prev, "price-asc must be non-decreasing");
            prev = price;
        }
    }

    @Test
    void priceRangeFilterNarrowsResults() throws Exception {
        JsonNode facets = getJson("/products/facets");
        int max = facets.get("priceRange").get("max").asInt();
        int mid = Math.max(1, max / 2);
        JsonNode cheap = getJson("/products?priceMax=" + mid);
        for (JsonNode p : cheap) assertTrue(p.get("price").asDouble() <= mid);
    }

    @Test
    void facetsPriceRangeUsesWholeUnitBounds() throws Exception {
        JsonNode range = getJson("/products/facets").get("priceRange");
        double min = range.get("min").asDouble();
        double max = range.get("max").asDouble();
        assertTrue(min <= max);
        // Aligned with the mock: floored min / ceiled max => integral major units.
        assertEquals(Math.floor(min), min);
        assertEquals(Math.ceil(max), max);
    }

    @Test
    void recommendationsExcludeSelfAndRespectLimit() throws Exception {
        String handle = getJson("/products").get(0).get("handle").asText();
        JsonNode recs = getJson("/products/" + handle + "/recommendations?limit=4");
        assertTrue(recs.size() <= 4);
        for (JsonNode p : recs) assertFalse(p.get("handle").asText().equals(handle));
    }

    @Test
    void batchPreservesOrderAndDropsMissing() throws Exception {
        JsonNode products = getJson("/products");
        String a = products.get(0).get("handle").asText();
        String b = products.get(1).get("handle").asText();
        JsonNode batch = getJson("/products/batch?handle=" + b + "&handle=" + a + "&handle=__missing__");
        assertEquals(2, batch.size());
        assertEquals(b, batch.get(0).get("handle").asText());
        assertEquals(a, batch.get(1).get("handle").asText());
    }
}
