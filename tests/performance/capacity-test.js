import http from 'k6/http';
import { check, sleep } from 'k6';

// This test aims to find the maximum VU capacity.
// User requested starting with 600, aiming for 800.

export const options = {
    stages: [
        { duration: '2m', target: 200 },
        { duration: '2m', target: 400 },
        { duration: '3m', target: 600 },
        { duration: '3m', target: 600 },
        { duration: '2m', target: 0 },
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
        '/categories',
        '/about',
        '/categories?sort=newest',
    ];

    const randomPage = pages[Math.floor(Math.random() * pages.length)];
    const res = http.get(`${BASE_URL}${randomPage}`);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'page loaded': (r) => r.body ? r.body.length > 0 : false,
    });

    sleep(Math.random() * 5 + 2); // 2-7s realistic think time
}
