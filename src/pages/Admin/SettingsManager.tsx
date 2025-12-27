import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const SettingsManager = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Banner State
    const [bannerText, setBannerText] = useState("");
    const [isBannerActive, setIsBannerActive] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('key', 'announcement_banner')
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setBannerText(data.value || "");
                setIsBannerActive(data.is_active || false);
            } else {
                // If no record exists, set defaults (we will upsert on save)
                setBannerText("");
                setIsBannerActive(false);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Failed to load settings. Ensure 'site_settings' table exists!");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBanner = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'announcement_banner',
                    value: bannerText,
                    is_active: isBannerActive,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            toast.success("Banner settings saved successfully!");
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-bold">Site Settings</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Announcement Banner</CardTitle>
                    <CardDescription>
                        Manage the scrolling text banner at the top of your website.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="banner-active" className="flex flex-col space-y-1">
                            <span>Enable Banner</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Show or hide the banner on the website.
                            </span>
                        </Label>
                        <Switch
                            id="banner-active"
                            checked={isBannerActive}
                            onCheckedChange={setIsBannerActive}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="banner-text">Banner Text</Label>
                        <Input
                            id="banner-text"
                            placeholder="e.g. 50% OFF on Full Body Checkups!"
                            value={bannerText}
                            onChange={(e) => setBannerText(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            This text will scroll horizontally across the screen.
                        </p>
                    </div>

                    <Button onClick={handleSaveBanner} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsManager;
