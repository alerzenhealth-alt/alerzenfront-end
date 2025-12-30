import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Download, Copy, Trash, ExternalLink } from "lucide-react";
import { QRCode } from 'react-qrcode-logo';

interface QRCard {
    id: string;
    title: string;
    phone_number: string;
    whatsapp_number: string;
    email: string;
    website_url: string;
    qr_color: string;
    logo_url: string;
    created_at: string;
}

const QRGenerator = () => {
    const [cards, setCards] = useState<QRCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [phone, setPhone] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [color, setColor] = useState("#000000");
    const [logoUrl, setLogoUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('qr_cards')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setCards(data);
        } catch (error) {
            console.error("Error fetching cards:", error);
            // Don't show error toast on 404/missing table initially as user might not have run SQL yet
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!title) {
            toast.error("Please give your QR Code a title");
            return;
        }

        setCreating(true);
        try {
            const { data, error } = await supabase
                .from('qr_cards')
                .insert([{
                    title,
                    phone_number: phone,
                    whatsapp_number: whatsapp,
                    email,
                    website_url: website,
                    qr_color: color,
                    logo_url: logoUrl
                }])
                .select()
                .single();

            if (error) throw error;

            toast.success("QR Card created!");
            setCards([data, ...cards]);
            resetForm();
        } catch (error: any) {
            console.error("Create error:", error);
            toast.error(error.message || "Failed to create QR Card");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will break any printed QR codes!")) return;

        try {
            const { error } = await supabase
                .from('qr_cards')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCards(cards.filter(c => c.id !== id));
            toast.success("QR Card deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `qr-logo-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('package-images') // Reusing existing bucket
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('package-images')
                .getPublicUrl(filePath);

            setLogoUrl(data.publicUrl);
            toast.success("Logo uploaded!");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setPhone("");
        setWhatsapp("");
        setEmail("");
        setWebsite("");
        setColor("#000000");
        setLogoUrl("");
    };

    const downloadQR = (id: string, title: string) => {
        // This is a bit hacky but works for react-qrcode-logo
        const canvas = document.getElementById(`qr-canvas-${id}`) as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${title.replace(/\s+/g, '-')}-QR.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">QR Code Generator</h1>
                    <p className="text-muted-foreground">Create "Smart Business Cards" that link to dynamic landing pages.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Create New QR</CardTitle>
                        <CardDescription>Enter the contact details to display when scanned.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title (Internal Name)</Label>
                            <Input placeholder="e.g. Front Desk, Dr. Sharma" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input placeholder="+91..." value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>WhatsApp Number</Label>
                            <Input placeholder="+91..." value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input placeholder="hello@alerzen.com" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Website URL</Label>
                            <Input placeholder="https://alerzen.com" value={website} onChange={e => setWebsite(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>QR Color</Label>
                                <Input type="color" className="h-10 w-full p-1" value={color} onChange={e => setColor(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Center Logo</Label>
                                <div className="relative">
                                    <Input type="file" onChange={handleLogoUpload} disabled={uploading} className="text-xs" />
                                    {uploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="animate-spin w-4 h-4" /></div>}
                                </div>
                            </div>
                        </div>

                        {logoUrl && (
                            <div className="flex justify-center p-2 bg-gray-100 rounded">
                                <img src={logoUrl} alt="Logo Preview" className="h-12 object-contain" />
                            </div>
                        )}

                        <Button className="w-full" onClick={handleCreate} disabled={creating || uploading}>
                            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Generate QR Code
                        </Button>
                    </CardContent>
                </Card>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold">Your QR Codes</h2>
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : cards.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
                            No QR Codes created yet. Make one!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cards.map(card => {
                                const landingPageUrl = `${window.location.origin}/connect/${card.id}`;
                                return (
                                    <Card key={card.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col items-center space-y-4">
                                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                                    <QRCode
                                                        value={landingPageUrl}
                                                        size={150}
                                                        fgColor={card.qr_color}
                                                        logoImage={card.logo_url}
                                                        logoWidth={40}
                                                        logoHeight={40}
                                                        eyeRadius={5}
                                                        id={`qr-canvas-${card.id}`}
                                                    />
                                                </div>

                                                <div className="text-center w-full">
                                                    <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                                                    <p className="text-xs text-muted-foreground break-all mb-4">
                                                        {landingPageUrl}
                                                    </p>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => downloadQR(card.id, card.title)}>
                                                            <Download className="w-3 h-3 mr-2" />
                                                            Save PNG
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => window.open(landingPageUrl, '_blank')}>
                                                            <ExternalLink className="w-3 h-3 mr-2" />
                                                            Test Page
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="col-span-2 text-destructive hover:text-destructive/90" onClick={() => handleDelete(card.id)}>
                                                            <Trash className="w-3 h-3 mr-2" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRGenerator;
