import Prisma from "@/lib/db";
import { RolesClient } from "./RolesClient";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
    let users: any[] = [];
    try {
        users = await Prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100 // Production cap
        });
    } catch (e) {
        console.log("DB Error fetching users", e);
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">User Roles</h2>
                    <p className="text-muted-foreground text-sm mt-1">Manage global access permissions and staff roles</p>
                </div>
            </div>

            <RolesClient initialUsers={users} />
        </div>
    );
}
