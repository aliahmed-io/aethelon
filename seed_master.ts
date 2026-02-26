// @ts-nocheck
/**
 * ══════════════════════════════════════════════════════════════
 *  AETHELON MASTER SEED
 *  Covers: categories (hierarchical + functional), products,
 *          campaigns + banners, blog posts, admin user, orders.
 *
 *  Run: npx tsx seed_master.ts
 *  Safe to re-run (uses upsert / skip-if-exists throughout).
 * ══════════════════════════════════════════════════════════════
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? 'https://aethelon.com';

// ─── helpers ────────────────────────────────────────────────────────────────
function slug(s: string) {
    return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}
function score(rating: number, reviews: number): number {
    const pop = Math.min(1, Math.log(reviews + 1) / 5) * 0.4;
    const rat = Math.max(0, Math.min(1, (rating - 3) / 2)) * 0.3;
    const rec = (1 / (1 + 0 / 30)) * 0.3;
    return Number((pop + rat + rec).toFixed(2));
}

// ─── 1. TAXONOMY ─────────────────────────────────────────────────────────────
const TAXONOMY = [
    {
        name: 'Living Room', slug: 'living-room',
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=1200',
        children: [
            { name: 'Sofas & Sectionals', slug: 'sofas', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Coffee Tables', slug: 'coffee-tables', image: 'https://images.unsplash.com/photo-1533090481728-4660ebbc48f1?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Accent Chairs', slug: 'accent-chairs', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1200' },
        ]
    },
    {
        name: 'Dining', slug: 'dining',
        image: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&q=80&w=1200',
        children: [
            { name: 'Dining Tables', slug: 'dining-tables', image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Dining Chairs', slug: 'dining-chairs', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Bar Stools', slug: 'bar-stools', image: 'https://images.unsplash.com/photo-1476233658920-2b2b41f8c4b3?auto=format&fit=crop&q=80&w=1200' },
        ]
    },
    {
        name: 'Bedroom', slug: 'bedroom',
        image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=1200',
        children: [
            { name: 'Beds', slug: 'beds', image: 'https://images.unsplash.com/photo-1505693416388-334340d269a9?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Nightstands', slug: 'nightstands', image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Dressers', slug: 'dressers', image: 'https://images.unsplash.com/photo-1595514536733-1579717dfb11?auto=format&fit=crop&q=80&w=1200' },
        ]
    },
    {
        name: 'Office', slug: 'office',
        image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200',
        children: [
            { name: 'Desks', slug: 'desks', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Office Chairs', slug: 'office-chairs', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=1200' },
        ]
    },
    {
        name: 'Lighting', slug: 'lighting',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200',
        children: [
            { name: 'Floor Lamps', slug: 'floor-lamps', image: 'https://images.unsplash.com/photo-1513506003901-1e6a35b98687?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Pendant Lights', slug: 'pendant-lights', image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Table Lamps', slug: 'table-lamps', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=1200' },
        ]
    },
    {
        name: 'Decor & Accessories', slug: 'decor',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200',
        children: [
            { name: 'Rugs', slug: 'rugs', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Vases', slug: 'vases', image: 'https://images.unsplash.com/photo-1581539250439-c923cd226718?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Mirrors', slug: 'mirrors', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=1200' },
        ]
    },
    {
        name: 'Outdoor', slug: 'outdoor',
        image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&q=80&w=1200',
        children: [
            { name: 'Garden Chairs', slug: 'garden-chairs', image: 'https://images.unsplash.com/photo-1533044309907-0fa3413da946?auto=format&fit=crop&q=80&w=1200' },
            { name: 'Outdoor Tables', slug: 'outdoor-tables', image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80&w=1200' },
        ]
    },
];

const FUNCTIONAL = [
    { name: 'New Arrivals', slug: 'new-arrivals', mode: 'TRENDING', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200' },
    { name: 'Best Sellers', slug: 'best-sellers', mode: 'TRENDING', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200' },
    { name: 'Sustainable', slug: 'sustainable', mode: 'SEMANTIC', image: 'https://images.unsplash.com/photo-1621791923950-b4a9b025a20c?auto=format&fit=crop&q=80&w=1200' },
    { name: 'Comfort', slug: 'comfort', mode: 'SEMANTIC', image: 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?auto=format&fit=crop&q=80&w=1200' },
];

// ─── 2. PRODUCTS ─────────────────────────────────────────────────────────────
const PRODUCTS = [
    // ── Living Room ──────────────────────────────────────────────────────────
    {
        name: 'Cloud Modular Sofa', cat: 'sofas', extras: ['comfort', 'best-sellers'], isFeatured: true, price: 329900, rating: 4.8, reviews: 42, stock: 12,
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1200'],
        tags: ['sofa', 'comfort', 'modular'], features: ['Modular config', 'Stain-resistant', 'Feather-blend'],
        desc: 'The ultimate in relaxation. Configure this modular sofa to suit any room layout, upholstered in premium stain-resistant fabric with feather-blend cushions.'
    },

    {
        name: 'Velvet Tuxedo Sofa', cat: 'sofas', extras: ['new-arrivals'], isFeatured: false, price: 219900, rating: 4.5, reviews: 15, stock: 8,
        images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=1200'],
        tags: ['sofa', 'velvet', 'tuxedo'], features: ['Velvet upholstery', 'Button tufting', 'Solid oak legs'],
        desc: 'A statement piece for modern living. Deep button tufting and tuxedo arms finished in midnight velvet.'
    },

    {
        name: 'Mid-Century Accent Chair', cat: 'accent-chairs', extras: ['sustainable'], isFeatured: true, price: 59900, rating: 4.6, reviews: 28, stock: 45,
        images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1200'],
        tags: ['chair', 'mid-century', 'walnut'], features: ['Solid walnut frame', 'High-density foam', 'Sustainable source'],
        desc: 'Timeless mid-century form with modern durability — sustainably sourced solid walnut and high-density cushioning.'
    },

    {
        name: 'Marble Coffee Table', cat: 'coffee-tables', extras: ['new-arrivals'], isFeatured: false, price: 89900, rating: 4.4, reviews: 19, stock: 20,
        images: ['https://images.unsplash.com/photo-1533090481728-4660ebbc48f1?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=1200'],
        tags: ['table', 'marble', 'modern'], features: ['Carrara marble', 'Powder-coated base', 'Adjustable feet'],
        desc: 'Genuine Carrara marble top on a minimal powder-coated steel base. A quiet centrepiece.'
    },

    // ── Dining ────────────────────────────────────────────────────────────────
    {
        name: 'Reclaimed Oak Dining Table', cat: 'dining-tables', extras: ['sustainable', 'best-sellers'], isFeatured: true, price: 189900, rating: 4.8, reviews: 31, stock: 5,
        images: ['https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&q=80&w=1200'],
        tags: ['dining', 'oak', 'sustainable'], features: ['Reclaimed oak', 'Seats 8–10', 'Hand-finished'],
        desc: 'Rustic elegance from certified reclaimed oak. Each piece is unique — hand-finished to preserve the natural grain.'
    },

    {
        name: 'Scandi Dining Chair', cat: 'dining-chairs', extras: ['sustainable'], isFeatured: false, price: 24900, rating: 4.3, reviews: 44, stock: 80,
        images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1200'],
        tags: ['chair', 'nordic', 'ash'], features: ['Steam-bent ash', 'Upholstered seat', 'Stackable'],
        desc: 'Beautifully curved steam-bent ash dining chair with upholstered seat pad. Stackable for storage.'
    },

    {
        name: 'Brushed Brass Bar Stool', cat: 'bar-stools', extras: ['new-arrivals'], isFeatured: false, price: 34900, rating: 4.5, reviews: 12, stock: 30,
        images: ['https://images.unsplash.com/photo-1476233658920-2b2b41f8c4b3?auto=format&fit=crop&q=80&w=1200'],
        tags: ['bar-stool', 'brass', 'counter'], features: ['Height adjustable', 'Footrest ring', 'Brushed brass finish'],
        desc: 'Counter-height stool in brushed brass with a 360° swivel seat and integrated footrest ring.'
    },

    // ── Bedroom ───────────────────────────────────────────────────────────────
    {
        name: 'Haven Platform Bed', cat: 'beds', extras: ['comfort', 'best-sellers'], isFeatured: true, price: 149900, rating: 4.7, reviews: 56, stock: 8,
        images: ['https://images.unsplash.com/photo-1505693416388-334340d269a9?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200'],
        tags: ['bed', 'platform', 'oak'], features: ['Solid oak frame', 'Low profile', 'Under-bed storage'],
        desc: 'A minimalist sanctuary. Solid oak platform bed with optional under-bed drawer storage.'
    },

    {
        name: 'Linen Upholstered Bed', cat: 'beds', extras: ['comfort', 'new-arrivals'], isFeatured: false, price: 179900, rating: 4.6, reviews: 22, stock: 10,
        images: ['https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=1200'],
        tags: ['bed', 'linen', 'upholstered'], features: ['Belgian linen', 'Curved headboard', 'King/super-king'],
        desc: 'Belgian linen upholstered bed with a generously padded curved headboard. Available in king and super-king.'
    },

    {
        name: 'Marble-Top Nightstand', cat: 'nightstands', extras: [], isFeatured: false, price: 44900, rating: 4.5, reviews: 18, stock: 25,
        images: ['https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=1200'],
        tags: ['nightstand', 'marble', 'drawer'], features: ['Marble top', 'Single drawer', 'Brass pull'],
        desc: 'Walnut-body nightstand with honed marble top and single deep drawer with brass pull handle.'
    },

    // ── Office ────────────────────────────────────────────────────────────────
    {
        name: 'ErgoPro Office Chair', cat: 'office-chairs', extras: ['comfort', 'best-sellers'], isFeatured: true, price: 129900, rating: 4.9, reviews: 89, stock: 100,
        images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=1200'],
        tags: ['office', 'ergonomic', 'mesh'], features: ['4D armrests', 'Mesh back', 'Lumbar support', '5-year warranty'],
        desc: 'High-performance ergonomic chair with 4D armrests, breathable mesh back and precision lumbar adjustment.'
    },

    {
        name: 'Atelier Writing Desk', cat: 'desks', extras: ['new-arrivals'], isFeatured: true, price: 189900, rating: 4.7, reviews: 14, stock: 8,
        modelUrl: `/models/sofa_velvet.glb`,
        usdzUrl: `/models/sofa_velvet.usdz`,
        images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200'],
        tags: ['desk', 'marble', 'premium', 'ar'], features: ['Carrara marble top', 'Brass frame', 'Cable management'],
        desc: 'Carrara marble writing surface on hand-welded brass legs. Each slab is unique — no two desks are identical.'
    },

    // ── Lighting ──────────────────────────────────────────────────────────────
    {
        name: 'Arc Floor Lamp', cat: 'floor-lamps', extras: ['best-sellers'], isFeatured: false, price: 89900, rating: 4.6, reviews: 37, stock: 20,
        modelUrl: `/models/floor_lamp.glb`,
        usdzUrl: `/models/floor_lamp.usdz`,
        images: ['https://images.unsplash.com/photo-1513506003901-1e6a35b98687?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200'],
        tags: ['lamp', 'arc', 'bronze', 'ar'], features: ['2m arc radius', 'Linen shade', 'Dimmable', 'Brushed bronze'],
        desc: 'Statement arc lamp in brushed bronze with hand-spun linen shade. Casts warm diffused light across a 2-metre arc.'
    },

    {
        name: 'Blown Glass Pendant', cat: 'pendant-lights', extras: ['new-arrivals'], isFeatured: false, price: 44900, rating: 4.4, reviews: 9, stock: 40,
        images: ['https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=1200'],
        tags: ['pendant', 'glass', 'mouth-blown'], features: ['Mouth-blown glass', 'E27 socket', '3m fabric cord'],
        desc: 'Mouth-blown amber glass pendant with braided fabric cord. Each piece is slightly unique.'
    },

    {
        name: 'Rattan Table Lamp', cat: 'table-lamps', extras: [], isFeatured: false, price: 29900, rating: 4.3, reviews: 23, stock: 60,
        images: ['https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=1200'],
        tags: ['lamp', 'rattan', 'table', 'natural'], features: ['Hand-woven rattan', 'Linen shade', 'E14 socket'],
        desc: 'Hand-woven rattan lamp base with natural linen shade — brings warmth to any bedside or side table.'
    },

    // ── Decor ─────────────────────────────────────────────────────────────────
    {
        name: 'Ceramic Vase Set (3)', cat: 'vases', extras: ['new-arrivals'], isFeatured: false, price: 12900, rating: 4.8, reviews: 45, stock: 150,
        images: ['https://images.unsplash.com/photo-1581539250439-c923cd226718?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1612198790700-be5cd26e1032?auto=format&fit=crop&q=80&w=1200'],
        tags: ['vase', 'ceramic', 'set', 'decor'], features: ['Hand-thrown', 'Watertight glaze', 'Set of 3'],
        desc: 'Set of three hand-thrown ceramic vases in complementary earth tones. Watertight with a satin glaze.'
    },

    {
        name: 'Persian-Style Wool Rug', cat: 'rugs', extras: ['comfort'], isFeatured: true, price: 149900, rating: 4.7, reviews: 29, stock: 15,
        images: ['https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=1200'],
        tags: ['rug', 'wool', 'persian', 'traditional'], features: ['Hand-knotted', 'Pure wool', 'Vintage wash', '240×340cm'],
        desc: 'Hand-knotted pure wool rug with a vintage wash finish. Inspired by Persian motifs, designed for modern interiors.'
    },

    {
        name: 'Arched Full-Length Mirror', cat: 'mirrors', extras: ['new-arrivals'], isFeatured: false, price: 69900, rating: 4.6, reviews: 31, stock: 18,
        images: ['https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=1200'],
        tags: ['mirror', 'arch', 'brass'], features: ['Arched top', 'Solid brass frame', 'Floor-standing', 'Anti-tip tether'],
        desc: 'Floor-standing arched mirror in solid brass. Anti-tip tether included. 170cm tall.'
    },

    // ── Outdoor ───────────────────────────────────────────────────────────────
    {
        name: 'Teak Garden Chair', cat: 'garden-chairs', extras: ['sustainable'], isFeatured: false, price: 54900, rating: 4.5, reviews: 17, stock: 24,
        images: ['https://images.unsplash.com/photo-1533044309907-0fa3413da946?auto=format&fit=crop&q=80&w=1200'],
        tags: ['outdoor', 'teak', 'garden', 'sustainable'], features: ['Grade-A teak', 'All-weather', 'Folds flat'],
        desc: 'Grade-A sustainably sourced teak folding armchair. All-weather treated and folds flat for easy storage.'
    },

    {
        name: 'Stone Outdoor Side Table', cat: 'outdoor-tables', extras: [], isFeatured: false, price: 39900, rating: 4.2, reviews: 8, stock: 30,
        images: ['https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80&w=1200'],
        tags: ['outdoor', 'stone', 'side-table', 'weather-resistant'], features: ['Cast stone top', 'Galvanised base', 'Frost-resistant'],
        desc: 'Cast stone side table on a galvanised steel base. Frost-resistant and suitable for year-round outdoor use.'
    },

    // ── Premium / Vault products ──────────────────────────────────────────────
    {
        name: 'Onyx Lounge Sofa', cat: 'sofas', extras: ['best-sellers'], isFeatured: true, price: 649900, rating: 4.9, reviews: 11, stock: 6,
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1200'],
        tags: ['sofa', 'premium', 'rare', 'limited', 'leather'], features: ['Full-grain leather', 'Ebonised oak', 'Individually numbered'],
        desc: 'Hand-stitched full-grain leather over an ebonised oak frame. Each piece is individually numbered. Limited to 24 units.'
    },

    {
        name: 'Édition Noir Bed Frame', cat: 'beds', extras: ['new-arrivals'], isFeatured: true, price: 589900, rating: 4.8, reviews: 6, stock: 4,
        images: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=1200'],
        tags: ['bed', 'ebony', 'premium', 'rare', 'limited'], features: ['Macassar ebony lacquer', 'Forged iron hardware', 'Super king'],
        desc: 'Platform bed in lacquered Macassar ebony with hand-forged iron hardware. Super king. White-glove assembly included.'
    },

    {
        name: 'Aethelon Grand Armchair', cat: 'accent-chairs', extras: ['comfort'], isFeatured: true, price: 289900, rating: 4.8, reviews: 9, stock: 10,
        modelUrl: `/models/chair_damask.glb`,
        usdzUrl: `/models/chair_damask.usdz`,
        images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1200'],
        tags: ['chair', 'velvet', 'premium', 'walnut', 'ar'], features: ['Deep-buttoned velvet', 'Solid walnut frame', 'Piped edging'],
        desc: 'Deep-buttoned velvet upholstery on a solid walnut frame, inspired by Parisian gentlemen\'s clubs.'
    },

    // ── AR test products ──────────────────────────────────────────────────────
    {
        name: 'Velvet Accent Chair', cat: 'accent-chairs', extras: ['comfort'], isFeatured: true, price: 189900, rating: 4.7, reviews: 22, stock: 12,
        modelUrl: `/models/sofa_velvet.glb`,
        usdzUrl: `/models/sofa_velvet.usdz`,
        images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200'],
        tags: ['chair', 'velvet', 'accent', 'ar', 'premium'], features: ['Sculptural silhouette', 'Solid brass legs', 'Deep velvet'],
        desc: 'A refined accent chair upholstered in deep velvet, featuring a sculptural silhouette and solid brass legs.'
    },
];

// ─── 3. CAMPAIGNS ────────────────────────────────────────────────────────────
const CAMPAIGNS = [
    {
        title: 'The Living Room Edit', slug: 'living-room-edit',
        description: 'A curated selection of our finest seating and accent pieces — crafted for rooms that breathe.',
        heroImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=2000',
        mobileHeroImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=900',
        status: 'ACTIVE', theme: { backgroundColor: '#FAF9F5', accentColor: '#C9A87C', fontColor: '#2C2416' },
        banner: { title: 'The Living Room Edit', imageString: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=2000', link: '/campaigns/living-room-edit' },
        productSlugs: ['sofas', 'accent-chairs'],
    },
    {
        title: 'Craft & Light — SS26', slug: 'craft-and-light',
        description: 'SS26 arrivals: natural materials, considered forms, and warm light that defines a room.',
        heroImage: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&q=80&w=2000',
        mobileHeroImage: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&q=80&w=900',
        status: 'ACTIVE', theme: { backgroundColor: '#1C1C1A', accentColor: '#D4A853', fontColor: '#FAF9F5' },
        banner: { title: 'Craft & Light — SS26', imageString: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=2000', link: '/campaigns/craft-and-light' },
        productSlugs: ['floor-lamps', 'pendant-lights', 'desks'],
    },
    {
        title: 'Sleep Well Collection', slug: 'sleep-well',
        description: 'Every element considered. Every texture chosen for rest.',
        heroImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=2000',
        mobileHeroImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=900',
        status: 'ACTIVE', theme: { backgroundColor: '#2A2520', accentColor: '#B8957A', fontColor: '#FAF9F5' },
        banner: { title: 'Sleep Well', imageString: 'https://images.unsplash.com/photo-1505693416388-334340d269a9?auto=format&fit=crop&q=80&w=2000', link: '/campaigns/sleep-well' },
        productSlugs: ['beds', 'nightstands'],
    },
];

// ─── 4. BLOG POSTS ───────────────────────────────────────────────────────────
const BLOG_POSTS = [
    {
        title: 'How to Style a Minimalist Living Room',
        slug: 'how-to-style-minimalist-living-room',
        excerpt: 'Less truly is more. We break down the principles of minimal living room design and how to achieve it without sacrificing warmth.',
        content: `Minimalism in interior design isn't about emptiness — it's about intentionality. Every piece should earn its place.

**Start with a neutral base.** Opt for cream, warm white, or soft grey walls. These provide a canvas that lets your furniture speak.

**Choose furniture with strong silhouettes.** A cloud sofa, a marble coffee table, a single statement chair. Each piece should read clearly from across the room.

**Layer texture, not clutter.** A wool rug, linen throws, ceramic vases — these add depth without visual noise.

**Control your light sources.** A single arc floor lamp can define an entire reading zone. Pendant lights anchor dining areas.

The result: a room that feels considered, calm, and unmistakably yours.`,
        category: 'Design',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=1200',
        author: 'Aethelon Studio',
        published: true,
        metaDescription: 'A practical guide to minimalist living room design — furniture choices, lighting, and texture layering.',
    },
    {
        title: 'The Art of Lighting: Three Zones Every Room Needs',
        slug: 'art-of-lighting-three-zones',
        excerpt: 'Good lighting is invisible — you only notice bad lighting. Learn how ambient, task, and accent light transform a space.',
        content: `Lighting is the most underrated tool in interior design. Get it right and everything else falls into place.

**Zone 1: Ambient Light**
This is your base layer — the overhead illumination that fills the room. A pendant light or ceiling fixture at the right height prevents harsh shadows.

**Zone 2: Task Light**
A desk lamp, a reading lamp beside the sofa, under-cabinet kitchen lighting. Task light goes where eyes focus and work happens.

**Zone 3: Accent Light**
This is where personality lives. A floor lamp in the corner, a wall sconce beside a piece of art, LED strips behind shelving. Accent light creates drama and depth.

The rule: never rely on a single light source. Layer all three zones, and put each on a separate switch or dimmer.`,
        category: 'Lighting',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200',
        author: 'Aethelon Studio',
        published: true,
        metaDescription: 'Master the three zones of lighting — ambient, task, and accent — to transform any room.',
    },
    {
        title: 'Choosing the Right Dining Table: Size, Shape, and Material',
        slug: 'choosing-dining-table-size-shape-material',
        excerpt: 'The dining table is the anchor of social living. Here\'s how to choose one that works for your space and your life.',
        content: `Few pieces of furniture carry as much weight as the dining table. It hosts celebrations, daily meals, and late-night conversations.

**Size first.** Allow 60cm per person and 90cm clearance from the table edge to the nearest wall. A 180cm table comfortably seats 6.

**Shape matters.** Round tables encourage conversation and suit square rooms. Rectangular tables suit long, narrow dining rooms. Oval is the best of both.

**Material for longevity.** Solid oak resists daily wear and improves with age. Marble is beautiful but requires sealing. Extendable options are worth considering for smaller spaces.

At Aethelon, our Reclaimed Oak Dining Table uses timber salvaged from decommissioned structures — giving old wood a second, more beautiful life.`,
        category: 'Buying Guides',
        readTime: '7 min read',
        image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=1200',
        author: 'Aethelon Studio',
        published: true,
        metaDescription: 'A complete guide to choosing a dining table — the right size, shape, and material for your home.',
    },
    {
        title: 'Sustainable Furniture: What to Look for and What to Avoid',
        slug: 'sustainable-furniture-what-to-look-for',
        excerpt: 'Not all "eco" claims are equal. We explain what truly sustainable furniture looks like and the certifications worth trusting.',
        content: `The furniture industry is one of the largest contributors to deforestation. Making better choices matters.

**Look for:** FSC or PEFC certified timber, recycled or reclaimed materials, water-based finishes, local manufacturing (shorter supply chain).

**Be sceptical of:** Vague "eco-friendly" claims without certification, particle board marketed as "wood", furniture with no stated country of manufacture.

**Questions to ask:** How long will this last? Can it be repaired? What happens to it at end of life?

At Aethelon, our sustainable line is certified reclaimed or FSC-sourced, assembled in low-emission workshops, and designed to be repaired — not replaced.`,
        category: 'Sustainability',
        readTime: '8 min read',
        image: 'https://images.unsplash.com/photo-1621791923950-b4a9b025a20c?auto=format&fit=crop&q=80&w=1200',
        author: 'Aethelon Studio',
        published: true,
        metaDescription: 'A guide to truly sustainable furniture — certifications, materials, and what greenwashing looks like.',
    },
    {
        title: 'Bedroom Design: Building the Perfect Sleep Environment',
        slug: 'bedroom-design-perfect-sleep-environment',
        excerpt: 'Your bedroom should do one thing above all others: help you sleep. Here\'s how design, colour, and material choices affect rest.',
        content: `Sleep science and interior design intersect more than most people realise. The choices you make in your bedroom directly affect sleep quality.

**Temperature and materials.** Natural linen and cotton breathe; synthetic fabrics trap heat. A linen bed frame cover or natural wool throw regulates temperature passively.

**Light control.** Blackout curtains or blinds are non-negotiable. Even small amounts of light suppress melatonin.

**The bed frame.** Platform beds with solid bases provide better mattress support than slatted frames with wide gaps. Low-profile frames create a calm, grounded aesthetic.

**Nightstand height.** Should match your mattress top — typically 55–65cm. A single marble-top nightstand with a drawer keeps essentials out of sight.

**Colour.** Warm neutrals — cream, stone, warm grey — have been shown to reduce cortisol levels versus cool blues or stark whites.`,
        category: 'Design',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=1200',
        author: 'Aethelon Studio',
        published: true,
        metaDescription: 'How bedroom design, material choices, and lighting directly affect sleep quality.',
    },
];

// ─── MAIN ───────────────────────────────────────────────────────────────────
async function main() {
    console.log('═══════════════════════════════════════');
    console.log('  AETHELON MASTER SEED');
    console.log('═══════════════════════════════════════\n');

    // ── Admin user ─────────────────────────────────────────────────────────
    console.log('── Admin user');
    let admin = await prisma.user.findFirst({ where: { email: 'alihassan182006@gmail.com' } });
    if (!admin) {
        admin = await prisma.user.create({
            data: {
                id: 'user_ali_hassan_123',
                email: 'alihassan182006@gmail.com',
                firstName: 'Ali', lastName: 'Hassan',
                role: 'ADMIN',
                profileImage: 'https://placehold.co/200x200/2C2416/FAF9F5?text=AH',
            },
        });
    } else {
        admin = await prisma.user.update({ where: { id: admin.id }, data: { role: 'ADMIN' } });
    }
    console.log(`  ✔ ${admin.email} (ADMIN)\n`);

    // ── Categories ─────────────────────────────────────────────────────────
    console.log('── Categories');
    const catMap = new Map<string, string>(); // slug → id

    async function upsertCategory(data: { name: string; slug: string; image: string; rankingMode?: string; parentId?: string | null }) {
        const existing = await prisma.category.findFirst({ where: { slug: data.slug, parentId: data.parentId ?? null } });
        if (existing) {
            return prisma.category.update({ where: { id: existing.id }, data: { name: data.name, image: data.image, ...(data.rankingMode ? { rankingMode: data.rankingMode as any } : {}) } });
        }
        return prisma.category.create({ data: { name: data.name, slug: data.slug, image: data.image, ...(data.rankingMode ? { rankingMode: data.rankingMode as any } : {}), ...(data.parentId ? { parentId: data.parentId } : {}) } });
    }

    for (const f of FUNCTIONAL) {
        const cat = await upsertCategory({ name: f.name, slug: f.slug, image: f.image, rankingMode: f.mode });
        catMap.set(f.slug, cat.id);
        console.log(`  ✔ [functional] ${cat.name}`);
    }

    for (const parent of TAXONOMY) {
        const pCat = await upsertCategory({ name: parent.name, slug: parent.slug, image: parent.image });
        catMap.set(parent.slug, pCat.id);
        console.log(`  ✔ [root] ${pCat.name}`);

        for (const child of parent.children) {
            const cCat = await upsertCategory({ name: child.name, slug: child.slug, image: child.image, parentId: pCat.id });
            catMap.set(child.slug, cCat.id);
            console.log(`      ✔ [child] ${cCat.name}`);
        }
    }

    // ── Products ───────────────────────────────────────────────────────────
    console.log('\n── Products');
    const productIds: string[] = [];

    for (const p of PRODUCTS) {
        const existing = await prisma.product.findFirst({ where: { name: p.name }, select: { id: true } });

        const catIds: { id: string }[] = [];
        if (catMap.has(p.cat)) catIds.push({ id: catMap.get(p.cat)! });
        for (const ec of (p.extras || [])) {
            if (catMap.has(ec)) catIds.push({ id: catMap.get(ec)! });
        }

        if (existing) {
            const product = await prisma.product.update({
                where: { id: existing.id },
                data: {
                    modelUrl: p.modelUrl ?? null,
                    usdzUrl: p.usdzUrl ?? null,
                    categories: { connect: catIds },
                },
            });
            productIds.push(product.id);
            console.log(`  ✔  Update (AR): ${p.name}`);
            continue;
        }

        // catIds already declared and populated above

        const product = await prisma.product.create({
            data: {
                name: p.name,
                description: p.desc,
                price: p.price,
                images: p.images,
                modelUrl: p.modelUrl ?? null,
                usdzUrl: p.usdzUrl ?? null,
                features: p.features ?? [],
                tags: p.tags ?? [],
                stockQuantity: p.stock,
                averageRating: p.rating,
                reviewCount: p.reviews,
                staticScore: score(p.rating, p.reviews),
                status: 'published',
                isFeatured: p.isFeatured,
                categories: { connect: catIds },
                inventoryTransactions: {
                    create: { type: 'RESTOCK', quantity: p.stock, unitCost: Math.round(p.price * 0.4) }
                },
            },
        });
        productIds.push(product.id);
        console.log(`  ✔ ${product.name} — £${(product.price / 100).toFixed(0)}`);
    }

    // ── Campaigns ──────────────────────────────────────────────────────────
    console.log('\n── Campaigns');
    for (const c of CAMPAIGNS) {
        const campaign = await prisma.campaign.upsert({
            where: { slug: c.slug },
            update: { title: c.title, description: c.description, heroImage: c.heroImage, mobileHeroImage: c.mobileHeroImage, status: c.status as any, theme: c.theme },
            create: { title: c.title, slug: c.slug, description: c.description, heroImage: c.heroImage, mobileHeroImage: c.mobileHeroImage, status: c.status as any, theme: c.theme, startDate: new Date() },
        });
        console.log(`  ✔ Campaign: "${campaign.title}"`);

        // Banner
        const hasBanner = await prisma.banner.findFirst({ where: { campaignId: campaign.id }, select: { id: true } });
        if (!hasBanner) {
            await prisma.banner.create({ data: { ...c.banner, campaignId: campaign.id } });
            console.log(`    ✔ Banner added`);
        }

        // Attach products (first 8 available)
        const toAttach = productIds.slice(0, 8);
        for (let i = 0; i < toAttach.length; i++) {
            try {
                await prisma.campaignProduct.upsert({
                    where: { campaignId_productId: { campaignId: campaign.id, productId: toAttach[i] } },
                    update: { order: i },
                    create: { campaignId: campaign.id, productId: toAttach[i], order: i },
                });
            } catch (_) { /* skip duplicate */ }
        }
        console.log(`    ✔ ${toAttach.length} products attached`);
    }

    // Default standalone banner (for campaigns page hero)
    const bannerTotal = await prisma.banner.count();
    if (bannerTotal === 0) {
        await prisma.banner.create({
            data: { title: 'New Season Arrivals', imageString: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=2000', link: '/shop' },
        });
    }

    // ── Blog Posts ─────────────────────────────────────────────────────────
    console.log('\n── Blog posts');
    for (const post of BLOG_POSTS) {
        await prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: { title: post.title, excerpt: post.excerpt, content: post.content, image: post.image },
            create: {
                title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
                category: post.category, readTime: post.readTime, image: post.image,
                author: post.author, published: post.published, publishedAt: new Date(),
                metaDescription: post.metaDescription,
            },
        });
        console.log(`  ✔ ${post.title}`);
    }

    // ── Sample orders for analytics ────────────────────────────────────────
    console.log('\n── Analytics orders');
    const orderCount = await prisma.order.count({ where: { userId: admin.id } });
    if (orderCount < 5 && productIds.length > 0) {
        const today = new Date();
        const statuses = ['DELIVERED', 'DELIVERED', 'SHIPPED', 'CREATED', 'PAID'];
        for (let i = 0; i < 15; i++) {
            const daysAgo = Math.floor(Math.random() * 60);
            const orderDate = new Date(today);
            orderDate.setDate(today.getDate() - daysAgo);
            const pid = productIds[i % productIds.length];
            const pData = await prisma.product.findUnique({ where: { id: pid }, select: { name: true, price: true, images: true } });
            if (!pData) continue;
            await prisma.order.create({
                data: {
                    userId: admin.id, status: statuses[i % 5] as any, amount: pData.price,
                    createdAt: orderDate, shippingName: 'Ali Hassan', shippingStreet1: '123 Aethelon Lane',
                    orderItems: { create: [{ productId: pid, name: pData.name, price: pData.price, quantity: 1, image: pData.images[0] }] },
                },
            });
        }
        console.log(`  ✔ 15 sample orders created`);
    } else {
        console.log(`  ⏭  Orders already exist`);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('  ✅ MASTER SEED COMPLETE');
    console.log('═══════════════════════════════════════\n');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
