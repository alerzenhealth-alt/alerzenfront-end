import { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Download, Type, X } from 'lucide-react';
import './PDFEditor.css';
import PDFPreview from './components/PDFPreview';
import ErrorBoundary from './components/ErrorBoundary';
import { generatePDF } from './utils/pdfProcessor';

// Components Placeholder
const PDFUploader = ({ onUpload }: { onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="uploader-container">
        <label className="upload-zone">
            <input type="file" accept=".pdf" onChange={onUpload} hidden />
            <Upload size={48} className="upload-icon" />
            <h3>Drop your PDF here</h3>
            <p>or click to browse</p>
        </label>
    </div>
);

const PDFEditor = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    // Logo State
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoScale, setLogoScale] = useState(1); // 0.5 to 2.0
    const [applyLogoToAll, setApplyLogoToAll] = useState(true);

    // Watermark State
    const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
    const [watermarkText, setWatermarkText] = useState("");
    const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
    const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);
    const [watermarkOpacity, setWatermarkOpacity] = useState(0.5); // 0.1 to 1.0

    const [isProcessing, setIsProcessing] = useState(false);
    // Initial positions
    const [positions, setPositions] = useState({ logo: { x: 0, y: 0 }, watermark: { x: 0, y: 0 } });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const watermarkInputRef = useRef<HTMLInputElement>(null);

    // Initialize Defaults
    useEffect(() => {
        const loadDefaults = async () => {
            try {
                // Load Default Logo
                const logoRes = await fetch('/assets/pdf-editor/default_logo.png');
                if (logoRes.ok) {
                    const logoBlob = await logoRes.blob();
                    const logoFile = new File([logoBlob], "default_logo.png", { type: "image/png" });
                    setLogoFile(logoFile);
                    setLogoUrl(URL.createObjectURL(logoFile));
                } else {
                    console.warn("Default logo not found");
                }

                // Load Default Watermark (Image)
                const wmRes = await fetch('/assets/pdf-editor/default_watermark.png');
                if (wmRes.ok) {
                    const wmBlob = await wmRes.blob();
                    const wmFile = new File([wmBlob], "default_watermark.png", { type: "image/png" });
                    setWatermarkFile(wmFile);
                    setWatermarkUrl(URL.createObjectURL(wmFile));
                    setWatermarkType('image'); // Only set type if successful
                }

                // Set default positions (optional tweaking)
                setPositions({
                    logo: { x: 0.05, y: 0.05 }, // Top Left with margin
                    watermark: { x: 0.35, y: 0.4 } // Center approx
                });

            } catch (e) {
                console.error("Failed to load default assets", e);
            }
        };

        loadDefaults();
    }, []);

    const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPdfFile(e.target.files[0]);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoUrl(URL.createObjectURL(file));
            // Reset position to default top-left or let user move
            setPositions(prev => ({ ...prev, logo: { x: 0, y: 0 } }));
        }
    };

    const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setWatermarkFile(file);
            setWatermarkUrl(URL.createObjectURL(file));
            setPositions(prev => ({ ...prev, watermark: { x: 0.3, y: 0.4 } })); // Reset to approx center
        }
    }

    const handlePositionsChange = (type: string, data: { x: number, y: number }) => {
        setPositions(prev => ({
            ...prev,
            [type]: data
        }));
    };

    const handleExport = async () => {
        console.log("handleExport started. pdfFile:", pdfFile);
        if (!pdfFile) {
            console.warn("No pdfFile found!");
            return;
        }
        setIsProcessing(true);
        try {
            // Pass all new options to generator
            const options = {
                logoScale,
                applyLogoToAll,
                watermarkType,
                watermarkOpacity
            };

            console.log("Calling generatePDF with options:", options);

            await generatePDF(
                pdfFile,
                logoFile,
                watermarkType === 'text' ? watermarkText : watermarkFile,
                positions,
                options
            );
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export PDF. Check console.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div id="pdf-editor-page">
            <div className="app-container">
                {/* Simple Header for inside the tool */}
                <header className="app-header">
                    <div className="logo-section">
                        <div className="logo-icon">PDF</div>
                        <h1>Document Editor</h1>
                    </div>
                    <div className="header-actions">
                        {pdfFile && (
                            <button className="icon-btn" onClick={() => {
                                if (confirm("Start over?")) setPdfFile(null);
                            }} title="Start Over">
                                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Reset</span>
                            </button>
                        )}
                    </div>
                </header>

                <main className="main-content">
                    {!pdfFile ? (
                        <div className="empty-state">
                            <div className="card upload-card">
                                <PDFUploader onUpload={handlePdfUpload} />
                            </div>
                        </div>
                    ) : (
                        <div className="editor-workspace">
                            <aside className="sidebar">
                                <h2>Tools</h2>
                                <div className="tool-group">
                                    {/* --- LOGO SECTION --- */}
                                    <div className="tool-control">
                                        <label className="tool-label">Logo Overlay</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            ref={logoInputRef}
                                            hidden
                                        />
                                        {!logoUrl ? (
                                            <button className="tool-btn" onClick={() => logoInputRef.current?.click()}>
                                                <ImageIcon size={20} /> Upload Logo
                                            </button>
                                        ) : (
                                            <>
                                                <div className="selected-file-preview">
                                                    <img src={logoUrl} alt="Logo Preview" className="preview-thumb" />
                                                    <button className="icon-btn" onClick={() => { setLogoFile(null); setLogoUrl(null); }}>
                                                        <X size={16} />
                                                    </button>
                                                </div>

                                                <div className="sub-controls">
                                                    <label className="sub-label">Size: {Math.round(logoScale * 100)}%</label>
                                                    <input
                                                        type="range"
                                                        min="0.2"
                                                        max="2.0"
                                                        step="0.1"
                                                        value={logoScale}
                                                        onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                                                        className="range-input"
                                                    />
                                                    <label className="checkbox-label">
                                                        <input
                                                            type="checkbox"
                                                            checked={applyLogoToAll}
                                                            onChange={(e) => setApplyLogoToAll(e.target.checked)}
                                                        />
                                                        Apply to all pages
                                                    </label>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* --- WATERMARK SECTION --- */}
                                    <div className="tool-control">
                                        <label className="tool-label">Watermark</label>

                                        <div className="toggle-group">
                                            <button
                                                className={`toggle-btn ${watermarkType === 'text' ? 'active' : ''}`}
                                                onClick={() => setWatermarkType('text')}
                                            >Text</button>
                                            <button
                                                className={`toggle-btn ${watermarkType === 'image' ? 'active' : ''}`}
                                                onClick={() => setWatermarkType('image')}
                                            >Image</button>
                                        </div>

                                        {watermarkType === 'text' ? (
                                            <div className="input-group">
                                                <Type size={20} className="input-icon" />
                                                <input
                                                    type="text"
                                                    placeholder="CONFIDENTIAL"
                                                    value={watermarkText}
                                                    onChange={(e) => setWatermarkText(e.target.value)}
                                                    className="text-input"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleWatermarkImageUpload}
                                                    ref={watermarkInputRef}
                                                    hidden
                                                />
                                                {!watermarkUrl ? (
                                                    <button className="tool-btn" onClick={() => watermarkInputRef.current?.click()}>
                                                        <ImageIcon size={20} /> Upload Watermark
                                                    </button>
                                                ) : (
                                                    <div className="selected-file-preview">
                                                        <img src={watermarkUrl} alt="Watermark Preview" className="preview-thumb" />
                                                        <button className="icon-btn" onClick={() => { setWatermarkFile(null); setWatermarkUrl(null); }}>
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <div className="sub-controls" style={{ marginTop: '1rem' }}>
                                            <label className="sub-label">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="1.0"
                                                step="0.1"
                                                value={watermarkOpacity}
                                                onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                                                className="range-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
                                    <button className="btn-primary flex-center" onClick={handleExport} disabled={isProcessing}>
                                        <Download size={18} style={{ marginRight: '8px' }} />
                                        {isProcessing ? 'Processing...' : 'Export PDF'}
                                    </button>
                                </div>
                            </aside>
                            <div className="preview-area">
                                <ErrorBoundary>
                                    <PDFPreview
                                        file={pdfFile}
                                        logo={logoUrl}
                                        logoScale={logoScale}
                                        watermarkType={watermarkType}
                                        watermarkContent={watermarkType === 'text' ? watermarkText : watermarkUrl}
                                        watermarkOpacity={watermarkOpacity}
                                        onPositionsChange={handlePositionsChange}
                                    />
                                </ErrorBoundary>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default PDFEditor;
