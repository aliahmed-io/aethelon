"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Save, Smartphone, MessageSquare, Search } from "lucide-react";

export default function SettingsPage() {
    // In a real app, fetch these from DB/Redis
    const [settings, setSettings] = useState({
        chatbotEnabled: true,
        aiSearchEnabled: true,
        virtualTryOnEnabled: true,
        maintenanceMode: false,
        emailNotifications: true,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        // Here we would call a server action, e.g., updateSettings(settings)
        toast.success("Settings updated successfully.");
    };

    return (
        <div className="space-y-10 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-light uppercase tracking-widest text-white">Settings</h1>
                    <p className="text-white/40 text-xs font-mono mt-1">GLOBAL CONFIGURATION</p>
                </div>
                <Button onClick={handleSave} className="bg-white text-black hover:bg-zinc-200">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>

            {/* AI Features */}
            <div className="bg-[#0A0A0C] border border-white/10 rounded-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-white/50" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">AI Modules</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/5 rounded-full">
                                <MessageSquare className="w-4 h-4 text-white/70" />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-white">AI Concierge</Label>
                                <p className="text-xs text-white/40">Enable the chatbot assistant across the store.</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.chatbotEnabled}
                            onCheckedChange={() => handleToggle('chatbotEnabled')}
                        />
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/5 rounded-full">
                                <Search className="w-4 h-4 text-white/70" />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-white">AI Search</Label>
                                <p className="text-xs text-white/40">Enable semantic search and product recommendations.</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.aiSearchEnabled}
                            onCheckedChange={() => handleToggle('aiSearchEnabled')}
                        />
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/5 rounded-full">
                                <Smartphone className="w-4 h-4 text-white/70" />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-white">Virtual Try-On</Label>
                                <p className="text-xs text-white/40">Allow users to use AR features on mobile devices.</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.virtualTryOnEnabled}
                            onCheckedChange={() => handleToggle('virtualTryOnEnabled')}
                        />
                    </div>
                </div>
            </div>

            {/* General Settings */}
            <div className="bg-[#0A0A0C] border border-white/10 rounded-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-white/50" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">System</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium text-white">Email Notifications</Label>
                            <p className="text-xs text-white/40">Receive daily digests and critical alerts.</p>
                        </div>
                        <Switch
                            checked={settings.emailNotifications}
                            onCheckedChange={() => handleToggle('emailNotifications')}
                        />
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium text-red-400">Maintenance Mode</Label>
                            <p className="text-xs text-white/40">Disable public access to the storefront.</p>
                        </div>
                        <Switch
                            checked={settings.maintenanceMode}
                            onCheckedChange={() => handleToggle('maintenanceMode')}
                            className="data-[state=checked]:bg-red-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
