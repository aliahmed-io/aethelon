
import { PrismaClient, ProductStatus, OrderStatus, PaymentStatus, UserRole, FulfillmentStatus, InventoryTransactionType, RankingMode, MainCategory } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Initialize Prisma Client
const prisma = new PrismaClient().$extends(withAccelerate());

// --- CONSTANTS ---
const ADMIN_EMAIL = 'admin@aethelon.com';
const MOCK_USER_COUNT = 25;
const ORDER_HISTORY_DAYS = 90;

// --- HIERARCHY DEFINITION ---
// structure: [Slug, Name, Image, [ChildSlug, ChildName, ChildImage]]
const TAXONOMY = [
    {
        name: 'Living Room',
        slug: 'living-room',
        children: [
            { name: 'Sofas & Sectionals', slug: 'sofas' },
            { name: 'Coffee Tables', slug: 'coffee-tables' },
            { name: 'Accent Chairs', slug: 'accent-chairs' }
        ]
    },
    {
        name: 'Dining',
        slug: 'dining',
        children: [
            { name: 'Dining Tables', slug: 'dining-tables' },
            { name: 'Dining Chairs', slug: 'dining-chairs' },
            { name: 'Bar Stools', slug: 'bar-stools' }
        ]
    },
    {
        name: 'Bedroom',
        slug: 'bedroom',
        children: [
            { name: 'Beds', slug: 'beds' },
            { name: 'Nightstands', slug: 'nightstands' },
            { name: 'Dressers', slug: 'dressers' }
        ]
    },
    {
        name: 'Office',
        slug: 'office',
        children: [
            { name: 'Desks', slug: 'desks' },
            { name: 'Office Chairs', slug: 'office-chairs' }
        ]
    },
    {
        name: 'Decor',
        slug: 'decor',
        children: [
            { name: 'Rugs', slug: 'rugs' },
            { name: 'Lighting', slug: 'lighting' },
            { name: 'Vases', slug: 'vases' }
        ]
    }
];

// Flat list for "Function" categories
const FUNCTIONAL_COLLECTIONS = [
    { name: 'New Arrivals', slug: 'new-arrivals', mode: RankingMode.TRENDING },
    { name: 'Best Sellers', slug: 'best-sellers', mode: RankingMode.TRENDING },
    { name: 'Sustainable', slug: 'sustainable', mode: RankingMode.SEMANTIC },
    { name: 'Comfort', slug: 'comfort', mode: RankingMode.SEMANTIC }
];

const PRODUCTS = [
    // Living Room -> Sofas
    {
        name: 'Cloud Modular Sofa',
        description: 'Experience the ultimate potential of relaxation with our Cloud Modular Sofa. Upholstered in premium, stain-resistant fabric.',
        price: 329900,
        mainCat: 'living-room',
        subCat: 'sofas',
        extraCats: ['comfort', 'best-sellers'],
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000'],
        features: ['Modular configuration', 'Stain-resistant', 'Feather-blend'],
        stock: 12,
        rating: 4.8,
        reviews: 42
    },
    {
        name: 'Velvet Tuxedo Sofa',
        description: 'A statement piece for any modern living room. Deep button tufting and tuxedo arms.',
        price: 219900,
        mainCat: 'living-room',
        subCat: 'sofas',
        extraCats: ['new-arrivals'],
        images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1000'],
        features: ['Velvet upholstery', 'Button tufting', 'Solid wood legs'],
        stock: 8,
        rating: 4.5,
        reviews: 15
    },
    // Living Room -> Chairs
    {
        name: 'Mid-Century Accent Chair',
        description: 'Timeless vintage charm with modern durability.',
        price: 59900,
        mainCat: 'living-room',
        subCat: 'accent-chairs',
        extraCats: ['sustainable'],
        images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000'],
        features: ['Solid walnut frame', 'High-density foam'],
        stock: 45,
        rating: 4.6,
        reviews: 28
    },
    // Dining -> Tables
    {
        name: 'Reclaimed Oak Dining Table',
        description: 'Rustic elegance for family gatherings.',
        price: 189900,
        mainCat: 'dining',
        subCat: 'dining-tables',
        extraCats: ['sustainable'],
        images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=1000'],
        features: ['Reclaimed oak', 'Seals 8-10', 'Hand-finished'],
        stock: 5,
        rating: 4.8,
        reviews: 31
    },
    // Bedroom -> Beds
    {
        name: 'Haven Platform Bed',
        description: 'Minimalist sanctuary.',
        price: 149900,
        mainCat: 'bedroom',
        subCat: 'beds',
        extraCats: ['comfort'],
        images: ['https://images.unsplash.com/photo-1505693416388-334340d269a9?auto=format&fit=crop&q=80&w=1000'],
        features: ['Solid oak', 'Low profile'],
        stock: 8,
        rating: 4.7,
        reviews: 56
    },
    // Office -> Chairs
    {
        name: 'ErgoPro Office Chair',
        description: 'High performance ergonomic chair.',
        price: 129900,
        mainCat: 'office',
        subCat: 'office-chairs',
        extraCats: ['comfort', 'best-sellers'],
        images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=1000'],
        features: ['4D Armrests', 'Mesh back'],
        stock: 100,
        rating: 4.9,
        reviews: 89
    },
    // Decor -> Vases
    {
        name: 'Ceramic Vase Set',
        description: 'Artised Earth tones.',
        price: 12900,
        mainCat: 'decor',
        subCat: 'vases',
        extraCats: ['new-arrivals'],
        images: ['https://images.unsplash.com/photo-1581539250439-c923cd226718?auto=format&fit=crop&q=80&w=1000'],
        features: ['Hand-thrown', 'Watertight'],
        stock: 150,
        rating: 4.8,
        reviews: 45
    }
];

