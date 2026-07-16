package com.lynxiglam.store.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class Money {
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private Money() {}

    public static BigDecimal fromCents(long cents) {
        return BigDecimal.valueOf(cents, 2);
    }

    public static int toCents(BigDecimal amount) {
        if (amount == null) return 0;
        return amount.multiply(ONE_HUNDRED).setScale(0, RoundingMode.HALF_UP).intValueExact();
    }

    public static int percentage(int cents, int percentage) {
        return BigDecimal.valueOf(cents)
                .multiply(BigDecimal.valueOf(percentage))
                .divide(ONE_HUNDRED, 0, RoundingMode.HALF_UP)
                .intValueExact();
    }

    public static int tax(int taxableCents, BigDecimal rate) {
        return BigDecimal.valueOf(taxableCents)
                .multiply(rate)
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
    }
}
