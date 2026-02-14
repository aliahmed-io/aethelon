import { PrismaClient, MainCategory, ProductStatus } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

const furnitureCategories = [
    {
        name: 'Living Room',
        slug: 'living-room',
        description: 'Modern comfort for your main gathering space.',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Bedroom',
        slug: 'bedroom',
        description: 'Restful sanctuaries specifically designed for you.',
        image: 'https://images.unsplash.com/photo-1505693416388-334340d269a9?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Dining Room',
        slug: 'dining-room',
        description: 'Where conversations and meals are shared.',
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Office',
        slug: 'office',
        description: 'Productivity meets style.',
        image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Decor',
        slug: 'decor',
        description: 'The finishing touches that make a house a home.',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?auto=format&fit=crop&q=80&w=1000'
    }
];

const products = [
    // Living Room
    {
        name: 'Cloud Modular Sofa',
        description: 'Experience the ultimate potential of relaxation with our Cloud Modular Sofa. Upholstered in premium, stain-resistant fabric, this sofa offers deep seating and plush cushioning that mimics the feeling of floating on a cloud. Its modular design allows you to customize the layout to fit any space perfectly.',
        price: 2499,
        categorySlug: 'living-room',
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1000'],
        features: ['Modular design', 'Stain-resistant fabric', 'Deep seating', 'Kiln-dried hardwood frame'],
        tags: ['sofa', 'modular', 'living room', 'comfort'],
        stockQuantity: 15,
        rating: 4.8,
        reviews: 24
    },
    {
        name: 'Mid-Century Accent Chair',
        description: 'A timeless piece that blends vintage charm with modern durability. The Mid-Century Accent Chair features tapered wooden legs and a sculptured backrest, providing both style and support. Perfect for reading nooks or adding a pop of sophistication to your living area.',
        price: 599,
        categorySlug: 'living-room',
        images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1000'],
        features: ['Solid wood legs', 'Ergonomic backrest', 'Velvet upholstery', 'Easy assembly'],
        tags: ['chair', 'accent', 'mid-century', 'vintage'],
        stockQuantity: 40,
        rating: 4.6,
        reviews: 12
    },
    {
        name: 'Minimalist Coffee Table',
        description: 'Sleek, simple, and functional. This Minimalist Coffee Table is crafted from solid oak with a matte finish, highlighting the natural grain of the wood. Its low profile and clean lines make it an ideal centerpiece for contemporary living rooms.',
        price: 349,
        categorySlug: 'living-room',
        images: ['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=1000'],
        features: ['Solid oak', 'Matte finish', 'Scratch-resistant', 'Compact design'],
        tags: ['table', 'coffee table', 'wood', 'minimalist'],
        stockQuantity: 25,
        rating: 4.5,
        reviews: 8
    },

    // Bedroom
    {
        name: 'Haven Platform Bed',
        description: 'Create a peaceful retreat with the Haven Platform Bed. Featuring a low-profile design and a sturdy slat system, it eliminates the need for a box spring. The padded headboard offers comfortable support for late-night reading.',
        price: 1299,
        categorySlug: 'bedroom',
        images: ['https://images.unsplash.com/photo-1505693416388-334340d269a9?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1522771753035-4a53c62dc838?auto=format&fit=crop&q=80&w=1000'],
        features: ['Platform design', 'No box spring needed', 'Padded headboard', 'Sustainable materials'],
        tags: ['bed', 'platform', 'bedroom', 'modern'],
        stockQuantity: 10,
        rating: 4.9,
        reviews: 35
    },
    {
        name: 'Nordic Nightstand',
        description: 'Functionality meets Scandinavian design. The Nordic Nightstand offers ample storage with two spacious drawers and a smooth top surface for your essentials. Its light wood finish brightens up any bedroom decor.',
        price: 199,
        categorySlug: 'bedroom',
        images: ['https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&q=80&w=1000'],
        features: ['Two drawers', 'Soft-close mechanism', 'Light wood finish', 'Compact'],
        tags: ['nightstand', 'bedroom', 'storage', 'nordic'],
        stockQuantity: 50,
        rating: 4.3,
        reviews: 15
    },

    // Dining
    {
        name: 'Farmhouse Dining Table',
        description: 'Gather the whole family around this sturdy Farmhouse Dining Table. Constructed from reclaimed pine, it features a rustic texture and a durable finish that stands up to daily use. comfortably seats six to eight people.',
        price: 1199,
        categorySlug: 'dining-room',
        images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=1000'],
        features: ['Reclaimed pine', 'Rustic finish', 'Seats 6-8', 'Heavy-duty construction'],
        tags: ['table', 'dining', 'farmhouse', 'wood'],
        stockQuantity: 8,
        rating: 4.7,
        reviews: 20
    },
    {
        name: 'Velvet Dining Chair',
        description: 'Dine in luxury with our Velvet Dining Chair. The contoured seat and backrest provide ergonomic support, while the rich velvet upholstery adds a touch of elegance to your dining room. Available in multiple jewel tones.',
        price: 149,
        categorySlug: 'dining-room',
        images: ['https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=1000'],
        features: ['Velvet upholstery', 'Metal legs', 'Ergonomic design', 'Multiple colors'],
        tags: ['chair', 'dining', 'velvet', 'luxury'],
        stockQuantity: 100,
        rating: 4.4,
        reviews: 42
    },

    // Office
    {
        name: 'Executive Ergonomic Chair',
        description: 'Work smarter, not harder. This Executive Ergonomic Chair allows for full adjustability, including lumbar support, headrest height, and armrest position. The breathable mesh back keeps you cool during long work sessions.',
        price: 899,
        categorySlug: 'office',
        images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=1000'],
        features: ['Full adjustability', 'Lumbar support', 'Breathable mesh', 'Heavy-duty base'],
        tags: ['chair', 'office', 'ergonomic', 'work'],
        stockQuantity: 30,
        rating: 4.8,
        reviews: 55
    },
    {
        name: 'Standing Desk Pro',
        description: 'Elevate your workflow with the Standing Desk Pro. Featuring a dual-motor lifting system, it transitions smoothly from sitting to standing height in seconds. The spacious desktop provides plenty of room for multiple monitors.',
        price: 649,
        categorySlug: 'office',
        images: ['https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80&w=1000'],
        features: ['Dual-motor lift', 'Memory presets', 'Cable management', 'High weight capacity'],
        tags: ['desk', 'standing desk', 'office', 'adjustable'],
        stockQuantity: 20,
        rating: 4.9,
        reviews: 60
    },

    // Decor
    {
        name: 'Ceramic Vase Set',
        description: 'Add an artistic touch to any room with this handmade Ceramic Vase Set. Each piece is unique, featuring organic shapes and a textured glaze. Perfect for displaying fresh flowers or standing alone as sculptural elements.',
        price: 89,
        categorySlug: 'decor',
        images: ['https://images.unsplash.com/photo-1581539250439-c923cd226718?auto=format&fit=crop&q=80&w=1000'],
        description_long: 'Detailed description here...',
        features: ['Handmade', 'Unique textures', 'Set of 3', 'Gift-boxed'],
        tags: ['vase', 'decor', 'ceramic', 'handmade'],
        stockQuantity: 75,
        rating: 4.8,
        reviews: 18
    }
];

