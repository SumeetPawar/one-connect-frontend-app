import { refreshAccessToken } from "@/lib/auth";

// Helper: get VAPID public key from backend or config
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BMmVTo0GaTfa9QJSmxlmXrE3ukC6wfZKBRgxxkjBBpvEfBK8-9iNOSGxH04kZPaKCuRccatRgPGlrxnGDIr0O0Y';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "https://cbiqa.dev.honeywellcloud.com/socialapi";

const PUSH_SUBSCRIBE_URL = `${API_BASE_URL}/api/push/subscribe`;
console.log('PUSH_SUBSCRIBE_URL:', PUSH_SUBSCRIBE_URL);
// Convert base64 public key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const normalized = base64String.padEnd(base64String.length + (4 - base64String.length % 4) % 4, '=')
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const binary = atob(normalized);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// Register the service worker for PWA and push notifications
export function registerServiceWorker(onPushSubscription?: (sub: PushSubscription) => void) {
    console.log("[registerServiceWorker] Starting registration...");
    if (typeof window === 'undefined') {
        console.warn("[registerServiceWorker] Not running in browser context.");
        return;
    }
    if (!('serviceWorker' in navigator)) {
        console.warn("[registerServiceWorker] Service workers not supported in this browser.");
        return;
    }
    console.log("[registerServiceWorker] Service workers supported.");
    window.addEventListener('load', () => {
        console.log("[registerServiceWorker] Window loaded, registering service worker...");
        navigator.serviceWorker.register('/service-worker.js')
            .then(async reg => {
                console.log('[registerServiceWorker] Service worker registered:', reg);
                console.log('[registerServiceWorker] Notification permission:', Notification.permission);
                if (Notification.permission === 'default') {
                    console.log('[registerServiceWorker] Requesting notification permission...');
                    await Notification.requestPermission();
                    console.log('[registerServiceWorker] New notification permission:', Notification.permission);
                }
                if (Notification.permission !== 'granted') {
                    console.warn('[registerServiceWorker] Notification permission not granted. Push will not work.');
                    return;
                }
                if (!VAPID_PUBLIC_KEY) {
                    console.error('[registerServiceWorker] VAPID_PUBLIC_KEY missing.');
                    return;
                }
                console.log('[registerServiceWorker] Using VAPID_PUBLIC_KEY:', VAPID_PUBLIC_KEY);
                let sub = null;
                try {
                    sub = await reg.pushManager.getSubscription();
                    if (sub) {
                        console.log('[registerServiceWorker] Existing push subscription found:', sub);
                    } else {
                        console.log('[registerServiceWorker] No push subscription, subscribing...');
                        sub = await reg.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
                        });
                        console.log('[registerServiceWorker] New push subscription:', sub);
                    }
                } catch (err) {
                    console.error('[registerServiceWorker] Error during push subscription:', err);
                    return;
                }
                // Send subscription to backend
                try {
                    const token = localStorage.getItem("access_token");
                    if (!token) {
                        console.warn('[registerServiceWorker] No auth token available, skipping push subscription save');
                        if (onPushSubscription) onPushSubscription(sub);
                        return;
                    }
                    const sendSubscription = async (accessToken: string) => {
                        console.log('[registerServiceWorker] Sending subscription to backend with token:', accessToken);
                        return fetch(PUSH_SUBSCRIBE_URL, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${accessToken}`
                            },
                            body: JSON.stringify({
                                endpoint: sub.endpoint,
                                keys: {
                                    p256dh: sub.toJSON().keys?.p256dh,
                                    auth: sub.toJSON().keys?.auth
                                }
                            })
                        });
                    };
                    let response = await sendSubscription(token);
                    console.log('[registerServiceWorker] Backend response status:', response.status);
                    if (response.status === 401) {
                        console.warn('[registerServiceWorker] Token expired, refreshing...');
                        const refreshed = await refreshAccessToken();
                        if (refreshed) {
                            const newToken = localStorage.getItem("access_token");
                            if (newToken) {
                                response = await sendSubscription(newToken);
                                console.log('[registerServiceWorker] Backend response after refresh:', response.status);
                            }
                        }
                    }
                    if (response.ok) {
                        console.log('[registerServiceWorker] Push subscription saved to backend');
                    } else if (response.status === 401) {
                        console.error('[registerServiceWorker] Authentication failed after refresh, redirecting to login...');
                        window.location.href = "/socialapp/login";
                        return;
                    } else {
                        console.error('[registerServiceWorker] Failed to save subscription to backend:', await response.text());
                    }
                } catch (error) {
                    console.error('[registerServiceWorker] Error saving subscription to backend:', error);
                }
                if (onPushSubscription) onPushSubscription(sub);
            })
            .catch(err => {
                console.error('[registerServiceWorker] Service worker registration failed:', err);
            });
    });
}

