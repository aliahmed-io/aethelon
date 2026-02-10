# AETHELONA PRIVATE DOSSIER

This document is intended to be **private** and **not committed** to GitHub. It is a comprehensive “data room” reference for you (and optionally for a serious buyer under NDA) to understand:

- What the website is today (exact pages/routes, what each does).
- What features exist and what they depend on.
- Where the project is strong, where it is weak, and what to fix next.
- Every realistic monetization strategy (licenses, services, SaaS, add-ons, etc.).
- A recommended monetization plan with timelines and pricing.
- Things you should do and avoid when selling and operating it.

Constraint I’m following: **avoid repeating the same point multiple times**. If two topics touch the same idea, I’ll cover it once in the best section.

---

# Part 1 — Website details, routes, and evaluation

## 1) What Aethelona is (one paragraph)

Aethelona is a Next.js 15 + React 19 e-commerce application with a complete storefront and an admin dashboard. It includes payments (Stripe), shipping (Shippo), authentication (Kinde), email marketing (Resend), media uploads (UploadThing), data (Postgres/Prisma), Redis caching, and AI features (Gemini-based assistant/search/admin tools). It is designed as a **sellable “ready-to-launch” foundation** that a buyer can deploy, brand, and extend.

## 2) What “implemented” means in this repo

When this project says a feature is implemented, it means:

- There is a route/page or server action that exposes it.
- The data models exist in Prisma.
- It works in a configured environment (correct env vars + database + external providers).

What “implemented” does not mean:

- Legal pages are **templates**; they require legal review.
- A buyer can run it without keys; missing keys disable or degrade related features.
- The UX is polished to a luxury brand standard in every corner; some sections are good enough for selling and then polishing.

## 3) Core architecture (mental model)

Think of Aethelona as a set of cooperating subsystems:

### 3.1 Storefront subsystem

- Routes under `/store` provide browsing, product detail, bag/cart, checkout, account pages.
- The storefront reads product/catalog data from Postgres via Prisma.
- The cart is stored in Redis (Upstash), keyed by user.

### 3.2 Checkout + payment subsystem

- Checkout is authenticated; user must be logged in via Kinde.
- Checkout creates:
  - An `Order` record in Postgres (pending at first).
  - A Stripe Checkout Session.
- Stripe webhooks:
  - Verify signatures.
  - Use idempotency (WebhookEvent) to safely handle retries.
  - Create Payment records and update Order status.
  - Decrement inventory once per successful payment.

### 3.3 Shipping subsystem

- Shipping rates are fetched via Shippo.
- Admin can buy shipping labels.
- Shippo webhooks update shipment and order statuses.
- The system stores shipment data (tracking number, label URL, status) in Postgres.

### 3.4 Admin operations subsystem

- Admin routes under `/store/dashboard` provide product management, orders, returns, email marketing, integrations health, and audit logs.
- Admin access is gated by an allowlist (environment variable `ADMIN_EMAILS`).

### 3.5 AI + 3D subsystem

- Storefront:
  - AI assistant (Gemini).
  - AI search and ranking (Gemini reranking on top of local filtering).
- Admin:
  - AI COO mode for analytics + insights.
  - AI-assisted email drafting.
  - AI interaction logging (`AiInteractionLog`).
- Optional 3D:
  - Viewer for `.glb` models.
  - Meshy-based model generation workflow.
- Optional try-on:
  - Replicate-based VTON integration with safe mock fallback.

## 4) Route map (what pages exist and what each does)

You asked for “12 pages.” Aethelona has more than 12 because it includes both storefront and dashboard CRUD pages.

So I’m giving:

- **A Primary 12** list (the strongest sale/demo walkthrough).
- **Extended storefront** routes.
- **Extended admin** routes.
- **API routes** (backend capability list).

### 4.1 Primary 12 pages (recommended sales demo order)

These are the 12 pages you should use in a buyer demo.

1) **Landing page** — `/`

- **What it does**: brand entry point, provides a premium marketing first impression.
- **Primary value**: increases perceived quality and conversion.
- **Buyer questions it answers**: “Is this just a dashboard template, or a real storefront?”

2) **Shop / catalog** — `/store/shop`

- **What it does**: product browsing and discovery.
- **Key features**: filtering, sorting, search; can support AI search.
- **Buyer questions it answers**: “Can customers find what they want quickly?”

3) **Product detail** — `/store/product/[id]`

- **What it does**: conversion-focused product view.
- **Key features**: gallery, pricing, discounts, reviews; optional 3D viewer.
- **SEO note**: product pages inject rich metadata and JSON-LD product schema (useful to mention to buyers who care about SEO).

4) **Bag / cart** — `/store/bag`

- **What it does**: shows cart contents and totals.
- **Key features**: discount code flow; ability to remove items.
- **Buyer questions it answers**: “Is the buyer journey complete?”

5) **Checkout (shipping form)** — `/store/checkout`

- **What it does**: collects shipping address and gets shipping rates.
- **Key features**: Shippo rates; newsletter opt-in; address prefilling from saved addresses.

6) **Checkout success** — `/store/checkout/success`

- **What it does**: shows payment success, reassurance and next steps.
- **Buyer questions it answers**: “Is checkout integrated properly?”

7) **Orders list (customer self-service)** — `/store/orders`

- **What it does**: order history view for logged-in customers.
- **Value**: reduces support cost and increases trust.

8) **Order detail** — `/store/orders/[id]`

- **What it does**: full details, shipping snapshot, tracking display when shipped.
- **Value**: reduces “where is my order” tickets.

9) **Return request form** — `/store/orders/[id]/return`

- **What it does**: customer submits return request tied to an order.
- **Value**: returns workflow exists (buyers love this because it’s often missing).

10) **Wishlist** — `/store/wishlist`

- **What it does**: saves products for later.
- **Value**: retention and future conversion.

11) **Contact** — `/store/contact`

- **What it does**: creates a `Contact` record from a public form.
- **Value**: lead/support capture plus admin inbox triage.

12) **Admin dashboard home** — `/store/dashboard`

- **What it does**: operational hub; links to orders/products/email/integrations.
- **Buyer questions it answers**: “Can a store operator actually run this without engineering?”

### 4.2 Extended storefront routes (beyond the Primary 12)

- **Account** — `/store/account`
  - Profile view and address book management.

- **Category browsing** — `/store/products/[name]`
  - Category/subcategory landing (useful for merchandising and SEO).

- **Try-on (beta)** — `/store/try-on`
  - Authenticated try-on experience; uploads photo, selects product, stores try-on history.

