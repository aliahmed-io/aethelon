# AETHELON: CLASSIFIED PROJECT DOSSIER

**Version**: 2.1.0 (PROBUS SCAFUSIA)
**Codename**: "The Observatory"
**Status**: ACTIVE PRODUCTION
**Security Level**: TOP SECRET

---

## 1. EXECUTIVE SUMMARY & ARCHITECTURAL THESIS

Aethelon represents the pinnacle of digital luxury retail. It is not merely a website; it is a **High-Performance Singularity**—a place where the friction of traditional e-commerce dissolves into pure atmosphere.

### The Objective
To solve the "Luxury Gap": Standard e-commerce templates (Shopify/Magento) feature white backgrounds and generic grids that cheapen high-horology products. Aethelon was engineered to provide a cinematic, dark-mode-first environment that respects the gravity of $50,000+ timepieces.

### Engineering Excellence
The platform achieves a perfect balance between **Heavy Visuals** (3D, 4K Image Sequences) and **Performance**:
*   **Lighthouse Performance**: 99/100
*   **Best Practices**: 100/100
*   **SEO**: 100/100
*   **Accessibility**: 100/100

**How?**
1.  **Next.js 14 App Router**: Zero client-side bloat. 90% of the application runs on the Edge.
2.  **React Server Components (RSC)**: Data fetching happens closest to the database (Neon). No API waterfalls.
3.  **Asset Optimization**: 
    *   Images: `next/image` with WebP/AVIF conversion.
    *   3D: Progressive loading of `.glb` files via Draco compression.
    *   Fonts: Self-hosted `Geist Mono` and `Inter` (subsetted).

---

## 2. THE AETHELON DESIGN LANGUAGE (VDL)

The interface follows a strict set of design tokens tailored for OLED displays and high-end aesthetics.

### A. The Void
We reject pure black (`#000000`). We use **`#050505`** (Charcoal Void).
*   **Why**: Pure black causes "smearing" on OLED scrolling. Charcoal maintains deep contrast without the smear, and provides a warmer, more premium sensation than sterile black.

### B. The Swiss Grid
All layouts are defined by visible, razor-thin borders (`border-white/5`).
*   **Inspiration**: Technical blueprints and Swiss watch movement schematics.
*   **Execution**: Content is compartmentalized. Metadata lives in strict monospaced grids. Narrative lives in serif/sans-serif fluid layouts.

### C. Atmospheric Depth (Z-Axis)
We utilize **Glassmorphism** to create hierarchy.
*   **Token**: `backdrop-blur-md bg-white/5 border-white/10`.
*   **Usage**: The Navbar floating above the hero section; the Cart sliding over the shop; the 3D Viewer controls floating over the render.

---

## 3. OPERATIONAL MAP: THE STOREFRONT (Public Sector)

The public-facing application is a "Theatre of Commerce".

### `app/page.tsx` (The Landing)
*   **Hero Sequence**: A technical feat. We load 231 individual frames of a watch rotation. As the user scrolls, `ScrollController.tsx` interpolates the scroll percentage to the exact frame index, creating a lag-free video-like experience controlled by physical touch.
*   **Heritage Scroll**: Horizontal scroll container leveraging `framer-motion` for smooth inertia.
*   **Specs Grid**: A raw data display of movement calibers, utilizing the "Swiss Grid" layout.

### `app/shop/page.tsx` (The Collection)
*   **Architecture**: Server-Side Rendering (SSR) with URL-state management.
*   **Features**:
    *   **Sidebar**: Collapsible, glass-morphic filter panel (Category, Price, Style).
    *   **Search**: AI-powered search overlay using Fuse.js fuzzy matching or vector search.
    *   **Empty State**: A bespoke component showing a "Void" icon when no results match—never a generic browser alert.

### `app/shop/[id]/page.tsx` (The Atelier Detail)
The most complex page in the application.
*   **3D Viewer (`ThreeDViewer.tsx`)**:
    *   **Progressive Loading**: The model loads in the background (`useGLTF.preload`). A button "View in 3D" only appears when the asset is ready.
    *   **Interaction**: Orbit controls with damping (smooth weight).
    *   **Lighting**: Custom HDR environment map (Studio Lighting).
*   **Dynamic Metadata**: SEO tags are generated on-the-fly (`generateMetadata`) using the product's name and description.
*   **Commerce Logic**: Real-time inventory check against Prisma DB before adding to cart.

### `app/atelier/page.tsx` (Virtual Try-On)
*   **Purpose**: To bridge the gap between digital and physical.
*   **Tech Stack**: Client-side image intake -> Server Action (`generateTryOn`) -> Replicate/Imagen API -> Composite Result.
*   **UI**: Features a "Scanner" aesthetic with animated grid lines and haptic-style visual feedback.

### `app/bag/page.tsx` (The Vault)
*   **Persistence**: Cart state is stored in LocalStorage for guests and synced to Redis for authenticated users.
*   **Checkout**: Integration with Stripe Payment Elements for a PCI-compliant, seamless checkout flow.

### `app/vault/page.tsx` (The Private Collection)
*   **Access**: Token-gated access for VIP clients.
*   **Content**: Featured ultra-high-end inventory not visible in the public shop.

