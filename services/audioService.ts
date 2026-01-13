
export class AudioService {
    private apiKey: string = import.meta.env.VITE_OPENAI_API_KEY || '';

    async generatePodcast(text: string, voice: string = 'alloy'): Promise<string> {
        if (!this.apiKey) {
            console.warn('OPENAI_API_KEY not found. Returning mock audio URL.');
            return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        }

        try {
            const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: text.substring(0, 4000), // OpenAI limit is 4096
                    voice: voice
                })
            });

            if (!response.ok) {
                throw new Error(`TTS Error: ${response.statusText}`);
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error in TTS:', error);
            return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        }
    }
}

export const audioService = new AudioService();
