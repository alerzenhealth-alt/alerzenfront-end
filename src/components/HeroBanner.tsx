import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const HeroBanner = () => {
    const [text, setText] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBannerSettings();
    }, []);

    const fetchBannerSettings = async () => {
        try {
            const { data } = await supabase
                .from('site_settings')
                .select('*')
                .eq('key', 'hero_banner')
                .maybeSingle();

            if (data) {
                setText(data.value);
                setIsActive(data.is_active || false);
            }
        } catch (error) {
            console.error("Failed to load hero banner:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !isActive || !text) return null;

    return (
        <div className="mb-4 w-full max-w-xl mx-auto lg:mx-0">
            <div className="bg-white/30 backdrop-blur-md border border-white/40 shadow-lg rounded-xl p-3 flex items-center justify-center text-center animate-fade-in">
                <span className="text-primary font-bold text-sm sm:text-base bg-white/50 px-3 py-1 rounded-full mr-2 shadow-sm">
                    New
                </span>
                <span className="text-gray-800 font-medium text-sm sm:text-base">
                    {text}
                </span>
            </div>
        </div>
    );
};