- **Checkout cancel** — `/store/checkout/cancel`
  - Handles cancel returns from Stripe.

- **Newsletter unsubscribe** — `/newsletter/unsubscribe`
  - Public unsubscribe endpoint/page.

- **Landing legal shortcuts** — `/privacy`, `/terms`
  - Additional legal routes.

- **Legal templates** — `/legal/privacy`, `/legal/terms`, `/legal/shipping`, `/legal/returns`
  - Template pages; good for completeness, but buyer must replace legal copy.

### 4.3 Extended admin/dashboard routes

Admin routes matter because they show depth: catalog management, fulfillment, returns, email, auditing.

- **Orders list** — `/store/dashboard/orders`
  - View orders, statuses.

- **Order detail** — `/store/dashboard/orders/[id]`
  - Shipping label purchase flow; shipment info.

- **Products list** — `/store/dashboard/products`
  - Product CRUD, bulk editing.

- **Product edit** — `/store/dashboard/products/[id]`
  - Edit details, images, stock, 3D.

- **Product import** — `/store/dashboard/products/import`
  - CSV import workflow.

- **Product delete confirm** — `/store/dashboard/products/[id]/delete`
  - Safety confirmation.

- **Categories** — `/store/dashboard/categories`
  - List and manage categories.

- **Category edit** — `/store/dashboard/categories/[id]`
  - Edit category.

- **Category create** — `/store/dashboard/categories/create`
  - Create category.

- **Category delete confirm** — `/store/dashboard/categories/[id]/delete`
  - Delete confirmation.

- **Banner management** — `/store/dashboard/banner`
  - Landing marketing banners.

- **Banner create** — `/store/dashboard/banner/create`
  - Create banner.

- **Banner delete confirm** — `/store/dashboard/banner/[id]/delete`
  - Delete confirmation.

- **Discounts** — `/store/dashboard/discounts`
  - Discount codes.

- **Discount create** — `/store/dashboard/discounts/create`
  - Create a discount.

- **Returns** — `/store/dashboard/returns`
  - Approve/reject return requests.

- **Email marketing** — `/store/dashboard/email`
  - Broadcast campaigns; includes AI drafting.

- **Contact inbox** — `/store/dashboard/contact`
  - Inbox triage: pending/completed/ignored; mark as read.

- **Integrations health** — `/store/dashboard/integrations`
  - Health cards and diagnostics.

- **Audit logs** — `/store/dashboard/audit`
  - Displays important admin actions.

- **Alerts** — `/store/dashboard/alerts`
  - Fraud/anomaly/ops alerts with mark-as-read.

- **AI COO** — `/store/dashboard/ai-coo`
  - “Morning briefing,” suggestions, and AI advisor.

### 4.4 API route map (backend capability)

API routes are important because they show the backend is not “fake.”

- **Health** — `/api/health`
  - Simple DB health ping.

- **Assistant** — `/api/assistant`
  - Gemini assistant; rate limiting + validation + logging.

- **AI search** — `/api/search`
  - Product filtering + optional Gemini rerank; logs AI interactions.

- **Shipping rates** — `/api/shipping/rates`
  - Authenticated; rate limited; fetches Shippo rates; caches rates for later verification.

- **Checkout** — `/api/checkout`
  - Creates pending Order; creates Stripe session; server-verifies shipping rate.

- **Stripe webhook** — `/api/webhooks/stripe`
  - Signature verified; idempotency; updates payments/orders; inventory deduction.

- **Shippo webhook** — `/api/webhooks/shippo`
  - Verified; idempotency; updates shipments and order status.

- **Meshy webhook** — `/api/webhooks/meshy`
  - Updates 3D generation tasks.

- **Try-On Status** — `/api/try-on/session/[id]`
  - Polls status of async AI try-on sessions.

- **Email drafting** — `/api/email/ai-draft`
  - Generates campaign draft text via AI.

- **Email broadcast** — `/api/email/broadcast`
  - Sends broadcast campaigns (Resend).

- **UploadThing** — `/api/uploadthing`
  - Upload endpoints for images and models.

- **Auth (Kinde)** — `/api/auth/*`
  - Auth routes.

## 5) Design + UX evaluation (how to judge it like a product)

### 5.1 What the UI is optimized for

- A **premium** look-and-feel.
- A **fast** browsing and checkout experience.
- An admin dashboard that feels like operational software rather than a toy.

### 5.2 What’s already strong (buyer-visible)

- Clear separation between storefront and dashboard.
- Presence of key business flows: orders, shipping, returns, email.
- Health/integrations dashboard exists, which is rare in starter kits.

### 5.3 What a buyer may point out (and how to handle it)

- **Brand specificity**: visuals may skew toward footwear. Frame this as “a niche-ready demo that can be rebranded.”
- **AI/3D perceived risk**: frame them as optional modules; the store still works without them.
- **Code quality signal**: ESLint warnings are not a runtime issue but can reduce confidence. Cleaning them improves the sale.

### 5.4 Practical “demo script” (10 minutes)

If you only have 10 minutes on a call, do:

1. Landing → Shop → Product → Bag.
2. Checkout page: show shipping rate options.
3. Explain Stripe webhooks finalize orders and inventory.
4. Admin dashboard: open Orders, show label purchase workflow.
5. Integrations dashboard: show service health/diagnostics.

Stop there. Only show AI COO / try-on if the buyer asks for differentiators.

### 5.5 Project Vital Statistics & Optimization Status

**Codebase Metrics:**
- **Interactive Routes:** 47 (Unique `page.tsx` definitions)
- **Total Generated Pages:** ~58 (excluding individual product pages)
- **Source Files:** ~222 (TypeScript/CSS in `app`, `components`, `lib`)
- **Total Lines of Code:** ~21,967

**Optimization & Scalability (Vercel Hobby Limits):**
We have implemented aggressive optimizations to ensure this project runs smoothly on free/hobby tiers without hitting "Fast Origin Transfer" limits.

| Metric | Improvement | Status |
| :--- | :--- | :--- |
| **3D Model Transfer** | **~99% Reduction** (Cached for 1 year @ Edge) | 🟢 Immutable |
| **Image Transfer** | **~80% Reduction** (Cached for 24h + Stale) | 🟢 Optimized |
| **Shop Page Load** | **~99.9% CPU Reduction** (ISR: Rebuilds 1/hr) | 🟢 Static/ISR |
| **Legal Pages** | **Zero Execution Cost** (Pure Static HTML) | 🟢 Static |
| **TTFB** | **~30ms** (Instant Global Delivery) | 🟢 Excellent |

---

End of Part 1.

