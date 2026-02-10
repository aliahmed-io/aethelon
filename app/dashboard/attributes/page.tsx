import Prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";

// Server Action (inline for simplicity or keep in actions file)
async function createAttribute(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const values = (formData.get("values") as string).split(",").map(v => v.trim());

    if (!name) return;

    try {
        await Prisma.attribute.create({
            data: {
                name,
                values
            }
        });
        revalidatePath("/dashboard/attributes");
    } catch (e) {
        console.error("Failed to create attribute", e);
    }
}

async function deleteAttribute(id: string) {
    "use server";
    try {
        await Prisma.attribute.delete({ where: { id } });
        revalidatePath("/dashboard/attributes");
    } catch (e) {
        console.error("Failed to delete", e);
    }
}

export default async function AttributesPage() {
    // Try fetch, fallback to empty
    let attributes = [];
    try {
        attributes = await Prisma.attribute.findMany({ orderBy: { createdAt: 'desc' } });
    } catch (e) {
        console.error("DB Error or Table missing", e);
        // Fallback or empty if migration failed
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-light tracking-tight uppercase text-white">Attributes</h2>
                    <p className="text-white/40 text-sm mt-1">Manage filters for your shop (Colors, Sizes, etc.)</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Create Form */}
                <Card className="bg-[#050505]/40 border-white/10 text-white backdrop-blur-sm h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Add New Attribute</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={createAttribute} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Attribute Name</label>
                                <input
                                    name="name"
                                    placeholder="e.g. Color, Material"
                                    className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Values (comma separated)</label>
                                <input
                                    name="values"
                                    placeholder="e.g. Red, Blue, Green"
                                    className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                                    required
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Attribute
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="space-y-4">
                    {attributes.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-lg">
                            <p className="text-white/40">No attributes found. Create one to get started.</p>
                        </div>
                    ) : (
                        attributes.map((attr) => (
                            <Card key={attr.id} className="bg-[#050505]/40 border-white/10 text-white backdrop-blur-sm">
                                <div className="p-6 flex items-start justify-between">
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-medium">{attr.name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {attr.values.map((v, i) => (
                                                <Badge key={i} variant="outline" className="border-white/10 text-white/70">
                                                    {v}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <form action={deleteAttribute.bind(null, attr.id)}>
                                        <Button size="icon" variant="ghost" className="text-white/40 hover:text-red-400 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
