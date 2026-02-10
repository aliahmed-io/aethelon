import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    // Key configurations for Smoke Test
    vus: 1,
    duration: '30s',

    thresholds: {
        http_req_failed: ['rate<0.01'],   // http errors should be less than 1%
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    },
};

export default function smokeTest() {
    const BASE_URL = 'https://novexa-ten.vercel.app';

    // 1. Visit Home
    const homeRes = http.get(`${BASE_URL}/`, { tags: { name: 'Home' } });
    check(homeRes, { 'status is 200': (r) => r.status === 200 });
    sleep(1);

    // 2. Visit All Products
    const productsRes = http.get(`${BASE_URL}/store/products/all`, { tags: { name: 'AllProducts' } });
    check(productsRes, { 'status is 200': (r) => r.status === 200 });
    sleep(1);
}
