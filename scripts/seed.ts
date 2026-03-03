
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
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=1000',
        children: [
            { name: 'Sofas & Sectionals', slug: 'sofas', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Coffee Tables', slug: 'coffee-tables', image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=1000' },
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
            { name: 'Beds', slug: 'beds', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000' },
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
            { name: 'Vases', slug: 'vases', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=1000' }
        ]
    }
];

// Flat list for "Function" categories
const FUNCTIONAL_COLLECTIONS = [
    { name: 'New Arrivals', slug: 'new-arrivals', mode: RankingMode.TRENDING, image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Best Sellers', slug: 'best-sellers', mode: RankingMode.TRENDING, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Sustainable', slug: 'sustainable', mode: RankingMode.SEMANTIC, image: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Comfort', slug: 'comfort', mode: RankingMode.SEMANTIC, image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=1000' }
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
        images: ['/variants/oatmeal_sofa.png', '/variants/charcoal_sofa.png', '/variants/navy_sofa.png'],
        features: ['Modular configuration', 'Stain-resistant', 'Feather-blend'],
        stock: 12,
        rating: 4.8,
        reviews: 42,
        variants: [
            { colorName: "Oatmeal", colorHex: "#d7d0c0", images: ['/variants/oatmeal_sofa.png'] },
            { colorName: "Charcoal", colorHex: "#36454F", images: ['/variants/charcoal_sofa.png'] },
            { colorName: "Navy", colorHex: "#000080", images: ['/variants/navy_sofa.png'] }
        ]
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
        images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000'],
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
        images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=1000'],
        features: ['Hand-thrown', 'Watertight'],
        stock: 150,
        rating: 4.8,
        reviews: 45
    },
    // Injected AI Generated Variants
    {
        name: 'Lumina Accent Chair',
        description: 'A modern velvet accent chair with a minimalist design.',
        price: 49900,
        mainCat: 'living-room',
        subCat: 'accent-chairs',
        extraCats: ['new-arrivals'],
        images: ['/variants/emerald_chair_1.png', '/variants/emerald_chair_2.png', '/variants/emerald_chair_3.png'],
        features: ['Velvet upholstery', 'Minimalist lines'],
        stock: 50,
        rating: 4.9,
        reviews: 12,
        variants: [
            { colorName: "Emerald", colorHex: "#50C878", images: ["/variants/emerald_chair_1.png", "/variants/emerald_chair_2.png", "/variants/emerald_chair_3.png"] },
            { colorName: "Ochre", colorHex: "#CC7722", images: ["/variants/ochre_chair_1.png", "/variants/ochre_chair_2.png", "/variants/ochre_chair_3.png"] }
        ]
    },
    {
        name: 'Aero Dining Table',
        description: 'A sleek minimalist curved dining table crafted from wood.',
        price: 129900,
        mainCat: 'dining',
        subCat: 'dining-tables',
        extraCats: ['sustainable'],
        images: ['/variants/walnut_table_1.png', '/variants/walnut_table_2.png', '/variants/walnut_table_3.png'],
        features: ['Solid wood', 'Curved edges'],
        stock: 20,
        rating: 4.7,
        reviews: 8,
        variants: [
            { colorName: "Walnut", colorHex: "#43270F", images: ["/variants/walnut_table_1.png", "/variants/walnut_table_2.png", "/variants/walnut_table_3.png"] },
            { colorName: "Whitewash", colorHex: "#EAE6DF", images: ["/variants/whitewash_table_1.png", "/variants/whitewash_table_2.png", "/variants/whitewash_table_3.png"] }
        ]
    },
    {
        name: 'Nimbus Lounge Sofa',
        description: 'A modern curvy lounge sofa in boucle fabric.',
        price: 159900,
        mainCat: 'living-room',
        subCat: 'sofas',
        extraCats: ['comfort'],
        images: ['/variants/rust_sofa_1.png', '/variants/rust_sofa_2.png', '/variants/rust_sofa_2.png'],
        features: ['Boucle fabric', 'Curvy design'],
        stock: 15,
        rating: 4.6,
        reviews: 24,
        variants: [
            { colorName: "Rust", colorHex: "#8B4000", images: ["/variants/rust_sofa_1.png", "/variants/rust_sofa_2.png", "/variants/rust_sofa_2.png"] }
        ]
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
                    rankingMode: f.mode,
                    image: f.image
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
                    image: parent.image
                }
            });
            catMap.set(parent.slug, pCat.id);

            for (const child of parent.children) {
                const cCat = await prisma.category.create({
                    data: {
                        name: child.name,
                        slug: child.slug,
                        parentId: pCat.id,
                        image: child.image
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
                    },
                    variants: p.variants ? {
                        create: p.variants
                    } : undefined
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
