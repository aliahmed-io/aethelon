import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { AddressManager } from "@/components/account/AddressManager";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Addresses — Aethelon",
};

export default async function AccountAddressesPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) return redirect("/api/auth/login?post_login_redirect_url=/account/addresses");

    const addresses = await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: { isDefault: "desc" },
    });

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-light tracking-tight uppercase border-b border-border pb-4">
                Saved Addresses
            </h2>
            <AddressManager addresses={addresses} />
        </div>
    );
}
