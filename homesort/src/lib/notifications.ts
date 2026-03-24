// lib/notifications.ts
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

export async function requestNotificationPermission(email: string) {
    try {
        const messaging = await getFirebaseMessaging();
        if (!messaging) {
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            return;
        }

        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (!token) {
            return;
        }

        const res = await fetch("http://localhost:5000/api/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token }),
        });

        if (!res.ok) {
            throw new Error("Failed to save FCM token");
        }
    } catch (err) {
        console.error("FCM permission error:", err);
    }
}



export function listenForForegroundMessages(
    onNotification: (title: string, message: string) => void
) {
    getFirebaseMessaging().then((messaging) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            const title = payload.notification?.title || "";
            const body = payload.notification?.body || "";
            onNotification(title, body);
        });
    });
}