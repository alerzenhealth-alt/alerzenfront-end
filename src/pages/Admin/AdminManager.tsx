import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, UserPlus, Trash2 } from "lucide-react";

export default function AdminManager() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchAdmins();
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const fetchAdmins = async () => {
        // Current user can only see themselves if RLS is strict, or all if is_super_admin policy exists.
        // Ideally we fetch from 'admin_profiles'.
        const { data, error } = await supabase.from('admin_profiles').select('*');
        if (error) {
            console.error("Error fetching admins:", error);
        } else {
            setAdmins(data || []);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Creates user in Supabase Auth (requires service role or public signUp if open)
        // Since we are client-side, we use signUp. If "Enable Email Confirmations" is ON, they need to verify.
        const { data, error } = await supabase.auth.signUp({
            email: newEmail,
            password: newPassword,
        });

        if (error) {
            toast.error("Failed to create admin: " + error.message);
        } else {
            toast.success("Admin created! Check email for verification link.");
            // Manually add to profile if trigger didn't fire (just in case)
            if (data.user) {
                await supabase.from('admin_profiles').insert([{ id: data.user.id, email: newEmail }]);
                fetchAdmins();
            }
            setNewEmail("");
            setNewPassword("");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-6 w-6 text-primary" />
                        Create New Admin
                    </CardTitle>
                    <CardDescription>Add another administrator account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Admin Account"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-green-600" />
                        Admin List
                    </CardTitle>
                    <CardDescription>Manage existing administrators.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {admins.map((admin) => (
                            <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">{admin.email}</p>
                                    <p className="text-sm text-gray-500">ID: {admin.id}</p>
                                    {admin.two_factor_secret ? (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">2FA Enabled</span>
                                    ) : (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">2FA Pending</span>
                                    )}
                                </div>
                                {currentUser?.id !== admin.id && (
                                    <Button variant="destructive" size="sm" onClick={() => toast.error("Deletion not implemented for safety")}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
