import { TextPageLayout } from "@/app/components/TextPageLayout";

export const metadata = {
    title: "Privacy Policy | Velorum",
};

export default function PrivacyPage() {
    return (
        <TextPageLayout
            title="Privacy Policy"
            subtitle="How we protect and manage your personal data."
        >
            <p className="text-sm uppercase tracking-widest text-white/40 mb-12">Last updated: January 2026</p>

            <h3>1. Data Collection</h3>
            <p>
                We collect information you provide directly to us, such as when you create an account,
                make a purchase, or contact customer support. This includes:
            </p>
            <ul>
                <li>Name, email, and shipping address.</li>
                <li>Payment information (processed securely by Stripe).</li>
                <li>Try-On photos (processed temporarily by AI and deleted upon request).</li>
            </ul>

            <h3>2. Use of Information</h3>
            <p>
                We use your data to fulfill orders, improve our services, and send you updates
                (if opted in). We do not sell your personal data to third parties.
            </p>

            <h3>3. Cookies</h3>
            <p>
                We use cookies to analyze traffic and enhance your browsing experience.
                You can control cookie settings in your browser.
            </p>

            <h3>4. Your Rights</h3>
            <p>
                You have the right to access, correct, or delete your personal data.
                Contact privacy@velorum.geneve.com for assistance.
            </p>
        </TextPageLayout>
    );
}
