import 'dotenv/config';

async function testWebhooks() {
    const APP_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    console.log(`Testing Webhooks against ${APP_URL}...`);

    const endpoints = [
        { url: `${APP_URL}/api/webhooks/stripe`, name: "Stripe" },
        { url: `${APP_URL}/api/webhooks/meshy`, name: "Meshy" }
    ];

    for (const endpoint of endpoints) {
        console.log(`\nTesting ${endpoint.name} (${endpoint.url})...`);

        // Test 1: No Signature
        try {
            const res = await fetch(endpoint.url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ test: "payload" })
            });
            console.log(`[${res.status}] No Signature: ${res.status === 400 || res.status === 401 ? "PASS" : "FAIL"}`);
        } catch (e) {
            console.error("Connection Error", e);
        }

        // Test 2: Bad Data
        try {
            const res = await fetch(endpoint.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "stripe-signature": "rubbish",
                    "authorization": "Bearer rubbish"
                },
                body: "Not even JSON"
            });
            console.log(`[${res.status}] Bad Data/Sig: ${res.status >= 400 ? "PASS" : "FAIL"}`);
        } catch (e) {
            console.error("Connection Error", e);
        }
    }
}

testWebhooks();
