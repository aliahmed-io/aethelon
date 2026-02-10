import { z } from "zod";

export const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  price: z.number().min(1),
  images: z.array(z.string()).min(1, "At least one image is required"),
  category: z.string().min(1, "Sub Category is required"),
  mainCategory: z.enum(["MEN", "WOMEN", "KIDS"]),
  sizes: z.string().transform((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }),
  isFeatured: z.preprocess((val) => val === "on", z.boolean()).optional(),
  discountPercentage: z.number().min(0).max(100).default(0),
  stockQuantity: z.number().int().min(0).default(0),
  weight: z.number().min(0).default(1.0),
  lowStockThreshold: z.number().int().min(0).default(5),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Comment is required"),
});

export const bannerSchema = z.object({
  title: z.string(),
  imageString: z.string(),
});

export const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  street1: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"), // You might want to use specific country codes
  phone: z.string().optional(),
});

export const searchSchema = z.object({
  query: z.string().trim().max(100, "Query too long"),
  searchType: z.enum(["standard", "ai"]).optional().default("standard"),
});

export const assistantSchema = z.object({
  message: z.string().trim().min(1, "Message required").max(500, "Message too long"),
  mode: z.enum(["basic", "advanced"]).optional().default("basic"),
});

export const checkoutSchema = z.object({
  shippingName: z.string().min(1, "Name is required"),
  shippingPhone: z.string().optional(),
  shippingStreet1: z.string().min(1, "Street address is required"),
  shippingStreet2: z.string().optional(),
  shippingCity: z.string().min(1, "City is required"),
  shippingState: z.string().min(1, "State is required"),
  shippingPostalCode: z.string().min(1, "Postal code is required"),
  shippingCountry: z.string().min(1, "Country is required"),
  shippingRateId: z.string().optional(),
  shippingCost: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return 0;
    const n = Number(val);
    return Number.isFinite(n) ? n : val;
  }, z.number().min(0)).default(0),
  shippingServiceLevel: z.string().optional(),
  subscribeToNewsletter: z.preprocess((val) => Boolean(val), z.boolean()).optional(),
});