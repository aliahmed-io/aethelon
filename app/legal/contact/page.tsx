
import { Navbar } from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
    title: "Contact | Velorum",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
            <Navbar />

            <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
                <div className="mb-16">
                    <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-white mb-6 uppercase">
                        Concierge
                    </h1>
                    <div className="w-16 h-1 bg-white mb-8"></div>
                    <p className="text-xl text-white/60 font-light max-w-2xl leading-relaxed">
                        Our AI-enhanced concierge is available 24/7 to assist with inquiries, bespoke commissions, and technical support.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Left: Info */}
                    <div className="space-y-12">
                        <div className="p-8 border border-white/5 bg-white/5 backdrop-blur-sm rounded-sm">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
                                Headquarters
                            </h3>
                            <p className="text-white/60 text-sm leading-7">
                                Velorum SA<br />
                                Baumgartenstrasse 15<br />
                                8201 Schaffhausen<br />
                                Switzerland
                            </p>
                        </div>

                        <div className="p-8 border border-white/5 bg-white/5 backdrop-blur-sm rounded-sm">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">
                                Direct Line
                            </h3>
                            <p className="text-white/60 text-sm leading-7 mb-4">
                                +41 52 635 65 65
                            </p>
                            <p className="text-white/40 text-xs uppercase tracking-wider">
                                Mon-Fri: 09:00 - 18:00 CET
                            </p>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="bg-white/5 border border-white/5 backdrop-blur-sm p-8 rounded-sm">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-8">
                            Send a Message
                        </h3>

                        <form className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">First Name</label>
                                    <Input className="bg-black/40 border-white/10 text-white h-12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-white/40">Last Name</label>
                                    <Input className="bg-black/40 border-white/10 text-white h-12" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/40">Email Address</label>
                                <Input type="email" className="bg-black/40 border-white/10 text-white h-12" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/40">Message</label>
                                <Textarea className="bg-black/40 border-white/10 text-white min-h-[150px]" />
                            </div>

                            <div className="flex items-center gap-4 py-4 px-4 bg-blue-500/10 border border-blue-500/20 rounded-sm">
                                <span className="text-xl">✨</span>
                                <p className="text-xs text-blue-200">
                                    Our AI Concierge will analyze your request and route it to the appropriate department instantly.
                                </p>
                            </div>

                            <Button className="w-full h-12 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200">
                                Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
