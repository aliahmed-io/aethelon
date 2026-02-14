export const metadata = {
    title: "Terms of Service - Aethelon",
};

export default function TermsPage() {
    return (
        <article>
            <h1>Terms of Service</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h2>1. Agreement to Terms</h2>
            <p>By accessing or using our website, you agree to be bound by these Terms of Service and our Privacy Policy.</p>

            <h2>2. Accounts</h2>
            <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>

            <h2>3. Purchases</h2>
            <p>If you wish to purchase any product or service made available through the Service (&quot;Purchase&quot;), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.</p>

            <h2>4. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Aethelon and its licensors.</p>

            <h2>5. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        </article>
    );
}
