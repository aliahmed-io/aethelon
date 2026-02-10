# System Architecture & Performance Strategy

**Target Scale**: 800 Concurrent Users (VUs)
**Performance SLO**: p95 latency < 3s for storefront pages.

## Verified Performance (Deployment Status: Optimized)

| Metric | Result | Target |
| :--- | :--- | :--- |
| Error Rate | **0.00%** | <1% ✅ |
| p95 Latency | **2.95s** | <3s ✅ |
| TTFB (Static) | **30ms** | <50ms ✅ |
| Origin Transfer | **Minimal** | Optimized ✅ |

## 1. Database Connection Strategy

-   **Pooler**: Neon pooled connection string with `pgbouncer=true`.
-   **Application Limit**: `max: 1` connection per Lambda in production.
-   **Indexes**: Added to `Product`, `Review`, and `Order` models for O(log n) queries.

## 2. Caching & Content Delivery

### A. Static Site Generation (SSG) & ISR
-   **Static Pages**: Legal content (`/legal/*`) and Product Detail Pages (`/store/product/[id]`) are pre-rendered.
-   **ISR (Incremental Static Regeneration)**: Shop page (`/store/shop`) rebuilds at most once per hour (`revalidate = 3600`).
-   **Optimization**: This hybrid strategy ensures high performance while staying within Vercel "Fast Origin Transfer" limits.

### B. Asset Optimization (Edge Caching)
-   **3D Models**: `.glb` files cached for **1 year** (`max-age=31536000, immutable`).
-   **Images/Fonts**: Cached for **24 hours** with stale-while-revalidate.

### C. Server-Side Data Caching
| Data | TTL | Tags |
| :--- | :--- | :--- |
| Product Catalog | 60s | `products` |
| Product Detail | 300s | `products` |
| Banners/Hero | 1hr | `banners` |
| Reviews | 60s | `reviews` |

## 3. Load Testing Methodology

Validated with k6 weighted scenarios:
-   **70% Browsing**: CDN-cached pages (p95 < 3.27s)
-   **20% Filtering**: Dynamic queries (p95 < 1.69s)
-   **10% Checkout**: Product detail (p95 < 1.94s)

## 4. Non-Goals (Out of Scope)
-   Flash sales (>5,000 VUs) require queueing infrastructure.
-   Heavy analytics should use read replicas.

 ## 5. Phase 2: Speed Optimization Plan (Active)

 To further reduce latency and improve Core Web Vitals (LCP, CLS), the following plan is proposed:

 ### A. Component Code Splitting
 -   **Goal**: Reduce Initial JS Bundle Size.
 -   **Action**: Implement `next/dynamic` for heavy client components:
     -   `ThreeDViewer` (3D Model).
     -   `AiConcierge` (Chatbot).
     -   `SearchOverlay` (Search).
 -   **Target**: Reduce main bundle by ~50KB.

 ### B. Font Optimization
 -   **Goal**: Zero layout shift and faster text render.
 -   **Action**: Ensure `next/font` is utilizing `swap` strategy and preloading critical weights (Light, Regular, Mono) only.

 ### C. Database Query Tuning
 -   **Goal**: Reduce TTFB on dynamic pages.
 -   **Action**: Refactor Prisma queries to use specific `select` fields instead of default `*` fetch.
     -   *Example*: On Product Listing, fetch only `name`, `price`, `images[0]` instead of full relations.

 ### D. Image Loading Strategy
 -   **Goal**: Improve LCP (Largest Contentful Paint).
 -   **Action**:
     -   Enforce `sizes` prop on all `next/image` usage to serve correct responsive variants.
     -   Use `priority` for Hero images above the fold.
     -   Convert all PNG/JPG assets to `WebP` or `AVIF` where possible.
