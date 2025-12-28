import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PromoCode {
    id: string;
    code: string;
    discountType: "percentage" | "flat";
    discountValue: number;
    active: boolean;
    expiryDate?: string;
    usageLimit?: number;
    usageCount?: number;
    min_order_value?: number;
}

const PromoCodeManager = () => {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [expiryDate, setExpiryDate] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [minOrderValue, setMinOrderValue] = useState<number>(0);

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const { data, error } = await supabase
                .from('promo_codes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            // Map items for UI
            const formattedPromos = data.map((p: any) => ({
                id: p.id,
                code: p.code,
                discountType: p.discountType,
                discountValue: p.discountValue,
                active: p.active,
                expiryDate: p.expiryDate,
                usageLimit: p.usageLimit,
                usageCount: p.usageCount,
                min_order_value: p.min_order_value
            }));
            setPromoCodes(formattedPromos);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch promo codes");
        }
    };

    const handleCreatePromo = async () => {
        if (!code || discountValue <= 0) {
            toast.error("Please enter a valid code and discount value");
            return;
        }

        try {
            const { error } = await supabase.from('promo_codes').insert([{
                code,
                "discountType": discountType,
                "discountValue": discountValue,
                "expiryDate": expiryDate || null,
                "usageLimit": usageLimit ? parseInt(usageLimit) : null,
                "min_order_value": minOrderValue || 0
            }]);

            if (error) throw error;

            toast.success("Promo code created");
            setIsCreating(false);
            setCode("");
            setDiscountValue(0);
            setExpiryDate("");
            setUsageLimit("");
            setMinOrderValue(0);
            fetchPromoCodes();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create promo code");
        }
    };

    const handleDeletePromo = async (id: string) => {
        if (!confirm("Delete this promo code?")) return;
        try {
            const { error } = await supabase.from('promo_codes').delete().eq('id', id);
            if (error) throw error;
            toast.success("Promo code deleted");
            fetchPromoCodes();
        } catch (error) {
            toast.error("Failed to delete promo code");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Promo Codes</h2>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Create Promo Code</>}
                </Button>
            </div>

            {isCreating && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>Create New Promo Code</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Code (e.g., SUMMER50)</Label>
                                <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE" />
                            </div>
                            <div className="space-y-2">
                                <Label>Discount Type</Label>
                                <Select value={discountType} onValueChange={(v: "percentage" | "flat") => setDiscountType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Value</Label>
                                <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Min Order Value (₹)</Label>
                                <Input type="number" value={minOrderValue} onChange={(e) => setMinOrderValue(parseFloat(e.target.value))} placeholder="0 for none" />
                            </div>
                            <div className="space-y-2">
                                <Label>Expiry Date</Label>
                                <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Usage Limit (Optional)</Label>
                                <Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="No limit" />
                            </div>
                        </div>
                        <Button onClick={handleCreatePromo} className="w-full">Create Promo Code</Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Min Order</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promoCodes.map(promo => (
                                <TableRow key={promo.id}>
                                    <TableCell className="font-bold flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-primary" />
                                        {promo.code}
                                    </TableCell>
                                    <TableCell>
                                        {promo.discountType === "percentage" ? `${promo.discountValue}%` : `₹${promo.discountValue}`} OFF
                                    </TableCell>
                                    <TableCell>
                                        {promo.min_order_value ? `₹${promo.min_order_value}` : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString() : "No Expiry"}
                                    </TableCell>
                                    <TableCell>
                                        {promo.usageLimit ? `${promo.usageCount || 0} / ${promo.usageLimit}` : "Unlimited"}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${promo.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {promo.active ? "Active" : "Inactive"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePromo(promo.id)}>
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {promoCodes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No promo codes found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default PromoCodeManager;
