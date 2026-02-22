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

export default function spikeTest() {
    const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

    // Spike typically tests Homepage + Critical paths (not everything)
    const homeRes = http.get(`${BASE_URL}/`, { tags: { name: 'Home' } });
    check(homeRes, { 'homepage loaded': (r) => r.status === 200 });

    // Aggressive browsing (less sleep)
    sleep(Math.random() * 1);

    const allRes = http.get(`${BASE_URL}/categories`, { tags: { name: 'Shop' } });
    check(allRes, { 'products loaded': (r) => r.status === 200 });
}