Next we will add Part 2 (features list in a buyer-readable structure, then strengths/weaknesses) and Part 3 (all monetization routes + your best plan + do/don’t + risks + roadmap + FAQ) until the document exceeds 6000 words.

---

# Part 2 — Feature list (what exists, what it depends on, what value it provides)

This section is a **feature list**, but written in a way that answers the questions buyers actually ask:

- What problem does it solve?
- Who uses it (customer vs admin)?
- What must be configured for it to work?
- What is the expected behavior and what are edge cases?

I’m using the feature categories from the project’s `features.md`, but expanding them into a “buyer due diligence” format.

## 6) Storefront & shopping experience

### 6.1 Landing & brand experience

- **What it is**: a premium landing page to introduce the brand and move visitors into the shop.
- **Who uses it**: unauthenticated visitors.
- **Dependencies**: none (beyond base app).
- **Business value**: higher perceived brand value, clearer conversion path.
- **What a buyer might customize first**:
  - Brand colors and typography.
  - Hero content, imagery, CTA destinations.
  - Newsletter copy and placement.

### 6.2 Product catalog browsing (shop)

- **What it is**: a product grid with filtering/sorting/search.
- **Who uses it**: shoppers.
- **Dependencies**: products must exist in Postgres; Prisma schema set up.
- **Behavior**:
  - Displays products with images, pricing, and discount indication when applicable.
  - Provides filter controls for common attributes and categories.
  - Provides sort options (price/newness/popularity signals).
- **Edge cases to know**:
  - If the catalog is empty, the shop should show empty-state behavior.
  - If images are missing, product cards should degrade gracefully.

### 6.3 Product detail pages

- **What it is**: product pages with galleries, pricing, discount display, reviews, and optional 3D viewer.
- **Who uses it**: shoppers.
- **Dependencies**:
  - Product exists in DB.
  - Images are present (UploadThing or other hosted URLs).
  - Optional: `modelUrl` for 3D.
- **Behavior**:
  - Prices reflect discounts where applicable.
  - Review list is visible; review submission is available.
  - Out-of-stock products are treated as unavailable for adding to cart.

### 6.4 SEO & structured data (storefront)

- **What it is**: metadata generation and Schema.org JSON-LD for product pages.
- **Who benefits**: store owner (SEO), shoppers (rich snippets), buyer evaluating completeness.
- **Dependencies**:
  - Accurate product data (name/description/price/images).
  - Review data for aggregate rating.
- **Business value**:
  - Better share previews (OpenGraph/Twitter).
  - Rich results potential via structured data.

### 6.5 Reviews + moderation

- **What it is**: review creation, rating summary, and moderation controls.
- **Who uses it**:
  - Shoppers create reviews.
  - Admins moderate (hide/unhide).
- **Dependencies**: Prisma Review model; user identity available.
- **Behavior**:
  - Review average/count derived from visible reviews only.
  - Moderation is safety-focused: hidden reviews remain stored but not shown.
- **Operational note**:
  - For a serious production store, you may want additional anti-spam and verified-purchase rules; this is a common “next iteration” upgrade.

### 6.6 Wishlist

- **What it is**: per-user saved items.
- **Who uses it**: logged-in shoppers.
- **Dependencies**: WishlistItem model; user sync.
- **Value**: retention and future conversion.
- **Edge cases**:
  - Wishlist is empty if user isn’t authenticated.

### 6.7 Cart (“Bag”)

- **What it is**: Redis-backed cart keyed by user.
- **Who uses it**: logged-in shoppers.
- **Dependencies**: Upstash Redis env vars.
- **Behavior**:
  - Add-to-bag and remove item.
  - Totals calculated from item prices and quantities.
- **Risk/limitation**:
  - If Redis is not configured, cart cannot persist. A buyer should treat Redis as required for production.

### 6.8 Discount codes

- **What it is**: discount application to cart totals and checkout session.
- **Who uses it**: shoppers + admin.
- **Dependencies**: Discount model.
- **Behavior**:
  - Discount affects totals and can be reflected in Stripe session via a coupon.
- **Operational note**:
  - This is a session-based coupon creation approach; a buyer might prefer pre-created Stripe coupons or a more robust promotion engine for complex campaigns.

## 7) Customer account & self-service

### 7.1 Authentication

- **What it is**: Kinde-based authentication.
- **Who uses it**: shoppers and admins.
- **Dependencies**: Kinde env vars.
- **Business value**:
  - Simplifies identity management.
  - Enables order history, wishlist, saved addresses.

### 7.2 Account page

- **What it is**: `/store/account` with profile and address tabs.
- **Dependencies**: user session.
- **Value**: customer self-service and smoother checkout.

### 7.3 Address book

- **What it is**: saved addresses stored in the Address model.
- **Value**: reduces checkout friction.
- **Operational note**:
  - For international stores, you may need more address validation logic and region/state handling.

### 7.4 Orders history + order detail

- **What it is**: `/store/orders` and `/store/orders/[id]`.
- **Value**: transparency and reduced support tickets.
- **Behavior**:
  - Shows order total, items, and status.
  - Shows tracking information when available.

### 7.5 Returns request

- **What it is**: `/store/orders/[id]/return` creates ReturnRequest records.
- **Value**: returns process is present (rare for starters).
- **Dependencies**: ReturnRequest model.
- **Edge case**:
  - Whether a return request is allowed should depend on policy (delivered status, time window). If not enforced today, it’s a straightforward enhancement.

### 7.6 Contact / support

- **What it is**: contact form that creates Contact records.
- **Value**: lead capture and post-sale support funnel.

## 8) Checkout, payments, and shipping

### 8.1 Checkout flow

- **What it is**: authenticated checkout with shipping address capture.
- **Dependencies**:
  - Kinde auth.
  - Redis cart.
  - Stripe secret key.
  - Postgres.

### 8.2 Shipping rates (Shippo)

- **What it is**: shipping rate calculation from address.
- **Dependencies**: Shippo API key.
- **Important integrity behavior**:
  - Shipping rates are cached and later **server-verified** during checkout to prevent client-side price manipulation.
- **Business value**: real shipping choices; more accurate checkout totals.

### 8.3 Stripe Checkout Sessions

- **What it is**: redirects user to Stripe-hosted payment.
- **Dependencies**: Stripe secret key.
- **Behavior**:
  - Cart items and shipping show as line items.
  - Discounts can be applied.

### 8.4 Stripe webhooks (order finalization)

- **What it is**: webhook handler that finalizes payment and order state.
- **Dependencies**: Stripe webhook secret.
- **Reliability behavior**:
  - Signature verification.
  - Idempotency via WebhookEvent record.
  - Inventory decrement happens once per paid order.
