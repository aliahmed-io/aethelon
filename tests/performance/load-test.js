import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration: Use environment variable or default to localhost
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Traffic Mix Definition
// Total VUs = 100 
export const options = {
    scenarios: {
        browsing: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 70 },  // Ramp up
                { duration: '1m', target: 70 },   // Sustain
                { duration: '15s', target: 0 },   // Ramp down
            ],
            exec: 'browsingFlow',
            tags: { type: 'browsing' },
        },
        filtering: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 },
                { duration: '1m', target: 20 },
                { duration: '15s', target: 0 },
            ],
            exec: 'filteringFlow',
            tags: { type: 'filtering' },
        },
        checkout: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 10 },
                { duration: '1m', target: 10 },
                { duration: '15s', target: 0 },
            ],
            exec: 'checkoutFlow',
            tags: { type: 'checkout' },
        },
    },
    thresholds: {
        // Strict Business Prospectus SLA: Sub-500ms Page Loads
        'http_req_duration{type:browsing}': ['p(95)<500'],   // Cinematic static load < 500ms
        'http_req_duration{type:filtering}': ['p(95)<1000'], // Dynamic queries < 1s
        'http_req_duration{type:checkout}': ['p(95)<1500'],  // Write/Checkout < 1.5s
        http_req_failed: ['rate<0.01'],                      // < 1% errors
    },
};

// 1. Browsing Flow (70%) - Cached, static pages
export function browsingFlow() {
    // Homepage
    check(http.get(`${BASE_URL}/`), { 'Home 200': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1);

    // Shop page
    check(http.get(`${BASE_URL}/categories`), { 'Shop 200': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1);

    // About page
    check(http.get(`${BASE_URL}/about`), { 'About 200': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 2);
}

// 2. Filtering Flow (20%) - Search, Dynamic Filters
export function filteringFlow() {
    // Shop with query params
    const res = http.get(`${BASE_URL}/categories?sort=price-asc`);
    check(res, { 'Filter 200': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 2);
}

// 3. Checkout Flow (10%) - Product Detail -> Cart
export function checkoutFlow() {
    // View product list first
    check(http.get(`${BASE_URL}/categories`), { 'Shop 200': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1);

    // View bag
    check(http.get(`${BASE_URL}/bag`), { 'Bag 200': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1);
}

export default function () {
    browsingFlow();
}