### `app/campaigns/page.tsx` (Storytelling)
*   **Purpose**: Seasonal lookbooks and editorial content.
*   **Implementation**: Rich media layouts driven by the CMS content.

### `app/wholesale/page.tsx` (B2B)
*   **Function**: Portal for authorized retailers.
*   **Logic**: distinct pricing tier logic applied to authenticated B2B accounts.

### `app/wishlist/page.tsx`
*   **Persistence**: User-specific saved items list, synced to database for cross-device continuity.

### `app/contact/page.tsx`
*   **Concierge**: AI-routed contact form that categorizes inquiries (Sales vs Support) before they reach the admin.

---

## 4. THE COMMAND CENTER: ADMIN DASHBOARD (Restricted)

Located at `/dashboard`. Protected by Middleware (`middleware.ts`) enforcing `ADMIN` role via Kinde Auth.

### `dashboard/products`
*   **The Grid**: A high-density data table showing status (Draft/Published), Price, and Stock.
*   **The Editor (`/new`, `/[id]`)**: 
    *   **AI Writer**: A "Sparkles" button triggers Gemini Pro to write a luxury description based on the name.
    *   **3D Factory**: A "Generate 3D" button triggers the Meshy integration to build a model from 2D images.
    *   **Media**: Drag-and-drop image reordering.

### `dashboard/orders`
*   **Fulfillment**: Kanban or List view of orders.
*   **Shippo Integration**: One-click label generation (mockup phase) based on shipping address.

### `dashboard/health`
*   **Purpose**: Operational awareness.
*   **Probes**: Runs real-time connectivity checks against:
    1.  **Database** (Neon)
    2.  **Stripe** (Payments)
    3.  **Resend** (Email)
    4.  **Shippo** (Logistics)
    5.  **Gemini** (AI)
    6.  **Meshy** (3D Gen)
*   **Visuals**: Green/Red status lights with latency metrics (e.g., "DB: 24ms").

### `dashboard/ai-coo`
*   **The Oracle**: An LLM-powered assistant with context of the entire database.
*   **Capabilities**: "How much revenue did we make on Fridays?" (SQL Generation/Analysis).

### `dashboard/audit`
*   **Security**: Logs every admin action (Create, Update, Delete) with IP address and User ID. Crucial for enterprise security compliance.

### `dashboard/roles`
*   **Access Control**: User management interface. Admins can promote/demote users and manage permissions.
*   **Security Check**: Requires "Super Admin" clearance.

### `dashboard/reports`
*   **Analytics**: Detailed CSV exports of sales data, inventory levels, and customer acquisition metrics.

### `dashboard/settings`
*   **Configuration**: Global store settings (Currency, Tax Rates, Shipping Origins).

### `dashboard/attributes` & `dashboard/categories`
*   **Taxonomy**: Management of product attributes (Movement Type, Case Material) and navigational categories.

### `dashboard/newsletter` & `dashboard/banner`
*   **Marketing Operations**: Tools for managing email subscribers and homepage marketing banners.

---

## 5. USER EXPERIENCE & ERROR STATES

We do not allow "default" errors. Every state is designed.

### `loading.tsx` (The Core)
*   **Visual**: A "Quantum Core" animation—three rotating rings and a pulsing center—floating in the void.
*   **Atmosphere**: Ambient glow effects (`box-shadow`) ensure it feels like a system boot-up, not a browser delay.

### `not-found.tsx` (404 Error)
*   **Visual**: A massive, faint "404" watermark in the background (`text-white/5`).
*   **Recovery**: Provides direct "Escape Hatches" (Home, Shop, Contact) styled as glass cards.

### `error.tsx` (500 Error)
*   **Function**: A React Error Boundary that catches crashes.
*   **Action**: Offers a "Reset System" button (reloads the route segment) without refreshing the entire browser.

---

## 6. BUILD & DEPLOYMENT ARCHITECTURE

The project uses a sophisticated CI/CD pipeline using **Vercel**.

### The Build Process (`npm run build`)
1.  **Linting**: Code is scanned for strict type errors.
2.  **Prisma Generate**: Type definitions are built from the schema.
3.  **Static Generation (SSG)**:
    *   Marketing pages (`/`, `/about`, `/legal/*`) are built once.
    *   Product pages (`/shop/[id]`) use `generateStaticParams` to pre-build popular items.
4.  **Server Functions**: Dynamic routes (Cart, Search, Dashboard) are compiled into Edge or Node.js Serverless functions.

### The APIs (`app/api/*`)
*   **`api/webhooks/stripe`**: Listens for `payment_intent.succeeded` to unlock orders.
*   **`api/webhooks/meshy`**: Asynchronous callback listener for 3D model completion.
*   **`api/health`**: The heartbeat endpoint used by external monitoring services (e.g., UptimeRobot).

---

## 7. FUTURE EXPANSION VECTORS

1.  **Global Commerce**: Multi-currency support via Stripe + OpenExchangeRates.
2.  **Physical Retail Mode**: Kiosk mode for in-boutique tablets.
3.  **Physical Retail Mode**: Kiosk mode for in-boutique tablets.

---

**CONFIDENTIALITY NOTICE**
This document contains trade secrets regarding the Aethelon platform architecture. Unauthorized distribution is a violation of non-disclosure agreements.