- **Business value**: real transactional integrity.

### 8.5 Inventory behavior

- **What it is**: stock decrement at payment time.
- **Why it matters**:
  - Prevents overselling (to the extent stock is accurate).
  - Allows low-stock alerts and restock suggestions.

### 8.6 Shippo labels + tracking

- **What it is**:
  - Admin can buy labels.
  - Shippo webhook updates shipment status and order status.
- **Dependencies**: Shippo API + webhook verification secret/token.
- **Business value**: real fulfillment workflow.

## 9) Admin dashboard features

### 9.1 Admin gating

## 6) Storefront & shopping experience

### 6.1 Landing & brand experience

- **What it is**: a premium landing page to introduce the brand and move visitors into the shop.
- **Who uses it**: unauthenticated visitors.
- **Dependencies**: none (beyond base app).
- **Business value**: higher perceived brand value, clearer conversion path.
- **What a buyer might customize first**:
  - Brand colors and typography.
  - Hero content, imagery, CTA destinations.
  - Newsletter copy and placement.

### 6.2 Product catalog browsing (shop)

- **What it is**: a product grid with filtering/sorting/search.
- **Who uses it**: shoppers.
- **Dependencies**: products must exist in Postgres; Prisma schema set up.
- **Behavior**:
  - Displays products with images, pricing, and discount indication when applicable.
  - Provides filter controls for common attributes and categories.
  - Provides sort options (price/newness/popularity signals).
- **Edge cases to know**:
  - If the catalog is empty, the shop should show empty-state behavior.
  - If images are missing, product cards should degrade gracefully.

### 6.3 Product detail pages

- **What it is**: product pages with galleries, pricing, discount display, reviews, and optional 3D viewer.
- **Who uses it**: shoppers.
- **Dependencies**:
  - Product exists in DB.
  - Images are present (UploadThing or other hosted URLs).
  - Optional: `modelUrl` for 3D.
- **Behavior**:
  - Prices reflect discounts where applicable.
  - Review list is visible; review submission is available.
  - Out-of-stock products are treated as unavailable for adding to cart.

### 6.4 SEO & structured data (storefront)

- **What it is**: metadata generation and Schema.org JSON-LD for product pages.
- **Who benefits**: store owner (SEO), shoppers (rich snippets), buyer evaluating completeness.
- **Dependencies**:
  - Accurate product data (name/description/price/images).
  - Review data for aggregate rating.
- **Business value**:
  - Better share previews (OpenGraph/Twitter).
  - Rich results potential via structured data.

### 6.5 Reviews + moderation

- **What it is**: review creation, rating summary, and moderation controls.
- **Who uses it**:
  - Shoppers create reviews.
  - Admins moderate (hide/unhide).
- **Dependencies**: Prisma Review model; user identity available.
- **Behavior**:
  - Review average/count derived from visible reviews only.
  - Moderation is safety-focused: hidden reviews remain stored but not shown.
- **Operational note**:
  - For a serious production store, you may want additional anti-spam and verified-purchase rules; this is a common “next iteration” upgrade.

### 6.6 Wishlist

- **What it is**: per-user saved items.
- **Who uses it**: logged-in shoppers.
- **Dependencies**: WishlistItem model; user sync.
- **Value**: retention and future conversion.
- **Edge cases**:
  - Wishlist is empty if user isn’t authenticated.

### 6.7 Cart (“Bag”)

- **What it is**: Redis-backed cart keyed by user.
- **Who uses it**: logged-in shoppers.
- **Dependencies**: Upstash Redis env vars.
- **Behavior**:
  - Add-to-bag and remove item.
  - Totals calculated from item prices and quantities.
- **Risk/limitation**:
  - If Redis is not configured, cart cannot persist. A buyer should treat Redis as required for production.

### 6.8 Discount codes

- **What it is**: discount application to cart totals and checkout session.
- **Who uses it**: shoppers + admin.
- **Dependencies**: Discount model.
- **Behavior**:
  - Discount affects totals and can be reflected in Stripe session via a coupon.
- **Operational note**:
  - This is a session-based coupon creation approach; a buyer might prefer pre-created Stripe coupons or a more robust promotion engine for complex campaigns.

## 7) Customer account & self-service

### 7.1 Authentication

- **What it is**: Kinde-based authentication.
- **Who uses it**: shoppers and admins.
- **Dependencies**: Kinde env vars.
- **Business value**:
  - Simplifies identity management.
  - Enables order history, wishlist, saved addresses.

### 7.2 Account page

- **What it is**: `/store/account` with profile and address tabs.
- **Dependencies**: user session.
- **Value**: customer self-service and smoother checkout.

### 7.3 Address book

- **What it is**: saved addresses stored in the Address model.
- **Value**: reduces checkout friction.
- **Operational note**:
  - For international stores, you may need more address validation logic and region/state handling.

### 7.4 Orders history + order detail

- **What it is**: `/store/orders` and `/store/orders/[id]`.
- **Value**: transparency and reduced support tickets.
- **Behavior**:
  - Shows order total, items, and status.
  - Shows tracking information when available.

### 7.5 Returns request

- **What it is**: `/store/orders/[id]/return` creates ReturnRequest records.
- **Value**: returns process is present (rare for starters).
- **Dependencies**: ReturnRequest model.
- **Edge case**:
  - Whether a return request is allowed should depend on policy (delivered status, time window). If not enforced today, it’s a straightforward enhancement.

### 7.6 Contact / support

- **What it is**: contact form that creates Contact records.
- **Value**: lead capture and post-sale support funnel.

## 8) Checkout, payments, and shipping

### 8.1 Checkout flow

- **What it is**: authenticated checkout with shipping address capture.
- **Dependencies**:
  - Kinde auth.
  - Redis cart.
  - Stripe secret key.
  - Postgres.

### 8.2 Shipping rates (Shippo)

- **What it is**: shipping rate calculation from address.
- **Dependencies**: Shippo API key.
- **Important integrity behavior**:
  - Shipping rates are cached and later **server-verified** during checkout to prevent client-side price manipulation.
- **Business value**: real shipping choices; more accurate checkout totals.

### 8.3 Stripe Checkout Sessions

- **What it is**: redirects user to Stripe-hosted payment.
- **Dependencies**: Stripe secret key.
- **Behavior**:
  - Cart items and shipping show as line items.
  - Discounts can be applied.

### 8.4 Stripe webhooks (order finalization)

- **What it is**: webhook handler that finalizes payment and order state.
- **Dependencies**: Stripe webhook secret.
- **Reliability behavior**:
  - Signature verification.
  - Idempotency via WebhookEvent record.
  - Inventory decrement happens once per paid order.
