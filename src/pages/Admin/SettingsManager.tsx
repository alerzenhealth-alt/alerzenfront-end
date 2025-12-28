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

    // Exit Intent State
    const [exitPopupEnabled, setExitPopupEnabled] = useState(true);
    const [exitPopupHeading, setExitPopupHeading] = useState("");
    const [exitPopupSubheading, setExitPopupSubheading] = useState("");
    const [exitPopupPromoCode, setExitPopupPromoCode] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

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
                setExitPopupEnabled(data.exit_popup_enabled);
                setExitPopupHeading(data.exit_popup_heading || "");
                setExitPopupSubheading(data.exit_popup_subheading || "");
                setExitPopupPromoCode(data.exit_popup_promo_code || "");
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
                    exit_popup_enabled: exitPopupEnabled,
                    exit_popup_heading: exitPopupHeading,
                    exit_popup_subheading: exitPopupSubheading,
                    exit_popup_promo_code: exitPopupPromoCode
                })
                .eq('id', 1);

            if (error) throw error;

            toast.success("Marketing settings saved successfully!");
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
        </div>
    );
};

export default SettingsManager;
