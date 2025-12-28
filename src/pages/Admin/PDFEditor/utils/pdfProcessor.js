import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

export const generatePDF = async (pdfFile, logoFile, watermarkContent, positions, options = {}) => {
    console.log("generatePDF called with:", { pdfFile, logoFile, watermarkContent, positions, options });
    try {
        const {
            logoScale = 1,
            applyLogoToAll = true,
            watermarkType = 'text',
            watermarkOpacity = 0.5
        } = options;

        // 1. Load the PDF
        console.log("Loading PDF...");
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        console.log("PDF Loaded, pages:", pages.length);

        // 2. Embed the Logo if present
        let logoImage = null;
        if (logoFile) {
            console.log("Embedding Logo:", logoFile.name, logoFile.type);
            const logoBytes = await logoFile.arrayBuffer();
            if (logoFile.type === 'image/png') {
                logoImage = await pdfDoc.embedPng(logoBytes);
            } else if (logoFile.type === 'image/jpeg' || logoFile.type === 'image/jpg') {
                logoImage = await pdfDoc.embedJpg(logoBytes);
            } else {
                console.warn("Unsupported logo type:", logoFile.type);
            }
            console.log("Logo embedded");
        }

        // Embed Watermark Image if present and type is image
        let wmImage = null;
        if (watermarkType === 'image' && watermarkContent) {
            console.log("Embedding Watermark:", watermarkContent.name, watermarkContent.type);
            // Verify it is a File or Blob
            if (watermarkContent instanceof Blob) {
                const wmBytes = await watermarkContent.arrayBuffer();
                if (watermarkContent.type === 'image/png') {
                    wmImage = await pdfDoc.embedPng(wmBytes);
                } else if (watermarkContent.type === 'image/jpeg' || watermarkContent.type === 'image/jpg') {
                    wmImage = await pdfDoc.embedJpg(wmBytes);
                } else {
                    console.warn("Unsupported watermark type:", watermarkContent.type);
                }
                console.log("Watermark embedded");
            } else {
                console.warn("Watermark content is not a File/Blob:", typeof watermarkContent);
            }
        }

        // 3. Process pages
        console.log("Processing pages...");
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();

            // --- Apply Logo ---
            if (logoImage && (applyLogoToAll || i === 0)) {
                const logoWidth = width * (0.20 * logoScale);
                const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
                const x = positions.logo.x * width;
                const y = height - (positions.logo.y * height) - logoHeight;

                page.drawImage(logoImage, {
                    x: x,
                    y: y,
                    width: logoWidth,
                    height: logoHeight,
                });
            }

            // --- Apply Watermark ---
            if (watermarkContent) {
                const x = positions.watermark.x * width;
                const y = height - (positions.watermark.y * height);

                if (watermarkType === 'text') {
                    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
                    const textSize = width * 0.05;

                    page.drawText(String(watermarkContent), {
                        x: x,
                        y: y,
                        size: textSize,
                        font: font,
                        color: rgb(1, 0, 0),
                        opacity: watermarkOpacity,
                        rotate: degrees(-45),
                    });
                } else if (watermarkType === 'image' && wmImage) {
                    const wmWidth = width * 0.30;
                    const wmHeight = (wmImage.height / wmImage.width) * wmWidth;
                    const adjustedY = height - (positions.watermark.y * height) - wmHeight;

                    page.drawImage(wmImage, {
                        x: x,
                        y: adjustedY,
                        width: wmWidth,
                        height: wmHeight,
                        opacity: watermarkOpacity
                    });
                }
            }
        }

        // 4. Output Handling
        console.log("Saving PDF...");
        const modifiedPdfBytes = await pdfDoc.save();
        console.log("PDF Saved, size:", modifiedPdfBytes.length);

        if (options.returnBytes) {
            return modifiedPdfBytes;
        }

        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

        let outputName = `processed_${pdfFile.name}`;
        if (!outputName.toLowerCase().endsWith('.pdf')) {
            outputName += '.pdf';
        }

        saveAs(blob, outputName);
        console.log("Download triggered with file-saver for:", outputName);

    } catch (error) {
        console.error("PDF Generation Error", error);
        throw error;
    }
};
