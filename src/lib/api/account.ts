import { apiFetch, usingMock } from "./config";

export interface SubscribeInput {
  email?: string;
  phone?: string;
  consent?: boolean;
}
export interface ActionResult {
  ok: boolean;
  message: string;
}

/** Newsletter / SMS sign-up. Mock validates + succeeds; swap for a real POST. */
export async function subscribe(input: SubscribeInput): Promise<ActionResult> {
  if (!usingMock()) {
    return apiFetch<ActionResult>(`/newsletter/subscribe`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
  await delay(400);
  if (!input.email && !input.phone) return { ok: false, message: "Enter an email or phone number." };
  if (input.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email))
    return { ok: false, message: "Please enter a valid email address." };
  return { ok: true, message: "You're in! Check your inbox for your welcome offer." };
}

export interface AuthInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/** Mock auth — always “succeeds” client-side. Replace with real auth endpoints. */
export async function login(input: AuthInput): Promise<ActionResult> {
  if (!usingMock()) {
    return apiFetch<ActionResult>(`/account/login`, { method: "POST", body: JSON.stringify(input) });
  }
  await delay(500);
  if (!input.email || !input.password) return { ok: false, message: "Email and password are required." };
  return { ok: true, message: "Signed in." };
}

export async function register(input: AuthInput): Promise<ActionResult> {
  if (!usingMock()) {
    return apiFetch<ActionResult>(`/account/register`, { method: "POST", body: JSON.stringify(input) });
  }
  await delay(500);
  if (!input.email || !input.password) return { ok: false, message: "Email and password are required." };
  return { ok: true, message: "Account created." };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
