
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serviceAccount;
try {
    serviceAccount = JSON.parse(
        readFileSync(join(__dirname, "../serviceAccountKey.json"), "utf-8")
    );
} catch (err) {
    // Service account is optional for local development
}

if (serviceAccount && !admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (err) {
        console.error("Firebase Admin initialization failed:", err);
    }
}

const safeAdmin = new Proxy(admin, {
    get(target, prop) {
        if (prop === "messaging") {
            if (!serviceAccount || !admin.apps.length) {
                return () => ({
                    sendEachForMulticast: async () => {
                        return { successCount: 0, failureCount: 0, responses: [] };
                    }
                });
            }
        }
        return target[prop];
    }
});

export default safeAdmin;