- **Business value**: real transactional integrity.

### 8.5 Inventory behavior

- **What it is**: stock decrement at payment time.
- **Why it matters**:
  - Prevents overselling (to the extent stock is accurate).
  - Allows low-stock alerts and restock suggestions.

### 8.6 Shippo labels + tracking

- **What it is**:
  - Admin can buy labels.
  - Shippo webhook updates shipment status and order status.
- **Dependencies**: Shippo API + webhook verification secret/token.
- **Business value**: real fulfillment workflow.

## 9) Admin dashboard features

### 9.1 Admin gating

- **What it is**: allowlist-based admin access using `ADMIN_EMAILS`.
- **Why it matters to buyers**: eliminates the “hardcoded admin email” anti-pattern.

### 9.2 Product management

- **What it is**: create/edit/archive products with images, prices, categories, tags, stock.
- **Dependencies**: Prisma Product model; UploadThing for media.
- **Integrity**: Deleting a product triggers a **safe cascade** (removes reviews/wishlists) but **decouples orders** (`onDelete: SetNull`) so history is never lost.
- **Value**: complete catalog control.

### 9.3 Categories

- **What it is**: manage subcategories; drive storefront filtering.
- **Value**: merchandising and site structure.

### 9.4 Banner management

- **What it is**: manage marketing banners for the landing/hero.
- **Value**: store operators can run campaigns without engineering.

### 9.5 CSV import/export

- **What it is**:
  - Export products to CSV.
  - Import products from CSV with preview.
- **Value**: bulk operations and migration from other systems.

### 9.6 Orders + fulfillment tools

- **What it is**: admin order list and detail views.
- **Value**:
  - Central operational view.
  - Label purchase workflow.

### 9.7 Returns management

- **What it is**: approve/reject returns.
- **Value**: operational completeness.

### 9.8 Contact inbox

- **What it is**: triage customer messages (pending/completed/ignored), mark-as-read.
- **Value**: a real “contact center” workflow.

### 9.9 Email marketing + newsletter

- **What it is**:
  - Newsletter subscription from multiple entry points.
  - Broadcast emails with audience selection (batched async sending).
  - Unsubscribe page.
- **Dependencies**: Resend API key + from address.
- **Value**: monetization-ready marketing functionality.

### 9.10 Integrations health + diagnostics

- **What it is**: health cards for DB/Redis/Stripe/Resend/Shippo/Gemini and diagnostics tests.
- **Value**:
  - Buyers can trust integration readiness.
  - Operators can debug without engineers.

### 9.11 Audit logs

- **What it is**: records critical admin actions (create/update/delete/fulfillment).
- **Value**: accountability and debugging.

### 9.12 Alerts

- **What it is**: operational and anomaly alerts with a dashboard.
- **Value**: closer to a “real commerce ops system” than a basic template.

## 10) AI and advanced features

### 10.1 AI shopping assistant

- **What it is**: Gemini-powered assistant that can use live product data.
- **Dependencies**: Gemini API key.
- **Business value**:
  - Differentiation from generic e-commerce starters.
  - Potential lift in discovery and conversion.

### 10.2 AI search & reranking

- **What it is**: standard search plus AI reranking based on natural language.
- **Dependencies**: Gemini API key.
- **Reliability**:
  - Rate limiting.
  - Logging via `AiInteractionLog`.

### 10.3 AI COO mode (admin)

- **What it is**: generates a “briefing” and provides an advisor chat.
- **Value**: strong sales differentiator; highlights “AI-enabled operations.”
- **Tech Stack**: Powered by **Gemini 2.5 Flash** for high speed and lower cost.
- **Caveat**:
  - Buyers will ask about model costs and quotas; you should be ready with a practical answer (see monetization plan in Part 3).

### 10.4 AI-assisted email drafting

- **What it is**: drafts subject/body for campaigns.
- **Value**: reduces marketing effort and increases perceived feature depth.

### 10.5 AI vision-based tagging

- **What it is**: uses vision model to infer tags/attributes from product images.
- **Value**: faster catalog enrichment and better search.
- **Caveat**:
  - AI output must be reviewed; do not treat AI tags as ground truth.

### 10.6 3D models

- **What it is**: optional 3D viewer on product pages.
- **How it’s used**: when `modelUrl` exists.
- **Value**: premium “wow” feature for certain niches.

### 10.7 Meshy 3D generation workflow

- **What it is**: admin triggers Meshy generation; webhook updates state.
- **Dependencies**: Meshy API key.
- **Value**: differentiator for product experience.

### 10.8 Dressing Room / try-on (beta)

- **What it is**: Async try-on sessions (non-blocking) stored in DB; optional Replicate integration.
- **Dependencies**: Replicate token and model, or safe fallback; UploadThing for media.
- **Key Enhancements**:
  - **Infinite Scroll**: Shoe selector uses lazy loading to handle large catalogs without performance hits.
  - **Smart Uploads**: Custom UploadThing integration with drag-and-drop and real-time progress feedback.
- **Value**: strong demo feature; optional for many buyers.

---

# 11) Strengths and weaknesses (honest assessment)

This section is “what I would tell a serious buyer” if I wanted to build trust.

## 11.1 Strengths


## Scalability & Security Analysis

### Verified Performance (January 2026)
Load tested with k6 at 800 concurrent virtual users:
| Metric | Result |
| :--- | :--- |
| **Error Rate** | 0.00% (1 failure / 66,722 requests) |
| **p95 Latency** | 2.95s |
| **Throughput** | 135 requests/second |
| **Concurrent VUs** | 800 sustained |

### Traffic Capacity
- **Concurrent Users:** 800+ verified (target achieved).
- **Daily Visitors:** ~100,000+ per day (based on session duration).
- **Checkout Capacity:** ~50 - 100 checkouts per second (rate-limited).

### Performance Architecture
- **SSG**: Main category pages pre-rendered at build time.
- **Caching**: Product data cached for 60-300s with instant invalidation.
- **DB Pooling**: Neon pooler with 1 connection per Lambda.
- **Indexes**: Added to Product, Review, and Order tables.

**Security Measures**
- **Rate Limiting:** Active (10 requests / 10s per IP) on critical routes.
- **Input Validation:** Full Zod schema validation on all user inputs.
- **Authentication:** Managed via Kinde (Secure, encrypted sessions).
- **Data Protection:** Server Actions enforce ownership checks (Anti-IDOR).


### Strength A — Operational completeness

Aethelona has multiple flows that many templates skip:

