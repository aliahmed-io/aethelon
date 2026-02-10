"use client";

import { useState } from "react";
import { X, Ruler, Watch, Info } from "lucide-react";

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
}

export function SizeGuideModal({ isOpen, onClose, productName }: SizeGuideModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-zinc-900 border border-white/10 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-zinc-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Ruler className="w-5 h-5 text-white/40" />
                        <h2 className="text-lg font-bold uppercase tracking-widest">Size Guide</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-white/50" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {productName && (
                        <p className="text-white/50 text-sm">Specifications for {productName}</p>
                    )}

                    {/* Watch Case Sizes */}
                    <section>
                        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                            <Watch className="w-4 h-4" />
                            Case Dimensions
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white/5 border border-white/10">
                                <p className="text-2xl font-light text-white mb-1">41mm</p>
                                <p className="text-[10px] uppercase tracking-widest text-white/40">Diameter</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10">
                                <p className="text-2xl font-light text-white mb-1">12.4mm</p>
                                <p className="text-[10px] uppercase tracking-widest text-white/40">Thickness</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10">
                                <p className="text-2xl font-light text-white mb-1">48mm</p>
                                <p className="text-[10px] uppercase tracking-widest text-white/40">Lug to Lug</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10">
                                <p className="text-2xl font-light text-white mb-1">20mm</p>
                                <p className="text-[10px] uppercase tracking-widest text-white/40">Lug Width</p>
                            </div>
                        </div>
                    </section>

                    {/* Wrist Size Recommendations */}
                    <section>
                        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">
                            Wrist Size Recommendations
                        </h3>
                        <div className="overflow-hidden border border-white/10">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-white/40">Wrist Circumference</th>
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-white/40">Recommended Case</th>
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-white/40">Fit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr>
                                        <td className="px-4 py-3 text-sm text-white">Under 6.5&quot;</td>
                                        <td className="px-4 py-3 text-sm text-white/70">36-38mm</td>
                                        <td className="px-4 py-3 text-xs text-white/40">Classic</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-sm text-white">6.5&quot; - 7.0&quot;</td>
                                        <td className="px-4 py-3 text-sm text-white/70">38-41mm</td>
                                        <td className="px-4 py-3 text-xs text-white/40">Ideal</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-sm text-white">7.0&quot; - 7.5&quot;</td>
                                        <td className="px-4 py-3 text-sm text-white/70">41-44mm</td>
                                        <td className="px-4 py-3 text-xs text-white/40">Ideal</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-sm text-white">Over 7.5&quot;</td>
                                        <td className="px-4 py-3 text-sm text-white/70">44-46mm</td>
                                        <td className="px-4 py-3 text-xs text-white/40">Bold</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* How to Measure */}
                    <section className="p-6 bg-white/5 border border-white/10">
                        <div className="flex items-start gap-4">
                            <Info className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-white mb-2">How to Measure Your Wrist</h4>
                                <ol className="text-sm text-white/60 space-y-2 list-decimal list-inside">
                                    <li>Wrap a flexible measuring tape around your wrist just below the wrist bone</li>
                                    <li>Keep the tape snug but not tight</li>
                                    <li>Note the measurement where the tape meets</li>
                                    <li>For a comfortable fit, add 0.5&quot; to your measurement</li>
                                </ol>
                            </div>
                        </div>
                    </section>

                    {/* Band Sizing */}
                    <section>
                        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">
                            Band Options
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border border-white/10 hover:border-white/20 transition-colors">
                                <p className="text-sm font-medium text-white mb-1">Leather Strap</p>
                                <p className="text-xs text-white/40">Adjustable 6.5&quot; - 8.5&quot;</p>
                            </div>
                            <div className="p-4 border border-white/10 hover:border-white/20 transition-colors">
                                <p className="text-sm font-medium text-white mb-1">Steel Bracelet</p>
                                <p className="text-xs text-white/40">Adjustable links included</p>
                            </div>
                            <div className="p-4 border border-white/10 hover:border-white/20 transition-colors">
                                <p className="text-sm font-medium text-white mb-1">NATO Strap</p>
                                <p className="text-xs text-white/40">Universal fit</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 px-6 py-4 text-center">
                    <p className="text-xs text-white/30">
                        Need help? Contact our concierge for personalized sizing assistance.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Button to trigger the modal
export function SizeGuideButton({ productName }: { productName?: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors uppercase tracking-widest"
            >
                <Ruler className="w-4 h-4" />
                Size Guide
            </button>
            <SizeGuideModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                productName={productName}
            />
        </>
    );
}
