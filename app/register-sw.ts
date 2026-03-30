/**
 * register-sw.ts
 *
 * Architecture:
 *   1. Register SW.
 *   2. Check existing subscription — if legacy FCM endpoint, force-refresh.
 *   3. If Chrome STILL returns a legacy endpoint after resubscribing (Chrome caches
 *      the old GCM association on the SW registration itself), fully unregister the
 *      SW, re-register it, then subscribe fresh. This breaks the GCM cache.
 *   4. Always POST the current subscription to the backend so the DB stays in sync.
 */

import { refreshAccessToken } from "@/lib/auth";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BBGIk82UNc0G9L_Y7cp0Ef4E7Oir10lslda-EqzS7A6RhP0J-el69tn28yYdFPk6pQN81K5oCtzX6H6pyb7BJvUw";
console.log("[SW] NEXT_PUBLIC_VAPID_PUBLIC_KEY env:", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "(unset — using fallback)");
console.log("[SW] VAPID_PUBLIC_KEY value:", VAPID_PUBLIC_KEY);

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://cbiqa.dev.honeywellcloud.com/socialapi"
).replace(/\/$/, "");

const PUSH_SUBSCRIBE_URL = `${API_BASE}/api/push/subscribe`;

// ── Utils ─────────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(b64: string): Uint8Array {
  const pad = b64.length % 4;
  const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function isLegacyEndpoint(endpoint: string) {
  return endpoint.includes("fcm.googleapis.com/fcm/send/");
}

async function subscribeFresh(reg: ServiceWorkerRegistration): Promise<PushSubscription> {
  // Unsubscribe any existing push subscription first
  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    await existing.unsubscribe();
    console.log("[SW] Unsubscribed old push subscription.");
  }
  const keyBytes = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  console.log("[SW] subscribeFresh — VAPID key:", VAPID_PUBLIC_KEY, "decoded bytes:", keyBytes.length);
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: keyBytes as BufferSource,
  });
}

async function getCleanRegistration(): Promise<ServiceWorkerRegistration> {
  // Fully unregister every SW on this scope to break Chrome's cached GCM association,
  // then re-register a fresh one. This is the only way to force a new endpoint format.
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const r of registrations) {
    console.log("[SW] Unregistering SW:", r.scope);
    await r.unregister();
  }
  const reg = await navigator.serviceWorker.register("/socialapp/service-worker.js", { scope: "/socialapp/" });
  await navigator.serviceWorker.ready;
  console.log("[SW] Re-registered SW:", reg.scope);
  return reg;
}

async function postToBackend(sub: PushSubscription, token: string): Promise<Response> {
  const j = sub.toJSON();
  return fetch(PUSH_SUBSCRIBE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ endpoint: sub.endpoint, keys: { p256dh: j.keys?.p256dh, auth: j.keys?.auth } }),
  });
}

// ── iOS helpers ───────────────────────────────────────────────────────────────

/** Returns true if the browser is iOS Safari (or Chrome/Firefox on iOS). */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ reports itself as Mac, check for touch support too
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

/**
 * Returns true when the web app is running in standalone mode
 * (i.e. launched from the iOS Home Screen, not from Safari browser).
 * Push notifications on iOS ONLY work in this mode.
 */
