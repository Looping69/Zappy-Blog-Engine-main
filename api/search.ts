import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getJson } from 'serpapi';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Configuration
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all for now, or restrict to frontend domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { q } = req.query;
    const apiKey = process.env.VITE_SERP_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    if (!q) {
        return res.status(400).json({ error: 'Missing query parameter' });
    }

    try {
        // Wrap SerpApi callback in a promise
        const data = await new Promise((resolve, reject) => {
            getJson({
                engine: 'google',
                q: q as string,
                api_key: apiKey
            }, (json) => {
                if (json.error) reject(new Error(json.error));
                else resolve(json);
            });
        });

        res.status(200).json(data);
    } catch (error) {
        console.error('SerpApi Error:', error);
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
}
