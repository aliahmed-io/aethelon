import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    // Spike Test: Sudden burst of traffic
    stages: [
        { duration: '30s', target: 0 },    // Warm up
        { duration: '1m', target: 1000 },  // FAST ramp to 1000 VUs
        { duration: '1m', target: 1000 },  // Hold brief spike
        { duration: '30s', target: 0 },    // Drop
    ],
    thresholds: {
        http_req_failed: ['rate<0.10'],    // Expect some failures (10%)
        http_req_duration: ['p(95)<5000'], // Latency will spike
    },
};

export function setup() {
    const BASE_URL = 'https://aethelona-ten.vercel.app';
    const res = http.post(
        `${BASE_URL}/api/search`,
        JSON.stringify({ query: '', searchType: 'standard' }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    const body = res.json();
    const products = body.results || [];
    return { productIds: products.map(p => p.id) };
}

export default function spikeTest(data) {
    const BASE_URL = 'https://aethelona-ten.vercel.app';
    const productIds = data.productIds || [];

    // Spike typically tests Homepage + Critical paths (not everything)
    const homeRes = http.get(`${BASE_URL}/`, { tags: { name: 'Home' } });
    check(homeRes, { 'homepage loaded': (r) => r.status === 200 });

    // Aggressive browsing (less sleep)
    sleep(Math.random() * 1);

    if (productIds.length > 0) {
        const randomId = productIds[Math.floor(Math.random() * productIds.length)];
        const productRes = http.get(`${BASE_URL}/store/product/${randomId}`, { tags: { name: 'ProductDetail' } });
        check(productRes, { 'product detail loaded': (r) => r.status === 200 });
    }
}
