
import { ImageGenConfig } from '../types';

export class ImageService {
    private apiKey: string = import.meta.env.VITE_NANO_BANANA_API_KEY || '';

    async generateImage(prompt: string, config?: Partial<ImageGenConfig>): Promise<string> {
        if (!this.apiKey) {
            console.warn('NANO_BANANA_API_KEY not found. Returning Nano Banana placeholder.');
            return `https://placehold.co/1024x1024/orange/white?text=Nano+Banana+${encodeURIComponent(prompt.substring(0, 30))}...`;
        }

        try {
            // Switched to Nano Banana AI endpoint
            const response = await fetch('https://api.nano-banana.ai/v1/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify({
                    prompt: `Nano Banana High-Res: ${prompt}`,
                    resolution: config?.size === '1024x1792' ? 'portrait' : 'square',
                    style: 'medical_high_fidelity'
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Nano Banana Generation Failed');
            }

            return data.image_url;
        } catch (error) {
            console.error('Error in Nano Banana service:', error);
            return `https://placehold.co/1024x1024/orange/white?text=Nano+Banana+Error`;
        }
    }
}

export const imageService = new ImageService();