async function main() {
    console.log("🌱 Starting seed...");

    try {
        // 1. Cleanup
        console.log("🧹 Cleaning up old data...");
        await prisma.review.deleteMany({});
        await prisma.campaignProduct.deleteMany({});
        await prisma.campaign.deleteMany({});
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});
        // Note: Be careful deleting products if they are referenced elsewhere not covered by cascade
        // We use deleteMany so it respects foreign keys if configured, or fails.
        // For a seed script, it's often safer to delete child records first.

        await prisma.product.deleteMany({});
        await prisma.category.deleteMany({});

        console.log("✅ Cleanup complete.");

        // 2. Create Categories
        console.log("📂 Creating categories...");
        const categoryMap = new Map();

        for (const cat of furnitureCategories) {
            const created = await prisma.category.create({
                data: cat
            });
            categoryMap.set(cat.slug, created.id);
            console.log(`   Detailed ${cat.name}`);
        }

        // 3. Create Products
        console.log("📦 Creating products...");
        for (const prod of products) {
            const categoryId = categoryMap.get(prod.categorySlug);
            if (!categoryId) {
                console.warn(`⚠️ Category not found for product: ${prod.name} (${prod.categorySlug})`);
                continue;
            }

            // Remove internal slug field from data object
            const { categorySlug, rating, reviews, ...productData } = prod;

            const createdProduct = await prisma.product.create({
                data: {
                    ...productData,
                    categoryId: categoryId,
                    mainCategory: 'MEN', // Default enum fallback for now, maybe schema needs update for furniture
                    status: ProductStatus.published,
                    averageRating: rating,
                    reviewCount: reviews,
                    isFeatured: Math.random() > 0.7, // Randomly feature some items
                }
            });
            console.log(`   Created ${prod.name}`);
        }

        console.log("✅ Seeding complete!");

    } catch (e) {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
