import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Phone, Mail, Globe, Download, Share2 } from "lucide-react";

// Simple icon for WhatsApp since it's not in standard lucide set in the same way
const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.003.551 1.978.896 3.093.896 3.193 0 5.775-2.582 5.777-5.766.002-3.184-2.578-5.771-5.777-5.771zm.009 10.125c-.939 0-1.78-.292-2.56-0.783l-.159-.101-1.639.43.438-1.596-.115-0.183c-.569-.91-.871-1.782-.872-2.883 0-2.613 2.126-4.739 4.744-4.744 2.618 0.001 4.745 2.128 4.743 4.743 0 2.617-2.128 4.747-4.747 4.747h0.001zm2.594-3.558c-.143-.072-0.841-.416-0.971-.464-.13-.047-.225-.071-.321.072-.095.143-.368.464-.45.56-.083.095-.167.108-.31.036-.143-.072-.603-.223-1.15-.711-.424-.378-.71-.845-.794-.988-.083-.143-.009-.221.063-.292.065-.065.143-.169.215-.253.072-.083.095-.143.143-.238.047-.095.024-.179-.012-.25-.036-.072-.321-0.774-.439-1.06-.115-.279-.232-.241-.321-.245-.084-.004-.179-.004-.275-.004-.095 0-.25.036-.381.18-.13.144-.499.488-.499 1.191 0 .703.508 1.381.579 1.477.072.095 1.001 1.528 2.425 2.143.338.146.602.233.808.298.339.108.648.093.893.056.273-.041.841-.344.96-.675.119-.332.119-.616.083-.675-.035-.06-.129-.096-.272-.168z" />
    </svg>
);

const Connect = () => {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchCardData();
    }, [id]);

    const fetchCardData = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('qr_cards')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setData(data);
        } catch (error) {
            console.error("Error loading card:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadVCard = () => {
        if (!data) return;

        // Construct VCard 3.0
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${data.title}
TEL;TYPE=CELL:${data.phone_number || ""}
EMAIL:${data.email || ""}
URL:${data.website_url || ""}
END:VCARD`;

        const blob = new Blob([vcard], { type: "text/vcard" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${data.title.replace(/\s+/g, "_")}.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-muted-foreground">Contact card not found.</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-t-8 border-t-primary animate-in fade-in zoom-in duration-500">
                <CardHeader className="text-center pt-10 pb-2 relative">
                    {/* Logo Avatar */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full shadow-lg p-2 flex items-center justify-center">
                        {data.logo_url ? (
                            <img src={data.logo_url} alt="Logo" className="w-full h-full object-contain rounded-full" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                {data.title.charAt(0)}
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold mt-4">{data.title}</h1>
                    <p className="text-muted-foreground text-sm">Alerzen Health Diagnostic Center</p>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    {/* Primary Action */}
                    <Button size="lg" className="w-full text-lg h-14 shadow-lg shadow-primary/20" onClick={downloadVCard}>
                        <Download className="mr-2 w-5 h-5" />
                        Save Contact
                    </Button>

                    {/* Action Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {data.whatsapp_number && (
                            <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                                onClick={() => window.open(`https://wa.me/${data.whatsapp_number}`, '_blank')}
                            >
                                <span className="p-2 bg-green-100 rounded-full text-green-600"><WhatsAppIcon /></span>
                                <span>WhatsApp</span>
                            </Button>
                        )}

                        {data.phone_number && (
                            <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                onClick={() => window.open(`tel:${data.phone_number}`)}
                            >
                                <span className="p-2 bg-blue-100 rounded-full text-blue-600"><Phone className="w-5 h-5" /></span>
                                <span>Call Now</span>
                            </Button>
                        )}

                        {data.email && (
                            <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors"
                                onClick={() => window.open(`mailto:${data.email}`)}
                            >
                                <span className="p-2 bg-purple-100 rounded-full text-purple-600"><Mail className="w-5 h-5" /></span>
                                <span>Email Us</span>
                            </Button>
                        )}

                        {data.website_url && (
                            <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                                onClick={() => window.open(data.website_url, '_blank')}
                            >
                                <span className="p-2 bg-orange-100 rounded-full text-orange-600"><Globe className="w-5 h-5" /></span>
                                <span>Visit Site</span>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Connect;