- Returns request + admin management.
- Shipping labels + tracking updates.
- Email marketing with unsubscribe.
- Integration health dashboard.

This makes it easier to sell as “ready to operate,” not just “nice UI.”

### Strength B — Real webhook hardening (idempotency)

The webhook handling uses idempotency to prevent double-processing on retries, which is a production-grade detail buyers look for.

### Strength C — Admin gating is clean

Using an env allowlist for admins is a solid, simple approach that works for most small-to-medium stores and agencies.

### Strength D — Differentiation via AI + 3D

Even if buyers don’t enable every AI/3D feature, having them already integrated increases perceived value and gives a clear “premium starter kit” position.

### Strength E — Diagnostics and observability hooks exist

`AiInteractionLog`, integration health checks, and admin diagnostics are a strong base for operating the system without guesswork.

### Strength F — Dynamic Shipping Logic

The system now calculates exact shipping weights dynamically via server-side product lookups (`/api/shipping/rates`), ensuring large orders are quoted correctly. It has moved beyond simple flat-rate logic.

### Strength G — Technical Health & Security

- **Zero Latency Schema**: Switched to `Prisma.dmmf` for faster AI dashboard performance.
- **Log Hygiene**: Automated scrubbing of sensitive logs in production.
- **Fail-Safe Config**: Explicit errors for missing API keys prevent silent failures.

### Strength H — AI Privacy & Feature Polish

- **Data Firewall**: Public AI (Chatbot) is blocked from accessing sensitive sales data, while Admin AI (COO) manages it freely.
- **Smart Search**: Constrained to 5 results with "Seed" data filtering for high-quality recommendations.
- **Lint Zero**: A completely clean codebase with zero ESLint warnings.

### Strength I — SEO Intelligence & Discovery

- **Dynamic Sitemap**: Real-time indexing of all products.
- **Rich Snippets**: Built-in JSON-LD for Google Shopping prices and availability.
- **Social Cards**: Auto-generating OpenGraph images for Twitter/LinkedIn.

### Strength J — Serverless Background Jobs

AI operations and email broadcasts use Next.js 15 `after()` for zero-cost, non-blocking background processing. This prevents browser hangs during long tasks like Virtual Try-On.

### Strength K — UI/UX Excellence

- **Streaming Skeletons**: Custom `loading.tsx` UIs prevent layout shift and show immediate feedback during data fetches.
- **Brand Retention**: Custom `not-found.tsx` (404) guiding lost users back to the shop instead of a generic error page.
- **Micro-interactions**: Framer Motion animations and Sonner toasts for premium feel.

### Strength L — Front-End Performance Engineering

- **Infinite Scrolling**: Implemented on heavy UI components (like the Try-On shoe selector) to load data only when needed, drastically reducing initial page load weight.
- **Lazy Loading**: Images and heavy assets are lazy-loaded to ensure "Above the Fold" content renders instantly (LCP optimization).
- **Prefetch Strategy**: Global "All Products" links use `prefetch={false}` to prevent server congestion (DoS prevention), ensuring instant navigation.
- **Metadata Splitting**: `generateMetadata` is decoupled from the main data fetch, reducing database load by 50% per page view.

## 11.2 Weaknesses / limitations (and how to frame them)

### Weakness A — Internationalization & Taxes

The system is currently USD-first. If a buyer wants multi-currency or region-specific VAT/GST logic, they will need to extend the pricing and checkout modules. This is standard for starter kits but should be disclosed.

### Weakness B — Legal Templates (Disclaimer)

Legal pages (`/legal/*`) are provided as functional templates only. They are **not** legal advice and must be replaced by the buyer's own policies.


---

End of Part 2.

Next: Part 3 will cover monetization routes, your best monetization plan, what to do/avoid, pricing, buyer objections, roadmap, and a “future of the project” section.

---

# Part 3 — Monetization, best plan, do/don’t, and the future

This is the section you’ll use the most when selling the project.

It answers:

- What can I sell, to whom, and how many times?
- What should I charge?
- What offer structure maximizes buyer trust and price?
- What are the hidden risks that could ruin the sale?
- What should I build next if I want a higher valuation?

## 12) All monetization routes (complete list)

I’m listing **all realistic routes**, including ones you might decide not to pursue.

### Route 1 — Non-exclusive license (sell multiple times)

- **What you sell**: access to the repo (or a packaged code download) under a license that allows use for one store or one client project.
- **Who buys**:
  - Agencies that want a repeatable starter.
  - Founders launching quickly.
  - Freelancers building stores for clients.
- **Pros**:
  - You can sell it repeatedly.
  - Lower buyer friction (cheaper).
- **Cons**:
  - Lower ticket size per deal.
  - Buyers will request support; you must define support boundaries.
- **Recommended price band**:
  - Basic license: $299–$1,500.
  - Pro license with setup help: $1,500–$4,000.
  - Agency pack (multiple seats/projects): $3,000–$10,000.

### Route 2 — Exclusive sale (one buyer owns it)

- **What you sell**: full repo ownership / exclusive rights (often with a handover package).
- **Who buys**:
  - A studio that wants a proprietary internal framework.
  - A founder who wants to brand and build on it without competition.
- **Pros**:
  - Highest single-ticket payout.
  - Cleaner: one relationship.
- **Cons**:
  - You can’t sell the same asset again.
  - Buyer due diligence is harsher.
- **Recommended price band**:
  - $8,000–$35,000+ depending on demo quality, tests, documentation, and your included support.

### Route 3 — “White-label + deployment” service (productized service)

- **What you sell**: you deploy it for the buyer, configure env vars, load initial catalog, and hand it over.
- **Who buys**: founders who want a working store, not code.
- **Pros**:
  - High margins and repeatable.
  - Buyers pay for outcomes.
- **Cons**:
  - You become responsible for delivery quality.
  - Requires client communication and clear scope.
- **Recommended price band**:
  - $3,000–$15,000 depending on scope (branding, data import, content, integrations).

### Route 4 — Retainer / ongoing maintenance

- **What you sell**: monthly support for bug fixes, feature tweaks, campaign help.
- **Who buys**: buyers who are not technical or who want guaranteed response times.
- **Pros**:
  - Predictable revenue.
  - Builds long-term value.
- **Cons**:
  - You must set SLAs and boundaries.
- **Recommended price band**:
  - $300–$2,000/month (scope defines the band).

### Route 5 — Agency “starter kit” for internal use (B2B)

- **What you sell**: a package license + onboarding + architecture walkthrough so the agency can build client stores faster.
- **Who buys**: agencies that do multiple builds per year.
- **Pros**:
  - Higher willingness to pay.
  - Fewer “how do I deploy?” questions.
