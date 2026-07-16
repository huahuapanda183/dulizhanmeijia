package com.lynxiglam.store.common;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MoneyTest {
    @Test
    void fromCentsProducesTwoScaleMajorUnits() {
        assertEquals(new BigDecimal("21.99"), Money.fromCents(2199));
        assertEquals(new BigDecimal("0.00"), Money.fromCents(0));
        assertEquals(new BigDecimal("100.00"), Money.fromCents(10000));
    }

    @Test
    void toCentsRoundsHalfUpAndHandlesNull() {
        assertEquals(2199, Money.toCents(new BigDecimal("21.99")));
        assertEquals(0, Money.toCents(null));
        // 12.995 -> 1299.5 -> HALF_UP 1300
        assertEquals(1300, Money.toCents(new BigDecimal("12.995")));
        assertEquals(1299, Money.toCents(new BigDecimal("12.994")));
    }

    @Test
    void percentageRoundsHalfUp() {
        // 2199 * 10% = 219.9 -> 220
        assertEquals(220, Money.percentage(2199, 10));
        // 2199 * 15% = 329.85 -> 330
        assertEquals(330, Money.percentage(2199, 15));
        assertEquals(0, Money.percentage(0, 10));
    }

    @Test
    void taxRoundsHalfUp() {
        assertEquals(145, Money.tax(2000, new BigDecimal("0.0725")));
        // 6500 * 0.0725 = 471.25 -> 471
        assertEquals(471, Money.tax(6500, new BigDecimal("0.0725")));
        assertEquals(0, Money.tax(0, new BigDecimal("0.0725")));
    }

    @Test
    void centRoundTripIsStable() {
        for (int cents : new int[] {0, 1, 99, 100, 2199, 12995, 99999}) {
            assertEquals(cents, Money.toCents(Money.fromCents(cents)));
        }
    }
}
