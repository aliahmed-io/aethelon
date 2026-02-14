import Prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Attribute } from "@prisma/client";

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
    let attributes: Attribute[] = [];
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
                    <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">Attributes</h2>
                    <p className="text-muted-foreground text-sm mt-1">Manage filters for your shop (Colors, Sizes, etc.)</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Create Form */}
                <Card className="bg-card border-border shadow-sm h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg text-foreground">Add New Attribute</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={createAttribute} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Attribute Name</Label>
                                <Input
                                    name="name"
                                    placeholder="e.g. Color, Material"
                                    className="bg-background border-input text-foreground"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Values (comma separated)</Label>
                                <Input
                                    name="values"
                                    placeholder="e.g. Red, Blue, Green"
                                    className="bg-background border-input text-foreground"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Attribute
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="space-y-4">
                    {attributes.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card">
                            <p className="text-muted-foreground">No attributes found. Create one to get started.</p>
                        </div>
                    ) : (
                        attributes.map((attr: any) => (
                            <Card key={attr.id} className="bg-card border-border shadow-sm">
                                <div className="p-6 flex items-start justify-between">
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-medium text-foreground">{attr.name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {attr.values.map((v: string, i: number) => (
                                                <Badge key={i} variant="outline" className="border-border text-muted-foreground bg-muted/20">
                                                    {v}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <form action={deleteAttribute.bind(null, attr.id)}>
                                        <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-red-500 hover:bg-red-50">
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
