/**
 * Structured Data (JSON-LD) helpers.
 *
 * Usage: render the output of these functions inside a
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
 * Server Component tag. All helpers return plain typed objects — no runtime deps.
 */

const SITE_URL = process.env.NEXT_PUBLIC_URL ?? "https://aethelon.com";

// ---------------------------------------------------------------------------
// Organisation — sitewide singleton
// ---------------------------------------------------------------------------
export function organizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Aethelon",
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
        sameAs: [
            "https://instagram.com/aethelon",
            "https://twitter.com/aethelon",
        ],
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: "English",
        },
    } as const;
}

// ---------------------------------------------------------------------------
// WebSite — enables sitelinks search box in Google
// ---------------------------------------------------------------------------
export function websiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Aethelon",
        url: SITE_URL,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    } as const;
}

// ---------------------------------------------------------------------------
// Product schema
// ---------------------------------------------------------------------------
export interface ProductSchemaInput {
    id: string;
    name: string;
    description?: string | null;
    images: string[];
    price: number; // in cents
    currency?: string;
    brand?: string;
    inStock: boolean;
    ratingValue?: number | null;
    reviewCount?: number | null;
}

export function productSchema(product: ProductSchemaInput) {
    const price = (product.price / 100).toFixed(2);
    const schema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description ?? undefined,
        image: product.images,
        url: `${SITE_URL}/shop/${product.id}`,
        brand: {
            "@type": "Brand",
            name: product.brand ?? "Aethelon",
        },
        offers: {
            "@type": "Offer",
            url: `${SITE_URL}/shop/${product.id}`,
            priceCurrency: product.currency ?? "USD",
            price,
            availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Organization",
                name: "Aethelon",
            },
        },
    };

    if (product.ratingValue && product.reviewCount) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: product.ratingValue,
            reviewCount: product.reviewCount,
        };
    }

    return schema;
}

// ---------------------------------------------------------------------------
// Article / BlogPost schema
// ---------------------------------------------------------------------------
export interface ArticleSchemaInput {
    title: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    publishedAt?: Date | null;
    updatedAt?: Date | null;
    author?: string | null;
}

export function articleSchema(article: ArticleSchemaInput) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.description ?? undefined,
        image: article.image ?? undefined,
        url: `${SITE_URL}/blog/${article.slug}`,
        datePublished: article.publishedAt?.toISOString() ?? undefined,
        dateModified: article.updatedAt?.toISOString() ?? undefined,
        author: {
            "@type": "Person",
            name: article.author ?? "Aethelon Editorial",
        },
        publisher: {
            "@type": "Organization",
            name: "Aethelon",
            logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/icon.png`,
            },
        },
    } as const;
}

// ---------------------------------------------------------------------------
// BreadcrumbList schema
// ---------------------------------------------------------------------------
export interface BreadcrumbItem {
    name: string;
    url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.url,
        })),
    } as const;
}