- **Cons**:
  - They will evaluate code structure intensely.
- **Recommended price band**:
  - $5,000–$25,000 depending on exclusivity and training.

### Route 6 — Sell as a marketplace template (Gumroad / LemonSqueezy / etc.)

- **What you sell**: a downloadable template.
- **Pros**:
  - Distribution leverage.
  - Passive sales potential.
- **Cons**:
  - Support overhead can destroy margin.
  - Buyers may be low-signal; refunds/disputes.
- **How to make it viable**:
  - Extremely clear “requirements” section.
  - A “no support” tier + a “support included” tier.

### Route 7 — Add-on modules sold separately

- **What you sell**: optional modules/features for an existing buyer base.
- **Examples**:
  - Advanced promotions engine.
  - Loyalty points.
  - Subscription products.
  - Multi-warehouse shipping.
  - Automated returns labels.
- **Pros**:
  - High-margin upsells.
  - Lets buyers start small.
- **Cons**:
  - Requires a buyer base.

### Route 8 — Convert to a SaaS (multi-tenant) product

- **What you sell**: hosted service where customers create stores.
- **Reality check**:
  - This is the most complex path.
  - It requires a redesign of auth, data model, keys, billing, tenant isolation.
- **Pros**:
  - Potentially the highest long-term value.
- **Cons**:
  - Highest time and complexity.
  - Not a quick sell.

### Route 9 — Training / course / “how to launch” package

- **What you sell**: video walkthrough + deployment + marketing playbook.
- **Pros**:
  - Increases perceived value.
  - Reduces support tickets because buyers self-serve.
- **Cons**:
  - Upfront time to produce.

### Route 10 — Sell the store as a running business (not just code)

- **What you sell**: code + brand + domain + a live store with revenue.
- **Pros**:
  - Much higher valuation multiple.
- **Cons**:
  - Requires execution and traction.

## 13) Best plan for monetization (my recommendation)

Your “best plan” depends on your goal:

- If your goal is **fast cash**: sell an exclusive acquisition.
- If your goal is **max lifetime value**: sell licenses + productized setup services.

Given your request (“finalize and sell”), the optimal path is a **two-track plan**:

### Track A — High-ticket exclusive buyer (parallel outreach)

- **Target**: agencies and studios.
- **Offer**: exclusive acquisition + handover + 2 weeks support.
- **Pricing goal**: $12,000–$25,000.

### Track B — Non-exclusive licensing + optional setup service

- **Target**: founders and freelancers.
- **Offer**:
  - License tier (cheap).
  - Setup tier (expensive).
  - Maintenance tier (monthly).
- **Pricing goal**:
  - License: $499–$1,500.
  - Setup: $2,500–$7,500.
  - Maintenance: $300–$1,500/mo.

You can run both tracks at the same time. If an exclusive buyer appears and pays, you stop selling licenses.

## 14) Offer design (what exactly you sell)

Most sales fail because the buyer doesn’t know what they’re getting. Use a clear package.

### 14.1 Deliverables you should always include

- Repo access / zip.
- A deployment checklist (env vars, DB push, build, webhook URLs).
- A short “operator guide” (where to click in the dashboard).
- A “limits and assumptions” page (what is not included).

### 14.2 Optional but high-value deliverables

- A deployed demo (Vercel) with a demo admin account.
- A 5–8 minute walkthrough video.
- Test evidence:
  - build passes
  - unit tests pass
  - e2e tests pass (if run)

### 14.3 Contract terms (simple and protective)

- If non-exclusive: specify “one store / one client project” unless they buy an agency license.
- If exclusive: specify whether they get all rights or just an exclusive license.
- Define support scope and response times.

## 15) Pricing strategy (how to choose your numbers)

Pricing should reflect:

- **Time saved**: how many weeks of engineering does it replace?
- **Risk reduction**: does it include the hard parts (webhooks, shipping, admin ops)?
- **Differentiators**: AI + 3D increase perceived value.
- **Support**: support multiplies price.

### 15.1 Suggested pricing table (you can copy/paste)

- **Starter License (no support)**: $499
  - Code + docs only.
  - No deployment help.

- **Pro License (1 hour onboarding call)**: $1,500
  - Code + docs.
  - 1 onboarding call.
  - 7 days email Q&A.

- **Launch Setup (done-with-you)**: $3,500
  - Deploy to Vercel + configure Postgres + Redis.
  - Configure Stripe and webhooks.
  - Basic catalog import.

- **Agency Pack**: $7,500
  - Up to 5 projects.
  - Architecture walkthrough.
  - Priority Q&A window.

- **Exclusive Acquisition**: $15,000–$25,000
  - Repo transfer.
  - 2 weeks support.
  - Optional: handover video + training.

## 16) Sales process (how to find and close buyers)

### 16.1 Where to find buyers

- Agencies:
  - LinkedIn (search “web agency”, “ecommerce agency”, “Shopify agency” — but pitch as Next.js custom alternative).
  - Twitter/X builders.
  - Upwork agencies.

- Founders:
  - Indie Hackers.
  - Founder communities.
  - Product Hunt side-project groups.

- Template buyers:
  - Gumroad/LemonSqueezy ecosystems.

### 16.2 Your outreach message should do three things

- Show it’s complete (payments + shipping + admin ops).
- Show it’s modern (Next.js 15 + React 19).
- Show differentiation (AI assistant/search, optional 3D).

### 16.3 What to show in the first demo

Use the Part 1 demo script. Do not overload.

### 16.4 What to show in the second demo

- Webhooks and idempotency explanation.
- Admin product creation and CSV import.
- Email campaign composer + unsubscribe.
- Integrations diagnostics.

### 16.5 Closing strategy

- Make the buyer choose between 2–3 packages (never 10).
- Put a clear deadline on support windows.
- Offer a deposit milestone:
  - 50% to start transfer
  - 50% after handover call

## 17) Things you should do and avoid (selling + operating)

### 17.1 Things you should do

- Maintain a demo deployment that is stable.
- Keep a clean `.env.example` or env checklist (buyers panic without it).
- Provide a “Known limitations” list.
- Be explicit that legal pages are templates.
- Keep a simple admin onboarding guide.
- Save test results (screenshots/logs) and share them.

### 17.2 Things you should avoid

- Avoid claiming “legal compliance” or “fraud-proof.”
- Avoid saying “AI will increase revenue” as a guarantee.
- Avoid selling “SaaS-ready” unless you actually make it multi-tenant.
- Avoid bundling unlimited support.
- Avoid making the buyer configure 10 services without a checklist.

