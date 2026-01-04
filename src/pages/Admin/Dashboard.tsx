import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, TestTube, Package, Tag, Image, Settings, FileText, QrCode } from "lucide-react";
import { toast } from "sonner";
import TestManager from "./TestManager";
import PackageManager from "./PackageManager";
import PromoCodeManager from "./PromoCodeManager";
import SettingsManager from "./SettingsManager";
import PDFEditor from "./PDFEditor";
import QRGenerator from "./QRGenerator";
import AdminManager from "./AdminManager";
import TwoFactorSetup from "./TwoFactorSetup";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("tests");

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-8">
                    <LayoutDashboard className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
                </div>

                <nav className="flex-1 space-y-2">
                    <Button
                        variant={activeTab === "tests" ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => setActiveTab("tests")}
                    >
                        <TestTube className="w-4 h-4 mr-2" /> Tests & Prices
                    </Button>
                    <Button
                        variant={activeTab === "packages" ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => setActiveTab("packages")}
                    >
                        <Package className="w-4 h-4 mr-2" /> Health Packages
                    </Button>
                    <Button
                        variant={activeTab === "promos" ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => setActiveTab("promos")}
                    >
                        <Tag className="w-4 h-4 mr-2" /> Promo Codes
                    </Button>
                    <Button
                        variant={activeTab === "qr" ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => setActiveTab("qr")}
                    >
                        <QrCode className="w-4 h-4 mr-2" /> QR Generator
                    </Button>
                    <Button
                        variant={activeTab === "pdf" ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => setActiveTab("pdf")}
                    >
                        <FileText className="w-4 h-4 mr-2" /> PDF Tools
                    </Button>
                    <Button
                        variant={activeTab === "slides" ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => setActiveTab("slides")}
                    >
                        <Image className="w-4 h-4 mr-2" /> Slideshow
                    </Button>
                    <Button
                        variant={activeTab === "settings" ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => setActiveTab("settings")}
                    >
                        <Settings className="w-4 h-4 mr-2" /> Site Settings
                    </Button>
                    <Button
                        variant={activeTab === "admins" ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => setActiveTab("admins")}
                    >
                        <Users className="w-4 h-4 mr-2" /> Admin Access
                    </Button>
                </nav>

                <Button variant="outline" className="mt-auto flex items-center gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" /> Logout
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto h-screen">
                {activeTab === "tests" && <TestManager />}
                {activeTab === "packages" && <PackageManager />}
                {activeTab === "promos" && <PromoCodeManager />}
                {activeTab === "qr" && <QRGenerator />}
                {activeTab === "pdf" && <PDFEditor />}
                {activeTab === "slides" && <div className="text-center text-gray-500 mt-20">Slideshow Manager Coming Soon</div>}
                {activeTab === "settings" && <SettingsManager />}
                {activeTab === "admins" && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <AdminManager />
                        <TwoFactorSetup />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
