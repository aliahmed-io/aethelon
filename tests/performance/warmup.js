import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    vus: 1,
    duration: '10s',
};

export default function warmup() {
    const BASE_URL = 'https://novexa-ten.vercel.app';

    // Hit the main pages to prime the ISR cache
    check(http.get(`${BASE_URL}/`), { 'warmed home': (r) => r.status === 200 });
    check(http.get(`${BASE_URL}/store/products/all`), { 'warmed all': (r) => r.status === 200 });
    check(http.get(`${BASE_URL}/store/products/men`), { 'warmed men': (r) => r.status === 200 });
    check(http.get(`${BASE_URL}/store/products/women`), { 'warmed women': (r) => r.status === 200 });
    check(http.get(`${BASE_URL}/store/products/kids`), { 'warmed kids': (r) => r.status === 200 });

    // Warn up caching for complex filters
    check(http.get(`${BASE_URL}/store/products/men?price=50-100&color=black`), { 'warmed complex': (r) => r.status === 200 });

    sleep(1);
}
