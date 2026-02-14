export const metadata = {
    title: "Shipping Policy - Aethelon",
};

export default function ShippingPage() {
    return (
        <article className="prose prose-stone dark:prose-invert max-w-none">
            <h1>Shipping Policy</h1>
            <p className="lead">Free worldwide shipping on all orders over $500.</p>

            <h2>1. processing time</h2>
            <p>All orders are processed within 1-3 business days. Custom pieces from our Atelier may take 4-6 weeks.</p>

            <h2>2. Shipping Rates</h2>
            <p>
                We offer flat-rate shipping for standard orders:<br />
                - <strong>Standard:</strong> Free (5-7 business days)<br />
                - <strong>Express:</strong> $25 (2-3 business days)<br />
                - <strong>White Glove:</strong> Calculated at checkout
            </p>

            <h2>3. International Shipping</h2>
            <p>We ship to over 50 countries. Duties and taxes are calculated at checkout.</p>
        </article>
    );
}
