
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Configuration
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const databaseUrl = process.env.NEON_DATABASE_URL;
    if (!databaseUrl) {
        return res.status(500).json({ error: 'Database configuration missing' });
    }

    const sql = neon(databaseUrl);

    if (req.method === 'POST') {
        const { keyword, title, content, tokens } = req.body;
        try {
            // First ensure table exists (idempotent)
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

            const result = await sql`
                INSERT INTO blogs (keyword, title, content, tokens)
                VALUES (${keyword}, ${title}, ${content}, ${tokens})
                RETURNING id
            `;
            return res.status(200).json({ id: result[0].id, status: 'success' });
        } catch (error) {
            console.error('Database Error:', error);
            return res.status(500).json({ error: 'Database save failed' });
        }
    }

    if (req.method === 'GET') {
        try {
            const blogs = await sql`
                SELECT id, keyword, title, content, tokens, created_at
                FROM blogs
                ORDER BY created_at DESC
            `;
            return res.status(200).json({ blogs });
        } catch (error) {
            console.error('Database Error:', error);
            return res.status(500).json({ error: 'Database fetch failed' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
