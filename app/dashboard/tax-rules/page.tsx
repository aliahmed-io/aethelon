import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/db";
import { createTaxRule, toggleTaxRule, deleteTaxRule } from "./actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default async function TaxRulesPage() {
    await requireAdmin();

    const rules = await prisma.taxRule.findMany({
        orderBy: [{ country: "asc" }, { region: "asc" }],
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-border pb-4">
                <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">
                    Tax Rules
                </h2>
            </div>

            {/* Create Form */}
            <Card className="p-6 bg-card border-border">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Add Tax Rule
                </h3>
                <form action={createTaxRule} className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">
                            Country (ISO)
                        </label>
                        <Input
                            name="country"
                            placeholder="US"
                            maxLength={2}
                            required
                            className="w-20 bg-background border-border text-foreground uppercase"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">
                            Region
                        </label>
                        <Input
                            name="region"
                            placeholder="CA"
                            maxLength={5}
                            className="w-20 bg-background border-border text-foreground uppercase"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">
                            Name
                        </label>
                        <Input
                            name="name"
                            placeholder="Sales Tax"
                            required
                            className="w-40 bg-background border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">
                            Rate (%)
                        </label>
                        <Input
                            name="rate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="8.25"
                            required
                            className="w-24 bg-background border-border text-foreground"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="inclusive"
                            id="inclusive"
                            className="rounded border-border"
                        />
                        <label
                            htmlFor="inclusive"
                            className="text-xs text-muted-foreground uppercase tracking-wider"
                        >
                            Inclusive (VAT)
                        </label>
                    </div>
                    <Button
                        type="submit"
                        className="bg-foreground text-background hover:bg-foreground/90 uppercase tracking-wider text-xs font-bold"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </form>
            </Card>

            {/* Rules Table */}
            <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">
                                Country
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">
                                Region
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">
                                Name
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">
                                Rate
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-center">
                                Type
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-center">
                                Status
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rules.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground py-12"
                                >
                                    No tax rules configured
                                </TableCell>
                            </TableRow>
                        ) : (
                            rules.map((rule: { id: string; country: string; region: string | null; name: string; rate: number; inclusive: boolean; active: boolean }) => (
                                <TableRow
                                    key={rule.id}
                                    className="border-border"
                                >
                                    <TableCell className="font-mono text-sm text-foreground">
                                        {rule.country}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-muted-foreground">
                                        {rule.region ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-foreground">
                                        {rule.name}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm text-foreground">
                                        {(rule.rate * 100).toFixed(2)}%
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium uppercase tracking-wide border ${rule.inclusive
                                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                                : "bg-slate-100 text-slate-700 border-slate-200"
                                                }`}
                                        >
                                            {rule.inclusive
                                                ? "Inclusive"
                                                : "Exclusive"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <form
                                            action={toggleTaxRule.bind(
                                                null,
                                                rule.id
                                            )}
                                            className="inline"
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="submit"
                                                className="h-8 w-8"
                                            >
                                                {rule.active ? (
                                                    <ToggleRight className="w-5 h-5 text-emerald-600" />
                                                ) : (
                                                    <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </form>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <form
                                            action={deleteTaxRule.bind(
                                                null,
                                                rule.id
                                            )}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="submit"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
