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
        return redirect("/api/auth/login?post_login_redirect_url=/account/profile");
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar & Name */}
                <div className="md:col-span-2 flex items-center gap-5 p-6 border border-border rounded-sm">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border flex-shrink-0">
                        {kindeUser.picture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={kindeUser.picture}
                                alt="Profile"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-foreground">
                                {kindeUser.given_name?.[0]?.toUpperCase() || "A"}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-lg font-medium">
                            {kindeUser.given_name} {kindeUser.family_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{kindeUser.email}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                            Member since{" "}
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })
                                : "recently"}
                        </p>
                    </div>
                </div>

                {/* Details */}
                <div className="p-6 border border-border rounded-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">First Name</h3>
                    <p className="text-sm">{user?.firstName || kindeUser.given_name || "—"}</p>
                </div>
                <div className="p-6 border border-border rounded-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Name</h3>
                    <p className="text-sm">{user?.lastName || kindeUser.family_name || "—"}</p>
                </div>
                <div className="p-6 border border-border rounded-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</h3>
                    <p className="text-sm">{kindeUser.email || "—"}</p>
                </div>
                <div className="p-6 border border-border rounded-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account ID</h3>
                    <p className="text-sm font-mono text-muted-foreground">{kindeUser.id.slice(0, 12)}…</p>
                </div>
            </div>
        </div>
    );
}
