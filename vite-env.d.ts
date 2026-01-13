/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_SERP_API_KEY: string
    readonly VITE_AIRTABLE_API_KEY: string
    readonly VITE_AIRTABLE_BASE_ID: string
    readonly VITE_AIRTABLE_TABLE_NAME: string
    readonly VITE_SANITY_PROJECT_ID: string
    readonly VITE_SANITY_DATASET: string
    readonly VITE_SANITY_TOKEN: string

    // LLM Keys
    readonly VITE_ANTHROPIC_API_KEY: string
    readonly VITE_OPENAI_API_KEY: string
    readonly VITE_PERPLEXITY_API_KEY: string
    readonly VITE_NANO_BANANA_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
