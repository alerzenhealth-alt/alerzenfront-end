import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState("");
    const [require2fa, setRequire2fa] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body = { username, password } as any;
            if (token) body.token = token;

            const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("adminToken", data.token);
                if (data.warning) {
                    toast.warning(data.warning);
                } else {
                    toast.success("Login successful");
                }
                navigate("/admin/dashboard");
            } else if (data.require2fa) {
                setRequire2fa(true);
                toast.info("Please enter your 2FA code");
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (error) {
            toast.error("Login failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                disabled={require2fa}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                disabled={require2fa}
                            />
                        </div>

                        {require2fa && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                                <label className="text-sm font-medium text-blue-600">2FA Code</label>
                                <Input
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    autoFocus
                                />
                            </div>
                        )}

                        <Button type="submit" className="w-full">
                            {require2fa ? "Verify & Login" : "Login"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;
