import http from 'k6/http';
import { check, sleep } from 'k6';

// This test aims to find the maximum VU capacity.
// User requested starting with 600, aiming for 800.

export const options = {
    stages: [
        { duration: '1m', target: 600 }, // Fast ramp to 600
        { duration: '2m', target: 600 }, // Hold 600
        { duration: '1m', target: 800 }, // Ramp to 800
        { duration: '2m', target: 800 }, // Hold 800
        { duration: '1m', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_failed: ['rate<0.02'],    // < 2% errors
        http_req_duration: ['p(95)<2000'], // 95% < 2s
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    const pages = [
        '/',
        '/shop',
        '/about',
        '/shop?category=furniture', // Common filter
    ];

    const randomPage = pages[Math.floor(Math.random() * pages.length)];
    const res = http.get(`${BASE_URL}${randomPage}`);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'page loaded': (r) => r.body.length > 0,
    });

    sleep(1); // 1s think time
}
