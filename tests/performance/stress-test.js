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

export default function stressTest() {
    const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

    // 1. Home
    const homeRes = http.get(`${BASE_URL}/`, { tags: { name: 'Home' } });
    check(homeRes, { 'homepage loaded': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 1); // Longer think time for stress mix

    // 2. All Products
    const allRes = http.get(`${BASE_URL}/categories`, { tags: { name: 'AllProducts' } });
    check(allRes, { 'products loaded': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1);

    // 3. Blog
    const blogRes = http.get(`${BASE_URL}/blog`, { tags: { name: 'Blog' } });
    check(blogRes, { 'blog loaded': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1);

    // 4. Campaigns
    const campaignsRes = http.get(`${BASE_URL}/campaigns`, { tags: { name: 'Campaigns' } });
    check(campaignsRes, { 'campaigns loaded': (r) => r.status === 200 });
    sleep(Math.random() * 4 + 2);
}