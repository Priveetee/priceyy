export const FREE_MODELS = {
  openai: ["openai/gpt-oss-20b:free"],
  anthropic: [
    "anthropic/claude-3-haiku:free",
    "deepseek/deepseek-r1-0528:free",
  ],
  google: [
    "google/gemini-2.0-flash-exp:free",
    "google/gemma-3-27b-it:free",
    "google/gemma-3-12b-it:free",
  ],
  meta: [
    "meta-llama/llama-4-maverick:free",
    "meta-llama/llama-4-scout:free",
    "meta-llama/llama-3.3-8b-instruct:free",
  ],
  mistral: [
    "mistralai/mistral-small-3.2-24b-instruct:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
  ],
  fallback: [
    "openrouter/polaris-alpha",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "alibaba/tongyi-deepresearch-30b-a3b:free",
    "deepseek/deepseek-chat-v3.1:free",
    "z-ai/glm-4.5-air:free",
    "qwen/qwen3-coder:free",
    "moonshotai/kimi-k2:free",
    "google/gemma-3n-e2b-it:free",
  ],
} as const;

export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  "openrouter/polaris-alpha": "Polaris Alpha",
  "nvidia/nemotron-nano-12b-v2-vl:free": "Nemotron Nano 12B",
  "alibaba/tongyi-deepresearch-30b-a3b:free": "Tongyi DeepResearch",
  "deepseek/deepseek-chat-v3.1:free": "DeepSeek V3.1",
  "openai/gpt-oss-20b:free": "GPT OSS 20B",
  "z-ai/glm-4.5-air:free": "GLM 4.5 Air",
  "qwen/qwen3-coder:free": "Qwen3 Coder",
  "moonshotai/kimi-k2:free": "Kimi K2",
  "google/gemma-3n-e2b-it:free": "Gemma 3N E2B",
  "mistralai/mistral-small-3.2-24b-instruct:free": "Mistral Small 3.2",
  "deepseek/deepseek-r1-0528:free": "DeepSeek R1",
  "meta-llama/llama-3.3-8b-instruct:free": "Llama 3.3 8B",
  "meta-llama/llama-4-maverick:free": "Llama 4 Maverick",
  "meta-llama/llama-4-scout:free": "Llama 4 Scout",
  "deepseek/deepseek-chat-v3-0324:free": "DeepSeek V3",
  "mistralai/mistral-small-3.1-24b-instruct:free": "Mistral Small 3.1",
  "google/gemma-3-12b-it:free": "Gemma 3 12B",
  "google/gemma-3-27b-it:free": "Gemma 3 27B",
  "google/gemini-2.0-flash-exp:free": "Gemini 2.0 Flash",
  "anthropic/claude-3-haiku:free": "Claude 3 Haiku",
};