// --- SCORING ---
function calculateStaticScore(rating: number, reviewCount: number, createdAt: Date): number {
    // 1. Popularity (0-0.4)
    // Max log based on ~100 reviews = 4.6
    const logReviews = Math.log(reviewCount + 1);
    const popularityScore = Math.min(1, logReviews / 5) * 0.4;

    // 2. Rating (0-0.3)
    // Normalized 3.0 to 5.0 -> 0 to 1
    const normalizedRating = Math.max(0, Math.min(1, (rating - 3) / 2));
    const ratingScore = normalizedRating * 0.3;

    // 3. Recency (0-0.3)
    const daysOld = (new Date().getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
    const recencyScore = (1 / (1 + daysOld / 30)) * 0.3;

    return Number((popularityScore + ratingScore + recencyScore).toFixed(2));
}

// --- MAIN ---
async function main() {
    console.log("🌱 Starting Hierarchical Seed...");

    try {
        // CLEANUP
        console.log("🧹 Cleanup...");
        await prisma.orderItem.deleteMany();
        await prisma.inventoryTransaction.deleteMany();
        await prisma.review.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();

        // USERS
        const admin = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                email: ADMIN_EMAIL,
                firstName: 'Admin',
                lastName: 'User',
                profileImage: '',
                role: UserRole.ADMIN
            }
        });

        const users = [];
        for (let i = 0; i < 5; i++) {
            users.push(await prisma.user.create({
                data: {
                    id: crypto.randomUUID(),
                    email: `user${i}@test.com`,
                    firstName: `User${i}`,
                    lastName: 'Test',
                    profileImage: '',
                    role: UserRole.USER
                }
            }));
        }

        // CATEGORIES
        console.log("📂 Creating Taxonomy...");
        const catMap = new Map<string, string>(); // slug -> id

        // 1. Functional
        for (const f of FUNCTIONAL_COLLECTIONS) {
            const cat = await prisma.category.create({
                data: {
                    name: f.name,
                    slug: f.slug,
                    rankingMode: f.mode
                }
            });
            catMap.set(f.slug, cat.id);
        }

        // 2. Hierarchical
        for (const parent of TAXONOMY) {
            const pCat = await prisma.category.create({
                data: {
                    name: parent.name,
                    slug: parent.slug,
                }
            });
            catMap.set(parent.slug, pCat.id);

            for (const child of parent.children) {
                const cCat = await prisma.category.create({
                    data: {
                        name: child.name,
                        slug: child.slug,
                        parentId: pCat.id
                    }
                });
                catMap.set(child.slug, cCat.id);
            }
        }

        // PRODUCTS
        console.log("📦 Creating Products...");
        for (const p of PRODUCTS) {
            // Resolve categories
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
                    mainCategory: MainCategory.MEN, // Legacy Fallback
                    categories: {
                        connect: catIds
                    },
                    inventoryTransactions: {
                        create: {
                            type: InventoryTransactionType.RESTOCK,
                            quantity: p.stock,
                            unitCost: Math.round(p.price * 0.4)
                        }
                    }
                }
            });

            console.log(`   Created ${p.name} (Score: ${staticScore})`);
        }

        console.log("✅ Seed Complete.");

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
