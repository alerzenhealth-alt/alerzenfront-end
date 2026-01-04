import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { QrCode, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function TwoFactorSetup() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [setupComplete, setSetupComplete] = useState(false);

    const fetchQR = async () => {
        setLoading(true);
        // Call our backend API to generate the secret
        // Note: We need the session token
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
            toast.error("Please log in first (No Session)");
            setLoading(false);
            return;
        }

        const session = data.session;

        try {
            const res = await fetch('http://localhost:3000/api/2fa/setup', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setQrCode(data.qr_code);
                setSecret(data.secret);
            } else {
                toast.error("Failed to generate QR: " + data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Connection error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-6 w-6 text-primary" />
                    Two-Factor Authentication Setup
                </CardTitle>
                <CardDescription>Protect your admin account with Google Authenticator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!qrCode && !setupComplete && (
                    <div className="text-center">
                        <p className="mb-4">Click below to generate a new QR Code. This will invalidate any old 2FA codes.</p>
                        <Button onClick={fetchQR} disabled={loading}>
                            {loading ? "Generating..." : "Generate QR Code"}
                        </Button>
                    </div>
                )}

                {qrCode && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                        <div className="text-center">
                            <p className="font-mono bg-gray-100 p-2 rounded text-sm mb-2">{secret}</p>
                            <p className="text-sm text-gray-500">Scan this with your Google Authenticator App.</p>
                        </div>
                        <Button variant="outline" onClick={() => {
                            setQrCode(null);
                            setSetupComplete(true);
                            toast.success("2FA Setup Complete! Please re-login to test.");
                        }}>
                            I have scanned it
                        </Button>
                    </div>
                )}

                {setupComplete && (
                    <div className="flex flex-col items-center text-center text-green-600 space-y-2">
                        <CheckCircle2 className="h-12 w-12" />
                        <p className="font-medium">2FA Configured!</p>
                        <p className="text-sm text-gray-500">You will be asked for a code next time you log in.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
