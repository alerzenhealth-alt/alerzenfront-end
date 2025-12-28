import { useEffect, useRef, useState } from 'react';
import { getDocument } from '../utils/pdfWorker';
import Draggable from 'react-draggable';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PDFPreview = ({
    file,
    logo,
    logoScale = 1,
    watermarkType,
    watermarkContent,
    watermarkOpacity = 0.5,
    onPositionsChange
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [scale, setScale] = useState(1);
    const [pageNum, setPageNum] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
    const [renderError, setRenderError] = useState(null);

    // Track the active render task to cancel it if needed
    const renderTaskRef = useRef(null);

    // Refs for Draggable
    const logoNodeRef = useRef(null);
    const watermarkNodeRef = useRef(null);

    // Load PDF Document
    useEffect(() => {
        if (file) {
            const fileReader = new FileReader();
            fileReader.onload = async function () {
                const typedarray = new Uint8Array(this.result);
                try {
                    // Cancel any existing PDF loading/rendering? 
                    // Usually creating a new pdfDoc is fine, but we should reset state.
                    setPageNum(1);
                    setRenderError(null);

                    const loadedPdf = await getDocument(typedarray);
                    setPdfDoc(loadedPdf);
                    setNumPages(loadedPdf.numPages);
                } catch (error) {
                    console.error("Error loading PDF:", error);
                    setRenderError(`Failed to load PDF: ${error.message}`);
                }
            };
            fileReader.readAsArrayBuffer(file);
        }
    }, [file]);

    // Render Page
    useEffect(() => {
        if (pdfDoc) {
            renderPage(pageNum);
        }
        // Cleanup function to cancel render if component unmounts or deps change
        return () => {
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
        };
    }, [pdfDoc, pageNum, containerRef.current]);

    // Handle Window Resize
    useEffect(() => {
        const handleResize = () => {
            if (pdfDoc) renderPage(pageNum);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [pdfDoc, pageNum]);


    const renderPage = async (num) => {
        if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

        // Cancel previous render task if it exists
        if (renderTaskRef.current) {
            try {
                await renderTaskRef.current.cancel();
            } catch (err) {
                // Ignore cancellation errors
            }
        }

        try {
            const page = await pdfDoc.getPage(num);

            const containerWidth = containerRef.current.clientWidth - 40;
            const unscaledViewport = page.getViewport({ scale: 1 });
            const newScale = containerWidth / unscaledViewport.width;

            const finalScale = Math.min(newScale, 1.5) || 1;

            const viewport = page.getViewport({ scale: finalScale });
            setScale(finalScale);

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            setPageDimensions({ width: viewport.width, height: viewport.height });

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            // Store the render task
            const renderTask = page.render(renderContext);
            renderTaskRef.current = renderTask;

            await renderTask.promise;
            renderTaskRef.current = null; // Clear ref on success

        } catch (error) {
            if (error?.name === 'RenderingCancelledException') {
                // Expected behavior when switching pages quickly
                return;
            }
            console.error("Error rendering page:", error);
            setRenderError("Error rendering page.");
        }
    };

    const handleStop = (type, data) => {
        const x = data.x;
        const y = data.y;

        const normalized = {
            x: x / pageDimensions.width,
            y: y / pageDimensions.height,
        };

        onPositionsChange(type, normalized);
    };

    const changePage = (delta) => {
        const nextPage = pageNum + delta;
        if (nextPage >= 1 && nextPage <= numPages) {
            setPageNum(nextPage);
        }
    }

    return (
        <div className="pdf-preview-container" ref={containerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {renderError && <div className="error">{renderError}</div>}

            <div className="canvas-wrapper" style={{ position: 'relative', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                <canvas ref={canvasRef} key={pageNum} />

                {/* Overlay: Logo */}
                {logo && (
                    <Draggable
                        nodeRef={logoNodeRef}
                        bounds="parent"
                        onStop={(e, data) => handleStop('logo', data)}
                        key={logo}
                    >
                        <div
                            ref={logoNodeRef}
                            className="draggable-item logo-item"
                            style={{ position: 'absolute', top: 0, left: 0, cursor: 'move', zIndex: 10 }}
                        >
                            <img
                                src={logo}
                                alt="Logo"
                                style={{
                                    maxWidth: '200px',
                                    display: 'block',
                                    transform: `scale(${logoScale})`,
                                    transformOrigin: 'top left'
                                }}
                            />
                            <div className="drag-handle"></div>
                        </div>
                    </Draggable>
                )}

                {/* Overlay: Watermark */}
                {watermarkContent && (
                    <Draggable
                        nodeRef={watermarkNodeRef}
                        bounds="parent"
                        onStop={(e, data) => handleStop('watermark', data)}
                        key={watermarkType === 'text' ? watermarkContent : 'img-wm'}
                    >
                        <div
                            ref={watermarkNodeRef}
                            className="draggable-item watermark-item"
                            style={{
                                position: 'absolute',
                                top: '40%',
                                left: '30%',
                                cursor: 'move',
                                zIndex: 9,
                                opacity: watermarkOpacity,
                                pointerEvents: 'auto',
                                transform: watermarkType === 'text' ? 'rotate(-45deg)' : 'none'
                            }}>
                            {watermarkType === 'text' ? (
                                <span style={{
                                    fontSize: `${40 * scale}px`,
                                    fontWeight: 'bold',
                                    color: 'rgba(255, 0, 0)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {watermarkContent}
                                </span>
                            ) : (
                                <img
                                    src={watermarkContent}
                                    alt="Watermark"
                                    style={{ maxWidth: '300px', display: 'block' }}
                                />
                            )}
                        </div>
                    </Draggable>
                )}
            </div>

            {/* Pagination Controls */}
            {numPages > 1 && (
                <div className="pagination-controls glass" style={{
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    position: 'sticky',
                    bottom: '10px',
                    zIndex: 20
                }}>
                    <button
                        className="icon-btn"
                        onClick={() => changePage(-1)}
                        disabled={pageNum <= 1}
                        style={{ color: 'white' }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <span style={{ fontWeight: 'bold' }}>Page {pageNum} of {numPages}</span>
                    <button
                        className="icon-btn"
                        onClick={() => changePage(1)}
                        disabled={pageNum >= numPages}
                        style={{ color: 'white' }}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PDFPreview;
