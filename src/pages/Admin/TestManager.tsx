import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Plus, Edit, Trash, Download, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Test {
    id: string;
    name: string;
    category: string;
    price: number;
    original_price?: number;
    description?: string;
}

const TestManager = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit/Add State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTest, setCurrentTest] = useState<Partial<Test>>({});

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const uniqueCategories = ["All", ...new Set(tests.map(t => t.category))];

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || test.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTests(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch tests");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const validTests = results.data
                        .filter((row: any) => row.Name && row.Price)
                        .map((row: any) => ({
                            name: row.Name,
                            category: row.Category || row.department || "General", // Handle different CSV headers
                            price: parseFloat(row.Price || row['MRP TO SHOW'] || 0),
                            original_price: row.OriginalPrice || row['TO SCRATCH'] ? parseFloat((row.OriginalPrice || row['TO SCRATCH']).replace(/[₹,]/g, '')) : null,
                            description: row.Description || row['REQUIRED SAMPLE'] || "",
                            popular: false,
                            // Note: We let Supabase generate the ID to ensure UUID compatibility
                        }));

                    if (validTests.length === 0) {
                        toast.error("No valid tests found in CSV");
                        setIsUploading(false);
                        return;
                    }

                    const { error } = await supabase
                        .from('tests')
                        .insert(validTests);

                    if (error) throw error;

                    toast.success(`Uploaded ${validTests.length} tests successfully`);
                    fetchTests();
                } catch (error: any) {
                    console.error("Upload error:", error);
                    toast.error(error.message || "Upload failed");
                } finally {
                    setIsUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                }
            },
            error: (error) => {
                console.error("CSV Parse error:", error);
                toast.error("Failed to parse CSV file");
                setIsUploading(false);
            }
        });
    };

    const handleSaveTest = async () => {
        try {
            const testPayload = {
                name: currentTest.name,
                category: currentTest.category,
                price: currentTest.price,
                originalPrice: currentTest.original_price, // Mapping original_price to originalPrice db column
                description: currentTest.description
            };

            if (currentTest.id) {
                // Update
                const { error } = await supabase
                    .from('tests')
                    .update(testPayload)
                    .eq('id', currentTest.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('tests')
                    .insert([testPayload]);
                if (error) throw error;
            }

            toast.success("Test saved successfully");
            setIsDialogOpen(false);
            fetchTests();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save test");
        }
    };

    const handleDeleteTest = async (id: string) => {
        if (!confirm("Are you sure you want to delete this test?")) return;
        try {
            const { error } = await supabase
                .from('tests')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success("Test deleted");
            fetchTests();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete test");
        }
    };

    const downloadTemplate = () => {
        window.open("/api/admin/template", "_blank");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Test Management</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadTemplate}>
                        <Download className="w-4 h-4 mr-2" /> Template
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".csv"
                            className="hidden"
                        />
                        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploading ? "Uploading..." : "Bulk Upload CSV"}
                        </Button>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setCurrentTest({})}>
                                <Plus className="w-4 h-4 mr-2" /> Add Test
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{currentTest.id ? "Edit Test" : "Add New Test"}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Test Name</Label>
                                    <Input
                                        value={currentTest.name || ""}
                                        onChange={(e) => setCurrentTest({ ...currentTest, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input
                                        value={currentTest.category || ""}
                                        onChange={(e) => setCurrentTest({ ...currentTest, category: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Selling Price (₹)</Label>
                                        <Input
                                            type="number"
                                            value={currentTest.price || ""}
                                            onChange={(e) => setCurrentTest({ ...currentTest, price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Original Price (₹)</Label>
                                        <Input
                                            type="number"
                                            placeholder="Optional"
                                            value={currentTest.original_price || ""}
                                            onChange={(e) => setCurrentTest({ ...currentTest, original_price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={currentTest.description || ""}
                                        onChange={(e) => setCurrentTest({ ...currentTest, description: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleSaveTest} className="w-full">Save Test</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Original Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTests.map((test) => (
                                <TableRow key={test.id}>
                                    <TableCell className="font-medium">{test.name}</TableCell>
                                    <TableCell>{test.category}</TableCell>
                                    <TableCell>₹{test.price}</TableCell>
                                    <TableCell className="text-muted-foreground line-through">
                                        {test.original_price ? `₹${test.original_price}` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setCurrentTest(test);
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => handleDeleteTest(test.id)}
                                        >
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default TestManager;
