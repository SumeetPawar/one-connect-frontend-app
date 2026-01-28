// Helper: get VAPID public key from backend or config
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BMmVTo0GaTfa9QJSmxlmXrE3ukC6wfZKBRgxxkjBBpvEfBK8-9iNOSGxH04kZPaKCuRccatRgPGlrxnGDIr0O0Y';

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
    console.log("Registering service worker from registerServiceWorker.ts...");
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        console.log("Service workers are supported.");
        window.addEventListener('load', () => {
            console.log("Window loaded, registering service worker...");
            navigator.serviceWorker.register('/service-worker.js')
                .then(async reg => {
                    console.log('Service worker registered:', reg);
                    // Request notification permission
                    if (Notification.permission === 'default') {
                        await Notification.requestPermission();
                    }
                    // Subscribe for push if allowed
                    if (Notification.permission === 'granted' && VAPID_PUBLIC_KEY) {
                        console.log('===========Vapid public key:===========', VAPID_PUBLIC_KEY);
                        const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
                        });
                        console.log('Push subscription:', sub);

                        // Send subscription to backend
                        try {
                            const token = localStorage.getItem('access_token');
                            if (!token) {
                                console.warn('No auth token available, skipping push subscription save');
                                if (onPushSubscription) onPushSubscription(sub);
                                return;
                            }

                            const response = await fetch('https://social-webapi-b7ebhgakb6engxbh.eastus-01.azurewebsites.net/api/push/subscribe', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    endpoint: sub.endpoint,
                                    keys: {
                                        p256dh: sub.toJSON().keys?.p256dh,
                                        auth: sub.toJSON().keys?.auth
                                    }
                                })
                            });

                            if (response.ok) {
                                console.log('Push subscription saved to backend');
                            } else if (response.status === 401) {
                                console.error('Authentication failed, redirecting to login...');
                                localStorage.removeItem('access_token');
                                localStorage.removeItem('refresh_token');
                                window.location.href = '/login';
                                return;
                            } else {
                                console.error('Failed to save subscription to backend:', await response.text());
                            }
                        } catch (error) {
                            console.error('Error saving subscription to backend:', error);
                        }

                        if (onPushSubscription) onPushSubscription(sub);
                    }
                })
                .catch(err => {
                    console.error('Service worker registration failed:', err);
                });
        });
    }
}
