
import { PrismaClient, ProductStatus, OrderStatus, PaymentStatus, UserRole, FulfillmentStatus, InventoryTransactionType, RankingMode, MainCategory, CampaignStatus } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Initialize Prisma Client
const prisma = new PrismaClient().$extends(withAccelerate());

// --- CONSTANTS ---
const ADMIN_EMAIL = 'admin@aethelon.com';

// --- HIERARCHY DEFINITION ---
const TAXONOMY = [
    {
        name: 'Living Room',
        slug: 'living-room',
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=1000',
        children: [
            { name: 'Sofas & Sectionals', slug: 'sofas', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Coffee Tables', slug: 'coffee-tables', image: 'https://images.unsplash.com/photo-1533090481728-4660ebbc48f1?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Accent Chairs', slug: 'accent-chairs', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000' }
        ]
    },
    {
        name: 'Dining',
        slug: 'dining',
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=1000',
        children: [
            { name: 'Dining Tables', slug: 'dining-tables', image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Dining Chairs', slug: 'dining-chairs', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Bar Stools', slug: 'bar-stools', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000' }
        ]
    },
    {
        name: 'Bedroom',
        slug: 'bedroom',
        image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=1000',
        children: [
            { name: 'Beds', slug: 'beds', image: 'https://images.unsplash.com/photo-1505693416388-334340d269a9?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Nightstands', slug: 'nightstands', image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Dressers', slug: 'dressers', image: 'https://images.unsplash.com/photo-1595514536733-1579717dfb11?auto=format&fit=crop&q=80&w=1000' }
        ]
    },
    {
        name: 'Office',
        slug: 'office',
        image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000',
        children: [
            { name: 'Desks', slug: 'desks', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Office Chairs', slug: 'office-chairs', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=1000' }
        ]
    },
    {
        name: 'Decor',
        slug: 'decor',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000',
        children: [
            { name: 'Rugs', slug: 'rugs', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Lighting', slug: 'lighting', image: 'https://images.unsplash.com/photo-1507643179773-3e975d7ac515?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Vases', slug: 'vases', image: 'https://images.unsplash.com/photo-1581539250439-c923cd226718?auto=format&fit=crop&q=80&w=1000' }
        ]
    }
];

const FUNCTIONAL_COLLECTIONS = [
    { name: 'New Arrivals', slug: 'new-arrivals', mode: RankingMode.TRENDING, image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Best Sellers', slug: 'best-sellers', mode: RankingMode.TRENDING, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Sustainable', slug: 'sustainable', mode: RankingMode.SEMANTIC, image: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Comfort', slug: 'comfort', mode: RankingMode.SEMANTIC, image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=1000' }
];

const PRODUCTS = [
    // --- LIVING ROOM ---
    {
        name: 'Cloud Modular Sofa',
        description: 'Experience the ultimate potential of relaxation with our Cloud Modular Sofa. Upholstered in premium, stain-resistant fabric.',
        price: 329900, mainCat: 'living-room', subCat: 'sofas', extraCats: ['comfort', 'best-sellers'],
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000'],
        features: ['Modular configuration', 'Stain-resistant', 'Feather-blend'],
        stock: 12, rating: 4.8, reviews: 42,
        modelUrl: null // No model
    },
    {
        name: 'Velvet Tuxedo Sofa',
        description: 'A statement piece for any modern living room. Deep button tufting and tuxedo arms.',
        price: 219900, mainCat: 'living-room', subCat: 'sofas', extraCats: ['new-arrivals'],
        images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1000'],
        features: ['Velvet upholstery', 'Button tufting', 'Solid wood legs'],
        stock: 8, rating: 4.5, reviews: 15,
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb', // Vault item!
        isVaultExclusive: true
    },
    {
        name: 'Mid-Century Accent Chair',
        description: 'Timeless vintage charm with modern durability.',
        price: 59900, mainCat: 'living-room', subCat: 'accent-chairs', extraCats: ['sustainable'],
        images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000'],
        features: ['Solid walnut frame', 'High-density foam'],
        stock: 45, rating: 4.6, reviews: 28,
        modelUrl: null
    },
    {
        name: 'Oasis Lounge Chair',
        description: 'Sink into unparalleled comfort with this oversized lounge chair.',
        price: 84900, mainCat: 'living-room', subCat: 'accent-chairs', extraCats: ['comfort'],
        images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000'],
        features: ['Ergonomic backrest', 'Linen blend'],
        stock: 20, rating: 4.9, reviews: 102,
        modelUrl: null
    },
    {
        name: 'Marble Block Coffee Table',
        description: 'Solid Carrara marble carved into a minimalist geometric block.',
        price: 125000, mainCat: 'living-room', subCat: 'coffee-tables', extraCats: ['best-sellers'],
        images: ['https://images.unsplash.com/photo-1533090481728-4660ebbc48f1?auto=format&fit=crop&q=80&w=1000'],
        features: ['Real Carrara marble', 'Weight: 200lbs', 'Hand-polished'],
        stock: 5, rating: 4.7, reviews: 12,
        modelUrl: null,
        isVaultExclusive: true
    },

    // --- DINING ---
    {
        name: 'Reclaimed Oak Dining Table',
        description: 'Rustic elegance for family gatherings.',
        price: 189900, mainCat: 'dining', subCat: 'dining-tables', extraCats: ['sustainable'],
        images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=1000'],
        features: ['Reclaimed oak', 'Seals 8-10', 'Hand-finished'],
        stock: 5, rating: 4.8, reviews: 31,
        modelUrl: null
    },
    {
        name: 'Scandi Dining Chair Set (Set of 2)',
        description: 'Minimalist curved wood dining chairs.',
        price: 45000, mainCat: 'dining', subCat: 'dining-chairs', extraCats: ['best-sellers'],
        images: ['https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=1000'],
        features: ['Bentwood construction', 'Matte finish'],
        stock: 40, rating: 4.4, reviews: 88,
        modelUrl: null
    },
    {
        name: 'Industrial Counter Stool',
        description: 'Raw steel frame with a thick oak seat, perfect for modern kitchens.',
        price: 22000, mainCat: 'dining', subCat: 'bar-stools', extraCats: [],
        images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000'],
        features: ['Adjustable height', 'Powder-coated steel'],
        stock: 60, rating: 4.2, reviews: 19,
        modelUrl: null
    },

    // --- BEDROOM ---
    {
        name: 'Haven Platform Bed',
        description: 'Minimalist sanctuary.',
        price: 149900, mainCat: 'bedroom', subCat: 'beds', extraCats: ['comfort'],
        images: ['https://images.unsplash.com/photo-1505693416388-334340d269a9?auto=format&fit=crop&q=80&w=1000'],
        features: ['Solid oak', 'Low profile'],
        stock: 8, rating: 4.7, reviews: 56,
        modelUrl: null
    },
    {
        name: 'Walnut 6-Drawer Dresser',
        description: 'Mid-century storage solution with brass hardware.',
        price: 110000, mainCat: 'bedroom', subCat: 'dressers', extraCats: ['new-arrivals'],
        images: ['https://images.unsplash.com/photo-1595514536733-1579717dfb11?auto=format&fit=crop&q=80&w=1000'],
        features: ['Soft-close drawers', 'Solid American Walnut'],
        stock: 14, rating: 4.8, reviews: 11,
        modelUrl: null
    },
    {
        name: 'Platform Nightstand',
        description: 'Matching nightstand for the Haven Platform bed.',
        price: 35000, mainCat: 'bedroom', subCat: 'nightstands', extraCats: [],
        images: ['https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=1000'],
        features: ['Open cubby', 'Cable management'],
        stock: 25, rating: 4.5, reviews: 34,
        modelUrl: null
    },

    // --- OFFICE ---
    {
        name: 'ErgoPro Office Chair',
        description: 'High performance ergonomic chair.',
        price: 129900, mainCat: 'office', subCat: 'office-chairs', extraCats: ['comfort', 'best-sellers'],
        images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=1000'],
        features: ['4D Armrests', 'Mesh back'],
        stock: 100, rating: 4.9, reviews: 89,
        modelUrl: null
    },
    {
        name: 'Executive Standing Desk',
        description: 'Motorized dual-leg standing desk with a matte anti-fingerprint surface.',
        price: 89900, mainCat: 'office', subCat: 'desks', extraCats: ['new-arrivals'],
        images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000'],
        features: ['Memory presets', 'Cable tray included'],
        stock: 30, rating: 4.6, reviews: 55,
        modelUrl: null,
        isVaultExclusive: true
    },

    // --- DECOR ---
    {
        name: 'Ceramic Vase Set',
        description: 'Artisan Earth tones.',
        price: 12900, mainCat: 'decor', subCat: 'vases', extraCats: ['new-arrivals'],
        images: ['https://images.unsplash.com/photo-1581539250439-c923cd226718?auto=format&fit=crop&q=80&w=1000'],
        features: ['Hand-thrown', 'Watertight'],
        stock: 150, rating: 4.8, reviews: 45,
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb', // Vault item!
        isVaultExclusive: true
    },
    {
        name: 'Brass Floor Lamp',
        description: 'Slender architectural lighting casting a warm ambient glow.',
        price: 24500, mainCat: 'decor', subCat: 'lighting', extraCats: ['best-sellers'],
        images: ['https://images.unsplash.com/photo-1507643179773-3e975d7ac515?auto=format&fit=crop&q=80&w=1000'],
        features: ['Dimmable LED', 'Solid brass base'],
        stock: 60, rating: 4.9, reviews: 112,
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb', // Vault item!
        isVaultExclusive: true
    },
    {
        name: 'Hand-woven Wool Rug (8x10)',
        description: 'Plush texture. ethically sourced.',
        price: 54900, mainCat: 'decor', subCat: 'rugs', extraCats: ['sustainable'],
        images: ['https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=1000'],
        features: ['100% Wool', 'Hand-tufted'],
        stock: 22, rating: 4.7, reviews: 67,
        modelUrl: null
    }
];

// --- SCORING ---
function calculateStaticScore(rating: number, reviewCount: number, createdAt: Date): number {
    const logReviews = Math.log(reviewCount + 1);
    const popularityScore = Math.min(1, logReviews / 5) * 0.4;
    const normalizedRating = Math.max(0, Math.min(1, (rating - 3) / 2));
    const ratingScore = normalizedRating * 0.3;
    const daysOld = (new Date().getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
    const recencyScore = (1 / (1 + daysOld / 30)) * 0.3;
    return Number((popularityScore + ratingScore + recencyScore).toFixed(2));
}

// --- MAIN ---
async function main() {
    console.log("🌱 Starting Full Aethelon Seed...");

    try {
        // 1. CLEANUP
        console.log("🧹 Cleanup...");
        await prisma.banner.deleteMany();
        await prisma.campaignProduct.deleteMany();
        await prisma.campaign.deleteMany();

        // Target Featured Products Arrays
        const springProductNames = ['Cloud Modular Sofa', 'Brass Floor Lamp', 'Ceramic Vase Set', 'Platform Nightstand'];
        const execProductNames = ['ErgoPro Office Chair', 'Executive Standing Desk', 'Mid-Century Accent Chair', 'Walnut 6-Drawer Dresser'];
        await prisma.orderItem.deleteMany();
        await prisma.inventoryTransaction.deleteMany();
        await prisma.review.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();

        // 2. USERS
        console.log("👤 Creating Users...");
        await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                email: ADMIN_EMAIL,
                firstName: 'Admin',
                lastName: 'User',
                profileImage: '',
                role: UserRole.ADMIN
            }
        });

        // 3. CATEGORIES
        console.log("📂 Creating Taxonomy...");
        const catMap = new Map<string, string>(); // slug -> id
        for (const f of FUNCTIONAL_COLLECTIONS) {
            const cat = await prisma.category.create({ data: { name: f.name, slug: f.slug, rankingMode: f.mode, image: f.image } });
            catMap.set(f.slug, cat.id);
        }
        for (const parent of TAXONOMY) {
            const pCat = await prisma.category.create({ data: { name: parent.name, slug: parent.slug, image: parent.image } });
            catMap.set(parent.slug, pCat.id);
            for (const child of parent.children) {
                const cCat = await prisma.category.create({ data: { name: child.name, slug: child.slug, parentId: pCat.id, image: child.image } });
                catMap.set(child.slug, cCat.id);
            }
        }

        // 4. PRODUCTS
        console.log("📦 Creating Products...");
        const createdProducts = [];
        for (const p of PRODUCTS) {
            const catIds = [];
            if (catMap.has(p.mainCat)) catIds.push({ id: catMap.get(p.mainCat) });
            if (catMap.has(p.subCat)) catIds.push({ id: catMap.get(p.subCat) });
            if (p.extraCats) {
                for (const ec of p.extraCats) {
                    if (catMap.has(ec)) catIds.push({ id: catMap.get(ec) });
                }
            }

            const staticScore = calculateStaticScore(p.rating, p.reviews, new Date());

            const product = await prisma.product.create({
                data: {
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    images: p.images,
                    features: p.features,
                    tags: [p.mainCat, p.subCat, ...(p.extraCats || [])],
                    stockQuantity: p.stock,
                    averageRating: p.rating,
                    reviewCount: p.reviews,
                    staticScore: staticScore,
                    status: ProductStatus.published,
                    mainCategory: MainCategory.MEN,
                    isFeatured: springProductNames.includes(p.name) || execProductNames.includes(p.name),
                    isVaultExclusive: (p as any).isVaultExclusive || false,
                    modelUrl: p.modelUrl,
                    categories: { connect: catIds },
                    inventoryTransactions: {
                        create: {
                            type: InventoryTransactionType.RESTOCK,
                            quantity: p.stock,
                            unitCost: Math.round(p.price * 0.4)
                        }
                    }
                }
            });
            createdProducts.push(product);
        }

        // 5. CAMPAIGNS & BANNERS
        console.log("🚀 Creating Campaigns & Banners...");

        // Campaign 1: Spring Refresh
        const c1 = await prisma.campaign.create({
            data: {
                title: "The Spring Refresh",
                slug: "spring-refresh",
                description: "Light, airy pieces to breathe new life into your home this season.",
                status: CampaignStatus.ACTIVE,
                heroImage: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=2000",
                theme: { backgroundColor: "#f9fafb", accentColor: "#111827", fontColor: "#374151" }
            }
        });
        await prisma.banner.create({
            data: {
                title: "Spring Refresh '26",
                imageString: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=2000",
                link: `/campaigns/${c1.slug}`,
                campaignId: c1.id
            }
        });

        // Campaign 2: Executive Collection
        const c2 = await prisma.campaign.create({
            data: {
                title: "The Executive Suite",
                slug: "executive-suite",
                description: "Commanding silhouettes and deep leather tones. Designed for the modern leader.",
                status: CampaignStatus.ACTIVE,
                heroImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=2000",
                theme: { backgroundColor: "#111827", accentColor: "#f3f4f6", fontColor: "#f9fafb" }
            }
        });
        await prisma.banner.create({
            data: {
                title: "Executive Collection",
                imageString: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=2000",
                link: `/campaigns/${c2.slug}`,
                campaignId: c2.id
            }
        });

        // Attach products to campaigns
        const springProducts = createdProducts.filter(p => springProductNames.includes(p.name));
        const execProducts = createdProducts.filter(p => execProductNames.includes(p.name));

        await Promise.all(springProducts.map((p, i) =>
            prisma.campaignProduct.create({ data: { campaignId: c1.id, productId: p.id, order: i } })
        ));
        await Promise.all(execProducts.map((p, i) =>
            prisma.campaignProduct.create({ data: { campaignId: c2.id, productId: p.id, order: i } })
        ));

        console.log("✅ Seed Complete.");

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
