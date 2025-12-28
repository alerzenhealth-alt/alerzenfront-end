import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const AnnouncementBanner = () => {
    const [text, setText] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [speed, setSpeed] = useState(20);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBannerSettings();
    }, []);

    const fetchBannerSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', ['announcement_banner', 'announcement_speed']);

            if (error) {
                console.error("Error fetching banner settings:", error);
                return;
            }

            if (data) {
                const banner = data.find(d => d.key === 'announcement_banner');
                const speedSetting = data.find(d => d.key === 'announcement_speed');

                if (banner) {
                    setText(banner.value);
                    setIsActive(banner.is_active);
                }
                if (speedSetting) {
                    setSpeed(Number(speedSetting.value) || 20);
                }
            }
        } catch (error) {
            console.error("Failed to load banner:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !isActive || !text) return null;

    return (
        <div className="bg-primary text-white py-2 overflow-hidden relative z-40 shadow-md mt-16">
            <div
                className="animate-marquee whitespace-nowrap font-medium text-sm md:text-base"
                style={{ animationDuration: `${speed}s` }}
            >
                {text}
                <span className="mx-8">•</span>
                {text}
                <span className="mx-8">•</span>
                {text}
                <span className="mx-8">•</span>
                {text}
            </div>
        </div>
    );
};
