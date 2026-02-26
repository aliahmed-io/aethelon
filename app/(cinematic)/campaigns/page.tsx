import Prisma from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
    const campaigns = await Prisma.campaign.findMany({
        where: {
            status: "ACTIVE",
        },
        orderBy: {
            startDate: 'desc'
        },
        take: 3
    });

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#131009] text-[#EDE0CC] pt-40 pb-20 px-6 md:px-12">
                <header className="mb-20 max-w-4xl">
                    <h1 className="text-5xl md:text-8xl font-serif uppercase tracking-tight mb-6 leading-none">
                        The <span className="italic text-[#AB7E22]">Archives</span>
                    </h1>
                    <p className="text-[#9A7A5C] text-lg md:text-xl font-light max-w-2xl leading-relaxed uppercase tracking-widest">
                        Curated collections and horological narratives from the Aethelon Vault.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {campaigns.map((campaign, idx) => (
                        <Link
                            key={campaign.id}
                            href={`/campaigns/${campaign.slug}`}
                            className="group relative flex flex-col gap-6"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden bg-[#1C1510] border border-[#2A1E14] transition-all duration-700 group-hover:border-[#AB7E22]/50">
                                {campaign.heroImage && (
                                    <Image
                                        src={campaign.heroImage}
                                        alt={campaign.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#131009] via-transparent to-transparent" />

                                <div className="absolute top-6 left-6">
                                    <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#AB7E22]">
                                        Collection 0{idx + 1}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h2 className="text-3xl font-serif uppercase tracking-tight group-hover:text-[#AB7E22] transition-colors">
                                    {campaign.title}
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] w-12 bg-[#2A1E14] group-hover:w-20 group-hover:bg-[#AB7E22] transition-all duration-500" />
                                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9A7A5C]">
                                        Enter Archive
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {campaigns.length === 0 && (
                    <div className="py-40 text-center border-y border-[#2A1E14]">
                        <p className="text-[#9A7A5C] uppercase tracking-[0.5em] text-sm italic">
                            The Vault is currently sealed.
                        </p>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}

