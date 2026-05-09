import http from 'k6/http';
import { check, sleep } from 'k6';

// Configure the load test
export let options = {
    // Stage 1: Ramp up to 50 concurrent virtual users over 10 seconds
    // Stage 2: Hold at 50 users for 20 seconds
    // Stage 3: Ramp down to 0 users over 10 seconds
    stages: [
        { duration: '10s', target: 50 },
        { duration: '20s', target: 50 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        // Our strict SLA from the prospectus: 95% of requests must complete in under 500ms
        http_req_duration: ['p(95)<500'],
        // Ensure less than 1% of requests fail
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    // Target the local dev server running the Aethelon storefront
    const url = 'http://localhost:3000';

    const res = http.get(url, {
        tags: { my_tag: 'landing_page_load' },
    });

    // Verify the response
    check(res, {
        'is status 200': (r) => r.status === 200,
        // Optional strict check: see how many absolutely nail the 500ms target on individual pings
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    // Simulate real user reading time before next action (1 second pause)
    sleep(1);
}
