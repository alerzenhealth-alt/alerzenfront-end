import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Gift, Copy, Check } from "lucide-react";

const ExitIntentPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);

    useEffect(() => {
        // Check if already seen in this session
        const hasSeen = sessionStorage.getItem("hasSeenExitPopup");
        if (hasSeen) return;

        // Desktop: Exit Intent (Mouse leaves window)
        const onMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                triggerPopup();
            }
        };

        // Mobile: Timeout (15 seconds)
        const timer = setTimeout(() => {
            triggerPopup();
        }, 15000);

        document.addEventListener("mouseleave", onMouseLeave);

        return () => {
            document.removeEventListener("mouseleave", onMouseLeave);
            clearTimeout(timer);
        };
    }, []);

    const triggerPopup = () => {
        const hasSeen = sessionStorage.getItem("hasSeenExitPopup");
        if (!hasSeen) {
            setIsOpen(true);
            sessionStorage.setItem("hasSeenExitPopup", "true");
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText("HEALTH10");
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0 overflow-hidden">
                <div className="bg-white m-4 rounded-3xl shadow-2xl overflow-hidden relative border border-white/20">
                    {/* Decorative Background */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary to-primary/80 z-0"></div>
                    <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-20 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative z-10 pt-8 pb-6 px-6 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                            <Gift className="w-8 h-8 text-primary" />
                        </div>

                        <DialogHeader className="mb-2">
                            <DialogTitle className="text-2xl font-black text-white text-center">Wait! Don't Miss Out</DialogTitle>
                            <DialogDescription className="text-white/90 text-center font-medium">
                                Get an extra <span className="text-yellow-300 font-bold text-lg">10% OFF</span> on your first health checkup.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="bg-white rounded-2xl p-6 mt-6 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-2 font-semibold uppercase tracking-wider">Use Coupon Code</p>
                            <div
                                className="flex items-center justify-between bg-gray-50 border-2 border-dashed border-primary/30 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition-colors group"
                                onClick={handleCopyCode}
                            >
                                <span className="text-xl font-black text-primary tracking-widest pl-2">HEALTH10</span>
                                <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-2 min-w-[40px] flex justify-center">
                                    {hasCopied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-400 group-hover:text-primary" />}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-3">*Valid for today only. Limited slots available.</p>
                        </div>

                        <DialogFooter className="mt-6 sm:justify-center">
                            <Button
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl text-lg shadow-lg shadow-primary/30 animate-pulse"
                                onClick={handleClose}
                            >
                                Grab My Discount
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ExitIntentPopup;
