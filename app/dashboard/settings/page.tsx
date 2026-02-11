"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Save, Smartphone, MessageSquare, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

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
                    <h1 className="text-2xl font-light uppercase tracking-widest text-foreground">Settings</h1>
                    <p className="text-muted-foreground text-xs font-mono mt-1">GLOBAL CONFIGURATION</p>
                </div>
                <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>

            {/* AI Features */}
            <Card className="bg-card border-border shadow-sm">
                <CardHeader className="border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-foreground">AI Modules</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-full">
                                <MessageSquare className="w-4 h-4 text-foreground" />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-foreground">AI Concierge</Label>
                                <p className="text-xs text-muted-foreground">Enable the chatbot assistant across the store.</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.chatbotEnabled}
                            onCheckedChange={() => handleToggle('chatbotEnabled')}
                        />
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-full">
                                <Search className="w-4 h-4 text-foreground" />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-foreground">AI Search</Label>
                                <p className="text-xs text-muted-foreground">Enable semantic search and product recommendations.</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.aiSearchEnabled}
                            onCheckedChange={() => handleToggle('aiSearchEnabled')}
                        />
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-full">
                                <Smartphone className="w-4 h-4 text-foreground" />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-foreground">Virtual Try-On</Label>
                                <p className="text-xs text-muted-foreground">Allow users to use AR features on mobile devices.</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.virtualTryOnEnabled}
                            onCheckedChange={() => handleToggle('virtualTryOnEnabled')}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* General Settings */}
            <Card className="bg-card border-border shadow-sm">
                <CardHeader className="border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-foreground">System</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium text-foreground">Email Notifications</Label>
                            <p className="text-xs text-muted-foreground">Receive daily digests and critical alerts.</p>
                        </div>
                        <Switch
                            checked={settings.emailNotifications}
                            onCheckedChange={() => handleToggle('emailNotifications')}
                        />
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium text-destructive">Maintenance Mode</Label>
                            <p className="text-xs text-muted-foreground">Disable public access to the storefront.</p>
                        </div>
                        <Switch
                            checked={settings.maintenanceMode}
                            onCheckedChange={() => handleToggle('maintenanceMode')}
                            className="data-[state=checked]:bg-destructive"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
