
import { ReactNode } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";

// Basic admin check - in production you should use RBAC
function isAdminEmail(email?: string | null) {
    if (!email) return false;
    return email === "alihassan182006@gmail.com" || email.endsWith("@aethelon.geneve.com");
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    // Verify Admin
    if (!user) {
        return redirect("/api/auth/login");
    }

    if (!isAdminEmail(user.email)) {
        return redirect("/account");
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AdminSidebar />
            <main className="ml-64 p-8 pt-24 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
