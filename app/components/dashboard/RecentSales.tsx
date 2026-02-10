import prisma from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/utils";

async function getData() {
    const data = await prisma.order.findMany({
        select: {
            amount: true,
            id: true,
            User: {
                select: {
                    firstName: true,
                    profileImage: true,
                    email: true,
                },
            },
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
    });

    return data;
}

export async function RecentSales() {
    const data = await getData();

    if (data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-white/30 text-sm italic">
                No recent sales activity
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {data.map((item) => (
                <div className="flex items-center gap-4 group" key={item.id}>
                    <Avatar className="h-9 w-9 border border-white/10 ring-1 ring-white/5 group-hover:ring-white/20 transition-all">
                        <AvatarImage src={item.User?.profileImage} alt="Avatar" />
                        <AvatarFallback className="bg-white/5 text-xs text-white/70">
                            {item.User?.firstName?.slice(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">
                            {item.User?.firstName || "Guest User"}
                        </p>
                        <p className="text-xs text-white/40 truncate w-32 sm:w-auto">
                            {item.User?.email || "No email"}
                        </p>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-0.5">
                        <p className="font-medium text-white/90">
                            +{formatPrice(item.amount / 100)}
                        </p>
                        <p className="text-[10px] text-white/30">
                            {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
