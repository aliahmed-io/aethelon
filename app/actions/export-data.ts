"use server";

import prisma from "@/lib/db";
import { format } from "date-fns";

// Helper to escape CSV fields
const escapeCsvField = (field: unknown) => {
    if (field === null || field === undefined) return "";
    const stringField = String(field);
    if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

export async function exportOrders() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                User: {
                    select: { email: true, firstName: true, lastName: true }
                },
                orderItems: true
            },
            orderBy: { createdAt: "desc" }
        });

        const headers = ["Order ID", "Date", "Customer Email", "Customer Name", "Total Amount", "Status", "Items Count", "Shipping Country"];
        const rows = orders.map(order => [
            order.id,
            format(order.createdAt, "yyyy-MM-dd HH:mm:ss"),
            order.User?.email || "Guest",
            `${order.User?.firstName || ""} ${order.User?.lastName || ""}`.trim() || "Guest",
            (order.amount / 100).toFixed(2), // Assuming amount is in cents
            order.status,
            order.orderItems.length,
            order.shippingCountry || "N/A"
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(escapeCsvField).join(","))
        ].join("\n");

        return { success: true, data: csvContent, filename: `orders_export_${format(new Date(), "yyyyMMdd_HHmmss")}.csv` };
    } catch (error) {
        console.error("Export Orders Error:", error);
        return { success: false, error: "Failed to export orders" };
    }
}

export async function exportUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" }
        });

        const headers = ["User ID", "Email", "First Name", "Last Name", "Role", "Joined Date"];
        const rows = users.map(user => [
            user.id,
            user.email,
            user.firstName,
            user.lastName,
            user.role,
            format(user.createdAt, "yyyy-MM-dd HH:mm:ss")
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(escapeCsvField).join(","))
        ].join("\n");

        return { success: true, data: csvContent, filename: `users_export_${format(new Date(), "yyyyMMdd_HHmmss")}.csv` };
    } catch (error) {
        console.error("Export Users Error:", error);
        return { success: false, error: "Failed to export users" };
    }
}

export async function exportRevenue() {
    try {
        // Aggregating revenue by day for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyStats = await prisma.dailyStat.findMany({
            where: {
                date: {
                    gte: thirtyDaysAgo
                }
            },
            orderBy: { date: "desc" }
        });

        const headers = ["Date", "Total Revenue", "Total Orders", "Total Visitors"];
        const rows = dailyStats.map(stat => [
            format(stat.date, "yyyy-MM-dd"),
            (stat.totalRevenue / 100).toFixed(2),
            stat.totalOrders,
            stat.totalVisitors
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(escapeCsvField).join(","))
        ].join("\n");

        return { success: true, data: csvContent, filename: `revenue_export_${format(new Date(), "yyyyMMdd_HHmmss")}.csv` };
    } catch (error) {
        console.error("Export Revenue Error:", error);
        return { success: false, error: "Failed to export revenue" };
    }
}
