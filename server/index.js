
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: '../.env' });

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Initialize Neon client
// We use the variable name provided by the user in .env
const sql = neon(process.env.NEON_DATABASE_URL || '');

// Ensure table exists on startup
const initDb = async () => {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS blogs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                keyword TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tokens INTEGER NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('✅ Neon Database Initialized');
    } catch (err) {
        console.error('❌ Failed to initialize DB:', err);
    }
};

initDb();

// Save blog endpoint
app.post('/api/blogs', async (req, res) => {
    const { keyword, title, content, tokens } = req.body;
    try {
        const result = await sql`
            INSERT INTO blogs (keyword, title, content, tokens)
            VALUES (${keyword}, ${title}, ${content}, ${tokens})
            RETURNING id
        `;
        res.json({ id: result[0].id, status: 'success' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database save failed' });
    }
});

// List blogs endpoint
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await sql`
            SELECT id, keyword, title, content, tokens, created_at
            FROM blogs
            ORDER BY created_at DESC
        `;
        res.json({ blogs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database fetch failed' });
    }
});

// SerpApi Proxy Endpoint
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ error: 'Query parameter required' });
    }

    const apiKey = process.env.VITE_SERP_API_KEY;
    if (!apiKey) {
        console.error('❌ SerpApi Key missing on backend');
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    try {
        const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${apiKey}`;
        const response = await fetch(serpUrl);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('❌ SerpApi Proxy Error:', err);
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Zappy Backend running at http://localhost:${port}`);
});
