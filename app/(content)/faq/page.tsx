import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "FAQ — Aethelon",
    description: "Frequently asked questions about Aethelon furniture, shipping, returns, and care.",
};

const FAQ_SECTIONS = [
    {
        title: "Orders & Shipping",
        items: [
            {
                question: "How long does delivery take?",
                answer: "Standard delivery takes 3–5 business days within the continental US. White-glove delivery with in-home setup is available for an additional $199 and takes 5–10 business days.",
            },
            {
                question: "Do you ship internationally?",
                answer: "Yes. We ship to over 40 countries via our global logistics partners. International orders include full customs clearance. Delivery times range from 7–21 business days depending on destination.",
            },
            {
                question: "Can I track my order?",
                answer: "Absolutely. Once your order ships, you'll receive a tracking link via email. You can also check your order status anytime on our /tracking page.",
            },
            {
                question: "What is your return policy?",
                answer: "We offer a 30-day satisfaction guarantee. Items must be in original condition with all packaging. Contact our concierge to initiate a return — we'll arrange complimentary pickup for orders over $1,000.",
            },
        ],
    },
    {
        title: "Materials & Care",
        items: [
            {
                question: "What woods do you use?",
                answer: "We source FSC-certified solid hardwoods: American white oak, European walnut, and sustainably harvested teak. Every piece comes with a provenance certificate detailing the wood's origin.",
            },
            {
                question: "How should I care for my furniture?",
                answer: "Dust regularly with a soft, dry cloth. For deeper cleaning, use a damp microfiber cloth with mild soap. Avoid direct sunlight and extreme humidity. We provide a care guide with every purchase.",
            },
            {
                question: "Are your finishes non-toxic?",
                answer: "Yes. All finishes are VOC-free, water-based poly or natural oil. Our upholstery fabrics are OEKO-TEX certified. We publish full material safety data sheets for every product line.",
            },
        ],
    },
    {
        title: "Warranty & Repairs",
        items: [
            {
                question: "What does the warranty cover?",
                answer: "Every Aethelon piece carries a 5-year structural warranty covering frame, joints, and hardware defects. Upholstery and leather are covered for 2 years against manufacturing faults.",
            },
            {
                question: "Can I get replacement parts?",
                answer: "Yes. We maintain a parts inventory for every product line for at least 10 years after the last production run. Contact our concierge with your order number and we'll source replacements.",
            },
        ],
    },
    {
        title: "Design Services",
        items: [
            {
                question: "Do you offer interior design consultations?",
                answer: "Our Virtual Atelier provides AI-powered room visualization. For hands-on assistance, our Design Concierge team offers complimentary 30-minute consultations for orders above $5,000.",
            },
            {
                question: "Can I customize fabrics and finishes?",
                answer: "Select pieces are available in custom finishes and fabric choices. Lead times for custom orders are 8–12 weeks. Use our AI Vision tool to preview how different options look in your space.",
            },
        ],
    },
] as const;

export default function FAQPage() {
    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto max-w-3xl px-6 lg:px-12">
                <header className="mb-16 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                        Everything you need to know about Aethelon furniture, shipping, and services.
                    </p>
                </header>

                <div className="space-y-12">
                    {FAQ_SECTIONS.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-6 border-b border-border pb-3">
                                {section.title}
                            </h2>
                            <div className="space-y-0 divide-y divide-border">
                                {section.items.map((item) => (
                                    <details
                                        key={item.question}
                                        className="group py-5"
                                    >
                                        <summary className="flex items-center justify-between cursor-pointer list-none text-foreground font-medium text-sm hover:text-accent transition-colors">
                                            <span>{item.question}</span>
                                            <span className="ml-4 text-muted-foreground group-open:rotate-45 transition-transform duration-200 text-lg">+</span>
                                        </summary>
                                        <p className="mt-4 text-sm text-muted-foreground leading-relaxed pr-8">
                                            {item.answer}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-20 text-center border-t border-border pt-12">
                    <p className="text-sm text-muted-foreground mb-4">Still have questions?</p>
                    <a
                        href="/legal/contact"
                        className="inline-block px-8 py-3 bg-accent text-accent-foreground font-bold uppercase tracking-[0.2em] text-xs rounded-sm hover:bg-accent/90 transition-colors"
                    >
                        Contact Concierge
                    </a>
                </div>
            </div>
        </main>
    );
}
