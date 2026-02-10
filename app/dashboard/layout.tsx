import { ReactNode } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/app/components/dashboard/AdminSidebar";

// Basic admin check - in production you should use RBAC
function isAdminEmail(email?: string | null) {
    if (!email) return false;
    return email === "alihassan182006@gmail.com" || email.endsWith("@velorum.geneve.com");
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    // Verify Admin
    // For now we check email, but Kinde has Roles which is better long term.
    /*
    if (!user || user.email !== "your-admin-email@example.com") {
        return redirect("/");
    }
    */

    // Simpler check for now to allow you to view it
    if (!user) {
        return redirect("/api/auth/login");
    }

    if (!isAdminEmail(user.email)) {
        return redirect("/account");
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <AdminSidebar />
            <main className="ml-64 p-8 pt-24 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
