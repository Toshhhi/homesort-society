// lib/notifications.ts
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

export async function requestNotificationPermission(email: string) {
    try {
        const messaging = await getFirebaseMessaging();
        console.log("messaging:", messaging); // add this

        if (!messaging) {
            console.log("FCM not supported in this browser");
            return;
        }

        const permission = await Notification.requestPermission();
        console.log("permission:", permission); // add this

        if (permission !== "granted") {
            console.log("Notification permission denied");
            return;
        }

        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        console.log("token:", token); // add this

        if (!token) {
            console.log("No FCM token received");
            return;
        }

        await fetch("http://localhost:5000/api/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token }),
        });

        console.log("FCM token saved successfully");
    } catch (err) {
        console.error("FCM permission error:", err); // this will show the real error
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