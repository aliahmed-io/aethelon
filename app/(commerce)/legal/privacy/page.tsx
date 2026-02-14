export const metadata = {
    title: "Privacy Policy - Aethelon",
};

export default function PrivacyPage() {
    return (
        <article>
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h2>1. Introduction</h2>
            <p>Aethelon (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>

            <h2>2. Data We Collect</h2>
            <ul>
                <li><strong>Identity Data:</strong> Name, username, or similar identifier.</li>
                <li><strong>Contact Data:</strong> Billing address, delivery address, email address, and telephone numbers.</li>
                <li><strong>Financial Data:</strong> Payment card details (Processed via Stripe, not stored on our servers).</li>
                <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products you have purchased.</li>
            </ul>

            <h2>3. How We Use Your Data</h2>
            <p>We only use your data when the law allows us to. Most commonly:</p>
            <ul>
                <li>To perform the contract we are about to enter into or have entered into with you (Order Fulfillment).</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li>To comply with a legal or regulatory obligation.</li>
            </ul>

            <h2>4. Third-Party Services</h2>
            <p>We share data with specific third parties to fulfill our services:</p>
            <ul>
                <li><strong>Stripe:</strong> Payment processing.</li>
                <li><strong>Shippo:</strong> Shipping label generation and tracking.</li>
                <li><strong>Resend:</strong> Transactional emails.</li>
            </ul>

            <h2>5. Your Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, or to object to processing.</p>
        </article>
    );
}
