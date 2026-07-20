package com.lynxiglam.store.account;

/** HttpSession attribute key for a signed-in customer. Kept next to the admin
 *  keys ({@code AdminSession}) because both halves share one HttpSession: a
 *  browser can be signed in as a shopper and as an admin at the same time, so
 *  neither sign-out may destroy the whole session. */
public final class CustomerSession {
    public static final String ID_ATTRIBUTE = "customerId";

    private CustomerSession() {}
}
