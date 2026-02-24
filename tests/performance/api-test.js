import http from 'k6/http';
import { check, sleep } from 'k6';

// API Capacity Discovery Test
// Hit ONLY the Search API to isolate backend/database compute bottlenecks
// from CDN/Static frontend caching.

export const options = {
    stages: [
        { duration: '30s', target: 50 },  // Warm up connection pool
        { duration: '1m', target: 200 },  // Moderate load
        { duration: '2m', target: 500 },  // High load to check DB pool collapse
        { duration: '1m', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],    // < 1% error rate
        http_req_duration: ['p(95)<800'],  // APIs must be fast
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    const queries = ['chair', 'table', 'sofa', 'wood', 'leather'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];

    // Test the specific API endpoint handling complex Prisma queries
    const res = http.get(`${BASE_URL}/api/search?q=${randomQuery}`);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'has results': (r) => {
            try {
                const data = r.json();
                return data && data.total !== undefined;
            } catch (e) {
                return false;
            }
        },
    });

    sleep(Math.random() * 3 + 1); // 1-4s think time for API requests
}
