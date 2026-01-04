import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { db } from './db.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import multer from 'multer';
import csv from 'csv-parser';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
// Security Middleware (Supabase JWT)
const isAuthenticated = async (req, res, next) => {
    if (req.path === '/api/login') return next();

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.replace('Bearer ', '');

    // Verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    req.user = user;
    next();
};

app.use(cors());
app.use(bodyParser.json());

// Apply Auth Middleware to all /api/admin routes
app.use('/api/admin', isAuthenticated);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/assets', express.static(path.join(__dirname, '../src/assets'))); // Serve assets for dev/preview if needed

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// API Endpoints

// 1. 2FA Setup (Run this once to get QR Code)
app.get('/api/2fa/setup', async (req, res) => {
    // Ideally this should be protected or hidden. For initial setup, we allow it with a temporary password check if needed,
    // or just rely on console access. For simplicity here, we assume admin is setting it up.

    const secret = speakeasy.generateSecret({ name: "AlerzenHealth Admin" });

    // Save secret to DB (temporary storage for verify step, or permanent)
    // In a real app, verify first then save. Here we save to facilitate the flow.
    await db.read();
    db.data.admin.twoFactorSecret = secret.base32;
    await db.write();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
        if (err) return res.status(500).json({ success: false, message: "QR Gen Error" });
        res.json({ success: true, qr_code: data_url, secret: secret.base32, message: "Scan this QR with Google Authenticator" });
    });
});

// login
app.post('/api/login', async (req, res) => {
    const { username, password, token } = req.body;

    console.log(`[Login Attempt] User: ${username}`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
    });

    if (error) {
        console.error("[Login Error] Supabase Auth Failed:", error.message);
        return res.status(401).json({ success: false, message: error.message });
    }

    if (!data.user || !data.session) {
        console.error("[Login Error] No session returned. Email confirmed?");
        return res.status(401).json({ success: false, message: "Login successful but no session. Please confirm your email." });
    }

    const user = data.user;
    const session = data.session;

    // 2. Check 2FA
    const { data: profile, error: profileError } = await supabase
        .from('admin_profiles')
        .select('two_factor_secret')
        .eq('id', user.id)
        .single();

    // If table doesn't exist or error fetching profile, treat as "2FA Not Set Up"
    // This allows the first login to proceed
    if (profileError || !profile || !profile.two_factor_secret) {
        console.log(`[Login Success] 2FA not set up for ${username}`);
        return res.json({
            success: true,
            token: session.access_token,
            warning: "2FA not set up. Please visit the Admin Access tab to configure it."
        });
    }

    if (!token) {
        console.log(`[Login Challenge] 2FA Token required for ${username}`);
        return res.json({ success: false, require2fa: true, message: "2FA Code Required" });
    }

    const verified = speakeasy.totp.verify({
        secret: profile.two_factor_secret,
        encoding: 'base32',
        token: token
    });

    if (verified) {
        console.log(`[Login Success] 2FA Verified for ${username}`);
        res.json({ success: true, token: session.access_token });
    } else {
        console.warn(`[Login Fail] Invalid 2FA Token for ${username}`);
        res.status(401).json({ success: false, message: "Invalid 2FA Code" });
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

// Delete Test Query
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

// SPA Fallback: Serve index.html for any unknown route
app.use((req, res) => {
    // Determine the path to index.html
    const indexPath = path.join(__dirname, '../dist/index.html');

    // Log for debugging
    console.log(`[SPA Fallback] Request: ${req.url} -> Serving: ${indexPath}`);

    // Check if file exists to assume it's safe to send
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        console.error(`[SPA Fallback] Error: ${indexPath} not found!`);
        res.status(404).send("Application is building or index.html is missing.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
