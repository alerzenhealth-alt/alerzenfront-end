import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const AnnouncementBanner = () => {
    const [text, setText] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBannerSettings();
    }, []);

    const fetchBannerSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('key', 'announcement_banner')
                .single();

            if (error) {
                console.error("Error fetching banner settings:", error);
                return;
            }

            if (data) {
                setText(data.value);
                setIsActive(data.is_active);
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
            <div className="animate-marquee whitespace-nowrap font-medium text-sm md:text-base">
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