export function isIOSStandalone(): boolean {
  // navigator.standalone is an Apple-specific property
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

// ── Main ──────────────────────────────────────────────────────────────────────

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  // ── User explicitly disabled notifications — respect their choice ─────────
  if (localStorage.getItem("notifications_user_disabled") === "1") {
    console.log("[SW] User disabled notifications — skipping auto-subscribe");
    return;
  }

  // ── iOS guard ────────────────────────────────────────────────────────────
  // iOS Safari 16.4+ supports Web Push ONLY when the PWA is installed and
  // opened from the Home Screen (standalone mode). Running inside Safari
  // browser does NOT support push subscriptions — bail early so the user
  // sees the in-app "Add to Home Screen" prompt instead.
  if (isIOS() && !isIOSStandalone()) {
    console.warn(
      "[SW] iOS detected but app is not running in standalone mode.\n" +
      "Push notifications require the app to be installed via:\n" +
      "Safari → Share button → 'Add to Home Screen'"
    );
    return;  // The <IOSInstallPrompt> component will guide the user.
  }

  // 1. Register
  let reg: ServiceWorkerRegistration;
  try {
    reg = await navigator.serviceWorker.register("/socialapp/service-worker.js", { scope: "/socialapp/" });
  } catch (err) {
    console.error("[SW] Registration failed:", err);
    return;
  }
  await navigator.serviceWorker.ready;

  // 2. Notification permission
  if (Notification.permission === "default") await Notification.requestPermission();
  if (Notification.permission !== "granted") {
    console.warn("[SW] Permission denied — push disabled");
    return;
  }

  // 3. Check for an existing subscription.
  const existingSub = await reg.pushManager.getSubscription();
  if (existingSub) {
    if (isLegacyEndpoint(existingSub.endpoint)) {
      // Legacy FCM send endpoint — attempt ONE reset to get a modern endpoint.
      // If Chrome still returns legacy after that, accept it and never reset again.
      // This prevents the bell showing "off" on every reload.
      const alreadyAttempted = localStorage.getItem("sw_legacy_reset_attempted");
      if (alreadyAttempted) {
        console.warn("[SW] Legacy endpoint — SW reset already attempted and still legacy. Accepting as-is:", existingSub.endpoint.slice(0, 60));
        // ✅ Already synced before — skip to prevent auto notification on refresh
        return;
      }
      console.warn("[SW] Legacy FCM endpoint — attempting one-time SW reset:", existingSub.endpoint.slice(0, 60));
      localStorage.setItem("sw_legacy_reset_attempted", "1");
      let sub: PushSubscription;
      try {
        reg = await getCleanRegistration();
        sub = await subscribeFresh(reg);
        console.log("[SW] Post-reset endpoint:", sub.endpoint.slice(0, 60));
      } catch (err) {
        console.error("[SW] SW reset failed:", err);
        return;
      }
      if (isLegacyEndpoint(sub.endpoint)) {
        console.warn("[SW] ⚠️ Still legacy after reset — Chrome has a stale GCM association. Will not retry. Clear site data in DevTools to fully fix.");
      } else {
        // Got a modern endpoint — clear the flag so future resets can happen if needed
        localStorage.removeItem("sw_legacy_reset_attempted");
        console.log("[SW] ✅ Legacy endpoint replaced with modern endpoint.");
      }
      await syncToBackend(sub);
      return;
    } else {
      console.log("[SW] Existing valid subscription:", existingSub.endpoint.slice(0, 60));
    }
    // Valid subscription — only sync if not already synced (prevents auto notification on every refresh)
    const alreadySynced = localStorage.getItem("sw_subscription_synced");
    if (alreadySynced === existingSub.endpoint.slice(-20)) {
      console.log("[SW] Already synced — skipping backend sync");
      return;
    }
    await syncToBackend(existingSub);
    return;
  }

  // 4. No subscription exists — create one fresh.
  console.log("[SW] No subscription found — creating fresh subscription");
  let sub: PushSubscription;
  try {
    sub = await subscribeFresh(reg);
    console.log("[SW] New subscription endpoint:", sub.endpoint.slice(0, 60));
  } catch (err) {
    console.error("[SW] Subscribe failed:", err);
    return;
  }

  // 5. If Chrome returned a legacy endpoint on the very first subscription attempt,
  //    do ONE full SW reset to try to break the stale GCM cache.
  //    This only runs on first-time subscribe, never on subsequent page loads.
  if (isLegacyEndpoint(sub.endpoint)) {
    console.warn("[SW] Legacy endpoint on first subscribe — attempting full SW reset to clear GCM cache...");
    try {
      reg = await getCleanRegistration();
      sub = await subscribeFresh(reg);
      console.log("[SW] After SW reset:", sub.endpoint.slice(0, 60));
    } catch (err) {
      console.error("[SW] Full SW reset failed:", err);
      return;
    }
  }

  if (isLegacyEndpoint(sub.endpoint)) {
    console.warn(
      "[SW] ⚠️ Chrome still issuing legacy FCM endpoint after full SW reset.\n" +
      "Cause: browser has a stale push-service association from a previous gcm_sender_id.\n" +
      "Dev fix: DevTools → Application → Storage → Clear site data, then reload.\n" +
      "Forwarding subscription to backend anyway (backend may support legacy FCM Send API)."
    );
  }

  // 6. Sync new subscription to backend
  await syncToBackend(sub);
}

// ── Extracted backend sync helper ────────────────────────────────────────────
async function syncToBackend(sub: PushSubscription): Promise<void> {
  let token = localStorage.getItem("access_token");
  if (!token) {
    console.warn("[SW] No token — skipping backend sync");
    return;
  }

  let res = await postToBackend(sub, token);

  if (res.status === 401) {
    console.warn("[SW] Token expired — refreshing...");
    await refreshAccessToken();
    token = localStorage.getItem("access_token");
    if (token) res = await postToBackend(sub, token);
  }

  if (res.ok) {
    localStorage.setItem("sw_subscription_synced", sub.endpoint.slice(-20));
    console.log("[SW] ✅ Subscription synced. Endpoint:", sub.endpoint.slice(0, 60) + "...");
  } else {
    console.error("[SW] Backend sync failed:", res.status, await res.text());
  }
}
