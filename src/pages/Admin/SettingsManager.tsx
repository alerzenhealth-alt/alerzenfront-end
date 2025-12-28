import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const SettingsManager = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Banner State
    const [bannerText, setBannerText] = useState("");
    const [isBannerActive, setIsBannerActive] = useState(false);
    const [bannerSpeed, setBannerSpeed] = useState(20); // Default 20s

    // Hero Banner State
    const [heroBannerText, setHeroBannerText] = useState("");
    const [isHeroBannerActive, setIsHeroBannerActive] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', ['announcement_banner', 'announcement_speed', 'hero_banner']);

            if (error) throw error;

            if (data) {
                const banner = data.find(d => d.key === 'announcement_banner');
                const speed = data.find(d => d.key === 'announcement_speed');
                const hero = data.find(d => d.key === 'hero_banner');

                if (banner) {
                    setBannerText(banner.value || "");
                    setIsBannerActive(banner.is_active || false);
                }
                if (speed) {
                    setBannerSpeed(Number(speed.value) || 20);
                }
                if (hero) {
                    setHeroBannerText(hero.value || "");
                    setIsHeroBannerActive(hero.is_active || false);
                }
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Failed to load settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBanner = async () => {
        setSaving(true);
        try {
            const updates = [
                {
                    key: 'announcement_banner',
                    value: bannerText,
                    is_active: isBannerActive,
                    updated_at: new Date().toISOString()
                },
                {
                    key: 'announcement_speed',
                    value: String(bannerSpeed),
                    is_active: true,
                    updated_at: new Date().toISOString()
                },
                {
                    key: 'hero_banner',
                    value: heroBannerText,
                    is_active: isHeroBannerActive,
                    updated_at: new Date().toISOString()
                }
            ];

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates);

            if (error) throw error;

            toast.success("Settings saved successfully!");
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
                    <CardTitle>Top Announcement Banner</CardTitle>
                    <CardDescription>
                        Manage the scrolling text banner at the very top.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="banner-active" className="flex flex-col space-y-1">
                            <span>Enable Top Banner</span>
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
                            value={bannerText}
                            onChange={(e) => setBannerText(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>Scroll Speed (Duration: {bannerSpeed}s)</Label>
                            <span className="text-xs text-muted-foreground">Lower is faster (e.g. 5s is very fast, 60s is slow)</span>
                        </div>
                        <Slider
                            value={[bannerSpeed]}
                            onValueChange={(vals) => setBannerSpeed(vals[0])}
                            min={5}
                            max={60}
                            step={1}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Hero Notification (Above Search)</CardTitle>
                    <CardDescription>
                        A glassmorphism banner appearing just above the search bar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="hero-active" className="flex flex-col space-y-1">
                            <span>Enable Hero Banner</span>
                        </Label>
                        <Switch
                            id="hero-active"
                            checked={isHeroBannerActive}
                            onCheckedChange={setIsHeroBannerActive}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hero-text">Notification Text</Label>
                        <Input
                            id="hero-text"
                            placeholder="e.g. Reports in 6 hours!"
                            value={heroBannerText}
                            onChange={(e) => setHeroBannerText(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Button onClick={handleSaveBanner} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save All Settings
            </Button>
        </div>
    );
};

export default SettingsManager;
