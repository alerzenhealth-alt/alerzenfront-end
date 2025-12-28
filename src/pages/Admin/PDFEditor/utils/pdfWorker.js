import * as pdfjsLib from 'pdfjs-dist';

// Use a CDN for the worker to avoid build-time bundling issues with Vite
// This is the most stable approach for React + Vite + PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const getDocument = (src) => {
    return pdfjsLib.getDocument(src).promise;
};
