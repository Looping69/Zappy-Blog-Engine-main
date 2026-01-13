
import { SERPData, PAAQuestion, KeywordMetrics } from '../types';

export class SearchService {
    private apiKey: string = import.meta.env.VITE_SERP_API_KEY || '';

    async fetchPAAQuestions(keyword: string): Promise<PAAQuestion[]> {
        if (!this.apiKey) {
            console.warn('VITE_SERP_API_KEY not found. Using mock PAA data.');
            return this.getMockPAA(keyword);
        }

        try {
            // Use local backend proxy to avoid CORS
            const response = await fetch(`http://localhost:4000/api/search?q=${encodeURIComponent(keyword)}`);
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            return (data.related_questions || []).map((q: any) => ({
                question: q.question,
                snippet: q.snippet,
                sourceTitle: q.title,
                sourceLink: q.link
            }));
        } catch (error) {
            console.error('Error fetching PAA:', error);
            // Fallback to mock data if proxy fails
            return this.getMockPAA(keyword);
        }
    }

    async fetchOrganicResults(keyword: string): Promise<string> {
        if (!this.apiKey) return "No search data available (Dev Mode)";

        try {
            // Use local backend proxy to avoid CORS
            const response = await fetch(`http://localhost:4000/api/search?q=${encodeURIComponent(keyword)}`);
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            const sources = (data.organic_results || []).slice(0, 5).map((r: any) => (
                `Title: ${r.title}\nSource: ${r.link}\nSnippet: ${r.snippet}\n`
            )).join('\n---\n');

            return sources || "No organic competitive data found.";
        } catch (error) {
            console.error('Error fetching Organic Results:', error);
            return "Search retrieval failed.";
        }
    }

    async fetchKeywordMetrics(keyword: string): Promise<KeywordMetrics> {
        // Simulating metrics as they usually require a separate SEO API (Ahrefs/Semrush)
        // But we can approximate volume from Serp's result count
        return {
            volume: 1200,
            cpc: 2.45,
            competition: 0.65
        };
    }

    async getFullIntelligence(keyword: string): Promise<{ paa: PAAQuestion[], organic: string, metrics: KeywordMetrics }> {
        const [paa, organic, metrics] = await Promise.all([
            this.fetchPAAQuestions(keyword),
            this.fetchOrganicResults(keyword),
            this.fetchKeywordMetrics(keyword)
        ]);

        return { paa, organic, metrics };
    }

    async getPAAAndMetrics(keyword: string): Promise<SERPData> {
        const [questions, metrics] = await Promise.all([
            this.fetchPAAQuestions(keyword),
            this.fetchKeywordMetrics(keyword)
        ]);

        return {
            questions,
            keywordMetrics: metrics
        };
    }

    private getMockPAA(keyword: string): PAAQuestion[] {
        return [
            {
                question: `What are the benefits of ${keyword}?`,
                snippet: `The benefits of ${keyword} include improved performance and efficiency.`,
                sourceTitle: "Health Benefits Overview",
                sourceLink: "https://example.com/benefits"
            },
            {
                question: `Is ${keyword} safe for long-term use?`,
                snippet: `Long-term studies on ${keyword} show a high safety profile when used as directed.`,
                sourceTitle: "Safety Study 2024",
                sourceLink: "https://example.com/safety"
            },
            {
                question: `How does ${keyword} compare to traditional methods?`,
                snippet: `${keyword} offers a more streamlined approach compared to traditional techniques.`,
                sourceTitle: "Comparative Analysis",
                sourceLink: "https://example.com/comparison"
            }
        ];
    }
}

export const searchService = new SearchService();
