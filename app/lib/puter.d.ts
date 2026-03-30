// Puter.js global type declarations
interface PuterAIChatResponse {
    text?: string;
    message?: {
        content: string;
    };
    toString(): string;
}

interface PuterAI {
    chat(
        prompt: string | Array<{ role: string; content: string }>,
        options?: {
            model?: string;
            stream?: boolean;
        }
    ): Promise<PuterAIChatResponse>;
}

interface Puter {
    ai: PuterAI;
    print(text: string): void;
}

interface Window {
    puter: Puter;
}

declare const puter: Puter;
