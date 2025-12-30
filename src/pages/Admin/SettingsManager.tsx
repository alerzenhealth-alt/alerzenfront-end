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

    // Exit Intent State
    const [exitPopupEnabled, setExitPopupEnabled] = useState(true);
    const [exitPopupHeading, setExitPopupHeading] = useState("");
    const [exitPopupSubheading, setExitPopupSubheading] = useState("");
    const [exitPopupPromoCode, setExitPopupPromoCode] = useState("");

    // Banner State
    const [bannerText, setBannerText] = useState("");
    const [isBannerActive, setIsBannerActive] = useState(false);
    const [bannerSpeed, setBannerSpeed] = useState(20);

    // Hero Banner State
    const [heroBannerText, setHeroBannerText] = useState("");
    const [isHeroBannerActive, setIsHeroBannerActive] = useState(false);
    const [heroSpotlightId, setHeroSpotlightId] = useState<string>("");
    const [packages, setPackages] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        fetchSettings();
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        const { data } = await supabase.from('tests').select('id, name').eq('category', 'Package');
        if (data) setPackages(data);
    };

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('id', 1)
                .single();

            if (error) throw error;

            if (data) {
                // Exit Intent
                setExitPopupEnabled(data.exit_popup_enabled);
                setExitPopupHeading(data.exit_popup_heading || "");
                setExitPopupSubheading(data.exit_popup_subheading || "");
                setExitPopupPromoCode(data.exit_popup_promo_code || "");

                // Announcement Banner
                setIsBannerActive(data.announcement_banner_enabled || false);
                setBannerText(data.announcement_banner_text || "");
                setBannerSpeed(data.announcement_banner_speed || 20);

                // Hero Banner
                setIsHeroBannerActive(data.hero_banner_enabled || false);
                setHeroBannerText(data.hero_banner_text || "");
                // Use a try-catch for the new column in case it doesn't exist yet to prevent crash
                try {
                    setHeroSpotlightId((data as any).hero_spotlight_id || "");
                } catch (e) {
                    console.log("Spotlight column missing");
                }
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Failed to load settings. Ensure the database table exists.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .update({
                    // Exit Intent
                    exit_popup_enabled: exitPopupEnabled,
                    exit_popup_heading: exitPopupHeading,
                    exit_popup_subheading: exitPopupSubheading,
                    exit_popup_promo_code: exitPopupPromoCode,

                    // Announcement Banner
                    announcement_banner_enabled: isBannerActive,
                    announcement_banner_text: bannerText,
                    announcement_banner_speed: bannerSpeed,

                    // Hero Banner
                    hero_banner_enabled: isHeroBannerActive,
                    hero_banner_text: heroBannerText,
                    hero_spotlight_id: heroSpotlightId || null
                })
                .eq('id', 1);

            if (error) throw error;

            toast.success("All settings saved successfully!");
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

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
                            placeholder="Call us for home collection..."
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>Scroll Speed (Duration: {bannerSpeed}s)</Label>
                            <span className="text-xs text-muted-foreground">Lower is faster</span>
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
                    <CardTitle>Hero Notification</CardTitle>
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

            <Card>
                <CardHeader>
                    <CardTitle>Hero Spotlight Card</CardTitle>
                    <CardDescription>
                        Select which package appears in the floating glass card on the homepage.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Spotlight Package</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={heroSpotlightId}
                            onChange={(e) => setHeroSpotlightId(e.target.value)}
                        >
                            <option value="">-- Automatic (Best Seller) --</option>
                            {packages.map(pkg => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground">
                            If "Automatic" is selected, the system will show the package marked as "Popular".
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Exit Intent Popup (Marketing)</CardTitle>
                    <CardDescription>
                        Manage the popup that appears when users try to leave the site.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2 border-b pb-4">
                        <Label htmlFor="popup-active" className="flex flex-col space-y-1">
                            <span className="font-medium">Enable Popup</span>
                            <span className="text-xs text-muted-foreground">Show this popup on Desktop (exit intent) and Mobile (timer).</span>
                        </Label>
                        <Switch
                            id="popup-active"
                            checked={exitPopupEnabled}
                            onCheckedChange={setExitPopupEnabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="popup-heading">Heading Text</Label>
                        <Input
                            id="popup-heading"
                            value={exitPopupHeading}
                            onChange={(e) => setExitPopupHeading(e.target.value)}
                            placeholder="Wait! Don't Miss Out"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="popup-subheading">Subheading / Offer Text</Label>
                        <Input
                            id="popup-subheading"
                            value={exitPopupSubheading}
                            onChange={(e) => setExitPopupSubheading(e.target.value)}
                            placeholder="Get an extra 10% OFF..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="popup-code">Promo Code to Display</Label>
                        <Input
                            id="popup-code"
                            value={exitPopupPromoCode}
                            onChange={(e) => setExitPopupPromoCode(e.target.value)}
                            placeholder="HEALTH10"
                        />
                        <p className="text-xs text-muted-foreground">Make sure this code actually exists in 'Promo Codes' tab!</p>
                    </div>

                </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
            </Button>
        </div >
    );
};

export default SettingsManager;
