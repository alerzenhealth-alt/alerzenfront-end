import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { db } from './db.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/assets', express.static(path.join(__dirname, '../src/assets'))); // Serve assets for dev/preview if needed

// API Endpoints

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Secure login using environment variables
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (adminUser && adminPass && username === adminUser && password === adminPass) {
        res.json({ success: true, token: "admin-token-123" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Get All Tests
app.get('/api/tests', async (req, res) => {
    await db.read();
    res.json(db.data.tests);
});

// Add/Update Test (Protected)
app.post('/api/admin/tests', async (req, res) => {
    const test = req.body;
    await db.read();

    const index = db.data.tests.findIndex(t => t.id === test.id);
    if (index > -1) {
        db.data.tests[index] = test;
    } else {
        db.data.tests.push({ ...test, id: Date.now().toString() });
    }
    await db.write();
    res.json({ success: true, test });
});

// Delete Test
app.delete('/api/admin/tests/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();
    db.data.tests = db.data.tests.filter(t => t.id !== id);
    await db.write();
    res.json({ success: true });
});

// Promo Codes
app.get('/api/promo-codes', async (req, res) => {
    await db.read();
    res.json(db.data.promoCodes);
});

app.post('/api/admin/promo-codes', async (req, res) => {
    const promo = req.body;
    await db.read();
    db.data.promoCodes.push({ ...promo, id: Date.now().toString() });
    await db.write();
    res.json({ success: true });
});

import multer from 'multer';
import csv from 'csv-parser';

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Delete Test
app.delete('/api/admin/tests', async (req, res) => {
    const { id } = req.query;
    console.log(`Received delete request for ID: "${id}"`);
    if (!id) {
        return res.status(400).json({ success: false, message: "ID is required" });
    }
    await db.read();
    if (db.data.tests) {
        const initialLength = db.data.tests.length;
        db.data.tests = db.data.tests.filter(t => String(t.id) !== String(id));
        console.log(`Deleted test. Count before: ${initialLength}, after: ${db.data.tests.length}`);
        await db.write();
    }
    res.json({ success: true });
});

// Bulk Upload Tests (CSV)
app.post('/api/admin/upload-tests', upload.single('file'), async (req, res) => {
    console.log("Upload request received");
    if (!req.file) {
        console.error("No file received");
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    console.log("File received:", req.file);

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            console.log("Row data:", data);
            // Map CSV columns to Test object
            // Expected CSV headers: Name, Category, Price, OriginalPrice, Description
            if (data.Name && data.Price) {
                results.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    name: data.Name,
                    category: data.Category || "General",
                    price: parseFloat(data.Price),
                    original_price: data.OriginalPrice ? parseFloat(data.OriginalPrice) : undefined,
                    description: data.Description || "",
                    popular: false
                });
            } else {
                console.warn("Skipping invalid row:", data);
            }
        })
        .on('error', (error) => {
            console.error("CSV Parse Error:", error);
            res.status(500).json({ success: false, message: "Error parsing CSV" });
        })
        .on('end', async () => {
            console.log(`Parsed ${results.length} rows`);
            if (results.length > 0) {
                await db.read();
                // Append new tests to existing ones
                db.data.tests = [...db.data.tests, ...results];
                await db.write();
            }

            // Clean up uploaded file
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error("Error deleting temp file:", e);
            }

            res.json({ success: true, count: results.length, message: `Uploaded ${results.length} tests successfully` });
        });
});

app.get('/api/packages', async (req, res) => {
    await db.read();
    res.json(db.data.packages || []);
});

app.post('/api/admin/packages', async (req, res) => {
    const pkg = req.body;
    await db.read();

    if (!db.data.packages) db.data.packages = [];

    const index = db.data.packages.findIndex(p => p.id === pkg.id);
    if (index > -1) {
        db.data.packages[index] = pkg;
    } else {
        db.data.packages.push({ ...pkg, id: Date.now().toString() });
    }
    await db.write();
    res.json({ success: true, package: pkg });
});

app.delete('/api/admin/packages/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();
    if (db.data.packages) {
        db.data.packages = db.data.packages.filter(p => p.id !== id);
        await db.write();
    }
    res.json({ success: true });
});

// Promo Codes
app.get('/api/admin/promocodes', async (req, res) => {
    await db.read();
    res.json(db.data.promocodes || []);
});

app.post('/api/admin/promocodes', async (req, res) => {
    const { code, discountType, discountValue, expiryDate, usageLimit } = req.body;
    await db.read();
    if (!db.data.promocodes) db.data.promocodes = [];

    // Check if code exists
    if (db.data.promocodes.some(p => p.code === code)) {
        return res.status(400).json({ success: false, message: "Promo code already exists" });
    }

    const newPromo = {
        id: Date.now().toString(),
        code,
        discountType,
        discountValue,
        expiryDate,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        usageCount: 0,
        active: true
    };
    db.data.promocodes.push(newPromo);
    await db.write();
    res.json({ success: true, promo: newPromo });
});

app.delete('/api/admin/promocodes/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();
    if (db.data.promocodes) {
        db.data.promocodes = db.data.promocodes.filter(p => p.id !== id);
        await db.write();
    }
    res.json({ success: true });
});

app.post('/api/verify-promocode', async (req, res) => {
    const { code } = req.body;
    await db.read();
    const promo = (db.data.promocodes || []).find(p => p.code === code && p.active);

    if (promo) {
        // Check Expiry
        if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
            return res.json({ success: false, message: "Promo code has expired" });
        }

        // Check Usage Limit
        if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
            return res.json({ success: false, message: "Promo code usage limit exceeded" });
        }

        res.json({ success: true, discountType: promo.discountType, discountValue: promo.discountValue });
    } else {
        res.json({ success: false, message: "Invalid or expired promo code" });
    }
});

// Slideshow (Placeholder for now)
app.get('/api/slides', async (req, res) => {
    await db.read();
    res.json(db.data.slides);
});



// Template Download
app.get('/api/admin/template', (req, res) => {
    const csvContent = "Name,Category,Price,OriginalPrice,Description\nComplete Blood Count,Basic,350,500,Comprehensive blood test";
    res.header('Content-Type', 'text/csv');
    res.attachment('tests_template.csv');
    res.send(csvContent);
});

app.get('*', (req, res) => {
    const indexPath = path.resolve(__dirname, '../dist/index.html');
    console.log("Serving:", indexPath);
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Index file not found");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
