import { requireAdmin } from "@/lib/auth";
import AdminCOOClient from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminCOOPage() {
    await requireAdmin();

    return <AdminCOOClient />;
}
