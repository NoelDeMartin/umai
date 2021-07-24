let prompts: Record<string, string>;

export function patchWindow(window: Window): void {
    window.prompt = (question, defaultAnswer) => prompts[question ?? ''] ?? defaultAnswer ?? null;
}

export default {

    prepareAnswer(question: string, answer: string): void {
        prompts[question] = answer;
    },

    resetPrompts(): void {
        prompts = {};
    },

};
