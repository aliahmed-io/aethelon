
import { ReactNode } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { AdminSidebar } from "@/components/dashboard/AdminSidebar";

import { requireAdmin } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    // Verify Admin (will redirect if not admin)
    await requireAdmin();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AdminSidebar />
            <main className="md:ml-64 p-4 md:p-8 pt-24 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
