import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    // Stress Test: Push system to 500 VUs
    stages: [
        { duration: '3m', target: 800 }, // Ramp-up
        { duration: '5m', target: 800 }, // Sustain high load
        { duration: '2m', target: 0 },   // Ramp-down
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],    // Allow 5% failure under stress
        http_req_duration: ['p(95)<3000'], // 95% < 3s is acceptable under stress
    },
};

export function setup() {
    const BASE_URL = 'https://novexa-ten.vercel.app';
    const res = http.post(
        `${BASE_URL}/api/search`,
        JSON.stringify({ query: '', searchType: 'standard' }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    const body = res.json();
    const products = body.results || [];
    return { productIds: products.map(p => p.id) };
}

export default function stressTest(data) {
    const BASE_URL = 'https://novexa-ten.vercel.app';
    const productIds = data.productIds || [];

    // 1. Home
    const homeRes = http.get(`${BASE_URL}/`, { tags: { name: 'Home' } });
    check(homeRes, { 'homepage loaded': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 1); // Longer think time for stress mix

    // 2. All Products
    const allRes = http.get(`${BASE_URL}/store/products/all`, { tags: { name: 'AllProducts' } });
    check(allRes, { 'all products loaded': (r) => r.status === 200 });

    // 3. Category (Random)
    const categories = ['men', 'women', 'kids'];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const catRes = http.get(`${BASE_URL}/store/products/${randomCat}`, { tags: { name: 'Category' } });
    check(catRes, { 'category loaded': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1);

    // 4. Product Detail
    if (productIds.length > 0) {
        const randomId = productIds[Math.floor(Math.random() * productIds.length)];
        const productRes = http.get(`${BASE_URL}/store/product/${randomId}`, { tags: { name: 'ProductDetail' } });
        check(productRes, { 'product detail loaded': (r) => r.status === 200 });
        sleep(Math.random() * 4 + 2);
    }
}