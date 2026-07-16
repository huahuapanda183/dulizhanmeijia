package com.lynxiglam.store.admin;

/** HttpSession attribute keys for an authenticated admin. Kept distinct from the
 *  customer session attributes so a browser could hold both independently. */
public final class AdminSession {
    public static final String ID_ATTRIBUTE = "adminId";
    public static final String EMAIL_ATTRIBUTE = "adminEmail";
    public static final String ROLE = "ROLE_ADMIN";

    private AdminSession() {}
}
