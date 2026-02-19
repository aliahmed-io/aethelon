"use client";

import { useState, useTransition } from "react";
import { updateSettings, type StoreSettings } from "./actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
    Bot,
    Search,
    Eye,
    Shield,
    Mail,
    Loader2,
    Check,
} from "lucide-react";
import { toast } from "sonner";

type SettingsFormProps = {
    initialSettings: StoreSettings;
};

const settingsConfig: {
    key: keyof StoreSettings;
    label: string;
    description: string;
    icon: typeof Bot;
    category: string;
}[] = [
        {
            key: "chatbotEnabled",
            label: "AI Chatbot",
            description: "Enable the AI-powered customer support chatbot on the storefront.",
            icon: Bot,
            category: "AI Modules",
        },
        {
            key: "aiSearchEnabled",
            label: "AI Search",
            description: "Enable natural language product search powered by AI.",
            icon: Search,
            category: "AI Modules",
        },
        {
            key: "virtualTryOnEnabled",
            label: "Virtual Try-On",
            description: "Enable AR/3D product visualization for customers.",
            icon: Eye,
            category: "AI Modules",
        },
        {
            key: "maintenanceMode",
            label: "Maintenance Mode",
            description: "Put the storefront in maintenance mode. Only admins can access.",
            icon: Shield,
            category: "System",
        },
        {
            key: "emailNotifications",
            label: "Email Notifications",
            description: "Send transactional emails for orders, shipments, and updates.",
            icon: Mail,
            category: "System",
        },
    ];

export function SettingsForm({ initialSettings }: SettingsFormProps) {
    const [settings, setSettings] = useState<StoreSettings>(initialSettings);
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    const handleToggle = (key: keyof StoreSettings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
        setSaved(false);
    };

    const handleSave = () => {
        const formData = new FormData();
        Object.entries(settings).forEach(([key, value]) => {
            if (value) formData.append(key, "on");
        });

        startTransition(async () => {
            await updateSettings(formData);
            setSaved(true);
            toast.success("Settings saved successfully.");
        });
    };

    const categories = Array.from(new Set(settingsConfig.map((s) => s.category)));

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">Settings</h2>
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="h-10 px-6 bg-foreground text-background font-bold uppercase tracking-widest text-xs hover:bg-foreground/90"
                >
                    {isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : saved ? (
                        <><Check className="w-4 h-4 mr-2" /> Saved</>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>

            {categories.map((category) => (
                <div key={category}>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 pb-4 border-b border-border">
                        {category}
                    </h3>
                    <div className="space-y-4">
                        {settingsConfig
                            .filter((s) => s.category === category)
                            .map((setting) => {
                                const Icon = setting.icon;
                                return (
                                    <Card
                                        key={setting.key}
                                        className="flex items-center justify-between p-6 bg-card border-border hover:border-accent/20 transition-colors"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-muted rounded-sm">
                                                <Icon className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-foreground block mb-1">
                                                    {setting.label}
                                                </Label>
                                                <p className="text-xs text-muted-foreground max-w-sm">
                                                    {setting.description}
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={settings[setting.key]}
                                            onCheckedChange={() => handleToggle(setting.key)}
                                        />
                                    </Card>
                                );
                            })}
                    </div>
                </div>
            ))}
        </div>
    );
}
