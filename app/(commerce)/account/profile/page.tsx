import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/ProfileForm";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Personal Info — Aethelon",
};

export default async function AccountProfilePage() {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser || !kindeUser.id) {
        return redirect("/login?post_login_redirect_url=/account/profile");
    }

    const user = await prisma.user.findUnique({
        where: { id: kindeUser.id },
        include: { newsletterSubscription: true }
    });

    const initialData = {
        firstName: user?.firstName || kindeUser.given_name || "",
        lastName: user?.lastName || kindeUser.family_name || "",
        email: kindeUser.email || "",
        socialTitle: user?.socialTitle,
        birthdate: user?.birthdate,
        newsletter: user?.newsletterSubscription?.status === "subscribed",
    };

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-light tracking-tight uppercase border-b border-border pb-4">
                Personal Information
            </h2>

            <ProfileForm initialData={initialData} />
        </div>
    );
}
