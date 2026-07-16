package com.lynxiglam.store.analytics;

import com.lynxiglam.store.common.dto.Dtos.TrackEventRequest;
import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Concurrent analytics increments must be atomic. Driven at the service layer
 * (many threads → one INSERT ... ON DUPLICATE KEY UPDATE counter) so no event
 * is lost to a read-modify-write race.
 */
class AnalyticsConcurrencyTest extends AbstractIntegrationTest {
    @Autowired
    AnalyticsService analytics;

    @Test
    void concurrentIncrementsAreAtomic() throws Exception {
        String handle = jdbc.queryForObject("SELECT handle FROM products ORDER BY featured_position LIMIT 1", String.class);
        int events = 80;
        ExecutorService pool = Executors.newFixedThreadPool(12);
        CountDownLatch start = new CountDownLatch(1);
        var futures = new ArrayList<java.util.concurrent.Future<?>>();
        for (int i = 0; i < events; i++) {
            futures.add(pool.submit(() -> {
                try {
                    start.await();
                    analytics.track(new TrackEventRequest("view", handle, "T"));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }));
        }
        start.countDown();
        for (var f : futures) f.get(30, TimeUnit.SECONDS);
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);

        Long views = jdbc.queryForObject(
                "SELECT SUM(views) FROM analytics_daily WHERE product_handle = ?", Long.class, handle);
        assertEquals((long) events, views, "all concurrent increments must be counted");
        assertEquals(1L, analytics.summary().products().stream().filter(p -> p.handle().equals(handle)).count());
    }
}
