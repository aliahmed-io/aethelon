"use client";

import { TextPageLayout } from "@/components/layout/TextPageLayout";
import { submitContactForm } from "./actions";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useActionState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full h-12 bg-accent text-accent-foreground font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-xs rounded-sm"
        >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Message <Send className="w-3 h-3" /></>}
        </button>
    );
}

export default function ContactPage() {
    const [state, formAction] = useActionState(submitContactForm, null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success) {
            toast.success("Message sent successfully!");
            formRef.current?.reset();
        } else if (state?.error && typeof state.error === "string") {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <TextPageLayout
            title="Contact"
            subtitle="Our concierge team is at your disposal."
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
                <div>
                    <p className="text-muted-foreground mb-8">
                        Whether you have questions about our collections, need assistance with an order, or simply wish to share your feedback, we are here to assist you.
                    </p>

                    <div className="space-y-6 text-sm">
                        <div>
                            <h4 className="text-foreground font-bold uppercase tracking-widest mb-1">Geneva HQ</h4>
                            <p className="text-muted-foreground">Rue du Rhône 42, 1204 Genève, Switzerland</p>
                        </div>
                        <div>
                            <h4 className="text-foreground font-bold uppercase tracking-widest mb-1">Email</h4>
                            <p className="text-muted-foreground">concierge@aethelon.geneve.com</p>
                        </div>
                    </div>
                </div>

                <form ref={formRef} action={formAction} className="space-y-6 bg-muted/50 p-8 border border-border backdrop-blur-sm shadow-lg rounded-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Name</label>
                            <input id="name" name="name" required className="w-full bg-background border border-border text-foreground p-3 text-sm focus:border-accent outline-none transition-colors rounded-sm" placeholder="ALEXANDER" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
                            <input id="email" name="email" type="email" required className="w-full bg-background border border-border text-foreground p-3 text-sm focus:border-accent outline-none transition-colors rounded-sm" placeholder="EMAIL@EXAMPLE.COM" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="subject" className="text-xs uppercase tracking-widest text-muted-foreground">Subject</label>
                        <input id="subject" name="subject" required className="w-full bg-background border border-border text-foreground p-3 text-sm focus:border-accent outline-none transition-colors rounded-sm" placeholder="INQUIRY" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="message" className="text-xs uppercase tracking-widest text-muted-foreground">Message</label>
                        <textarea id="message" name="message" required rows={5} className="w-full bg-background border border-border text-foreground p-3 text-sm focus:border-accent outline-none transition-colors resize-none rounded-sm" placeholder="YOUR MESSAGE..." />
                    </div>

                    <SubmitButton />
                </form>
            </div>
        </TextPageLayout>
    );
}