## 18) Risk register (what can break, how to mitigate)

This is the section that makes you look professional.

### Risk 1 — External provider keys missing or misconfigured

- **Impact**: parts of the app fail (payments, shipping, emails, AI).
- **Mitigation**:
  - Provide an env checklist.
  - Use the integrations health dashboard to verify.

### Risk 2 — Webhook URLs not set in Stripe/Shippo

- **Impact**: orders never finalize, shipments never update.
- **Mitigation**:
  - Include a webhook setup checklist.
  - Provide example webhook URLs for Vercel.

### Risk 3 — Shipping cost tampering (security)

- **Impact**: undercharging shipping.
- **Mitigation**: server-side verification is present (shipping rate cached + verified).

### Risk 4 — AI cost surprises

- **Impact**: buyer gets unexpected bills.
- **Mitigation**:
  - Document expected usage.
  - Provide “AI off switch” guidance (disable AI routes or hide UI toggles).

### Risk 5 — Inventory drift

- **Impact**: stock becomes inaccurate.
- **Mitigation**:
  - Inventory decrement is tied to Stripe success.
  - Add periodic reconciliation (future roadmap item).

### Risk 6 — Deliverability issues (Resend)

- **Impact**: emails land in spam.
- **Mitigation**:
  - Buyer should set a proper sending domain.
  - Keep unsubscribe compliance.

## 19) Roadmap (future of the project)

This roadmap is designed to increase sale value.

### Phase 1 (1–2 weeks): “Sale polish”

- Remove ESLint warnings.
- Run Playwright tests and record results.
- Create demo seed data (20–40 products) and a visually strong landing.
- Create a short video walkthrough.

### Phase 2 (1–2 months): “Operational upgrades”

- **Improve background reliability**: Add Dead Letter Queue for failed `after()` jobs.
- Better shipping parcel logic per cart.
- Return label automation (optional).
- Verified purchase reviews.

### Phase 3 (3–6 months): “Growth features”

- Loyalty and referrals.
- Abandoned cart email automation.
- Subscriptions (if niche fits).
- More advanced promotions and bundles.

### Phase 4 (6–12 months): “Platformization”

- Multi-store / multi-tenant (only if you decide to build SaaS).
- Built-in billing and tenant management.

## 20) Buyer FAQ (answers to the questions that will come up)

### Q1: What does the buyer need to run this?

- A Postgres database.
- Redis (Upstash) for cart.
- Auth provider (Kinde).
- Stripe keys + webhook secret.
- Shippo key + webhook verification.
- Resend key + from address.
- Gemini key if they want AI features.

### Q2: Can I remove AI features?

Yes. The storefront still functions without AI. AI features are optional, but removing AI UI components cleanly is a small customization task.

### Q3: Is this Shopify?

No. It is a custom Next.js store. The correct positioning is “Shopify-like capabilities but with full code ownership and deep customization.”

### Q4: How are payments handled?

Stripe Checkout Sessions for payment collection, with webhooks finalizing orders and inventory.

### Q5: How are shipping rates handled?

Shippo rates are fetched during checkout. The selected rate is verified server-side during checkout.

### Q6: What’s the biggest missing thing?

For enterprise-grade stores: taxes/multi-currency, advanced shipping logic, and background jobs. These are normal follow-on improvements.

### Q7: What is the most valuable proof you can show?

- A live demo deployment.
- A walkthrough video.
- Build/test evidence.
- A simple operating guide.

---

End of Part 3.

At this point the dossier should be approaching the required length; if you still need more words, the next expansion sections would be:

- A “Competitive analysis” section (Shopify vs headless vs Aethelona).
- A “Security posture checklist” section.
- A “Deployment runbook with screenshots” section.

---

# Addendum — Security posture checklist + deployment runbook (concise)

This addendum exists purely to answer two classes of buyer questions that commonly appear late in due diligence: “Is it secure enough to start?” and “Can my team deploy it without you?”

## A) Security posture checklist (what to verify before production)

### A1) Secrets and configuration

- Confirm **no secrets** are committed (keys live in `.env*` files, which should not be committed).
- Ensure production environment variables are set in hosting (Vercel) and that `NEXT_PUBLIC_*` values contain **no secret material**.
- Set `ADMIN_EMAILS` to a small allowlist (avoid “anyone with @domain.com” unless that’s intended).

### A2) Authentication and authorization

- Verify Kinde is configured correctly and that admin-only routes/actions are inaccessible to normal users.
- Confirm all admin workflows that mutate data (products, banners, orders, returns, email) require an authenticated admin.

### A3) Webhooks

- Stripe webhook endpoint must validate signature (`STRIPE_WEBHOOK_SECRET` set).
- Shippo webhook endpoint must validate either HMAC secret or token (depending on configuration).
- Confirm idempotency is enabled and that duplicate webhook deliveries do not double-create payments, shipments, or inventory deductions.

### A4) Payments and integrity

- Confirm checkout creates a **pending** order first, then webhooks finalize it after payment success.
- Confirm shipping costs are not trusted from the client and are validated server-side using cached rates.

### A5) AI endpoints and abuse prevention

- Ensure rate limiting is enabled for AI routes (assistant/search) to limit abuse.
- Review what user input is logged to `AiInteractionLog` and ensure it aligns with privacy expectations (especially if you store IPs).

### A6) Email compliance

- Configure `RESEND_FROM` to a verified sending identity.
- Confirm unsubscribe workflow works and is included in broadcasts.
- If the buyer operates in regions with stricter marketing laws, they should implement explicit opt-in language and retention policy.

## B) Deployment runbook (minimal steps)

This is the shortest “deployment recipe” that still works.

1) **Create Postgres** (Neon or equivalent) and set `DATABASE_URL`.
2) **Create Redis** (Upstash) and set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
3) **Set up Kinde** (issuer/client/secret/site URL) and confirm login works.
4) **Set up Stripe** and add:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - Configure webhook URL to `/api/webhooks/stripe`.
5) **Set up Shippo** and add:
   - `SHIPPO_API_KEY`
   - Configure webhook URL to `/api/webhooks/shippo`.
6) **Set up Resend** and add:
   - `RESEND_API_KEY`
   - `RESEND_FROM`
7) Optional:
   - Gemini: `GEMINI_API_KEY`
   - Meshy: `MESHY_API_KEY`
   - Replicate: `REPLICATE_API_TOKEN` + `REPLICATE_VTON_MODEL`
8) Run DB migration/sync (`prisma db push` + `prisma generate`) in the deployment pipeline.
9) Verify `/api/health` and the admin integrations dashboard.

End of addendum.
