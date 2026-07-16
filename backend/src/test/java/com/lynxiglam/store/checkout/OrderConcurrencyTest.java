package com.lynxiglam.store.checkout;

import com.lynxiglam.store.common.dto.Dtos.AddressDto;
import com.lynxiglam.store.common.dto.Dtos.OrderDto;
import com.lynxiglam.store.common.dto.Dtos.OrderInputDto;
import com.lynxiglam.store.common.dto.Dtos.OrderLineInputDto;
import com.lynxiglam.store.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Exercises order creation directly against the transactional service + H2 from
 * many threads (MockMvc is single-threaded), asserting the idempotency-key unique
 * constraint prevents a duplicate order under concurrent submission.
 */
class OrderConcurrencyTest extends AbstractIntegrationTest {
    @Autowired
    CheckoutService checkout;

    private OrderInputDto order(String handle, String key) {
        AddressDto address = new AddressDto("A", "B", "buyer@example.com", null, "1 St", null, "NY", "NY", "10001", "US");
        return new OrderInputDto(List.of(new OrderLineInputDto(handle, 1)), "buyer@example.com", address, "standard", null, key);
    }

    @Test
    void concurrentDuplicateSubmissionsCreateOneOrder() throws Exception {
        String handle = jdbc.queryForObject("SELECT handle FROM products ORDER BY featured_position LIMIT 1", String.class);
        String key = "concurrent-key";
        int threads = 8;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch start = new CountDownLatch(1);
        ConcurrentLinkedQueue<String> numbers = new ConcurrentLinkedQueue<>();
        AtomicInteger ok = new AtomicInteger();
        AtomicInteger failed = new AtomicInteger();
        var futures = new java.util.ArrayList<java.util.concurrent.Future<?>>();
        for (int i = 0; i < threads; i++) {
            futures.add(pool.submit(() -> {
                try {
                    start.await();
                    OrderDto order = checkout.createOrder(order(handle, key));
                    numbers.add(order.number());
                    ok.incrementAndGet();
                } catch (Exception e) {
                    failed.incrementAndGet(); // a conflicting loser may throw; the invariant is one row
                }
            }));
        }
        start.countDown();
        for (var f : futures) f.get(30, TimeUnit.SECONDS);
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);

        Integer rows = jdbc.queryForObject("SELECT COUNT(*) FROM orders WHERE idempotency_key = ?", Integer.class, key);
        assertEquals(1, rows, "exactly one order row must exist for the shared idempotency key");
        assertTrue(ok.get() >= 1, "at least one submission should succeed");
        assertEquals(1, numbers.stream().distinct().count(), "all successful submissions must reference the same order");
    }
}
