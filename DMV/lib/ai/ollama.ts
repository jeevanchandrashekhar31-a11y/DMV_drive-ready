const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL ?? "http://localhost:11434";
const MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL ?? "llama3.2";

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function ollamaChat(
  messages: OllamaMessage[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  let fullText = "";
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split("\n").filter(Boolean);

    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        const chunk = json.message?.content ?? "";
        fullText += chunk;
        onChunk?.(chunk);
      } catch {
        // Skip malformed stream lines.
      }
    }
  }

  return fullText;
}

export async function ollamaGenerate(
  prompt: string,
  systemPrompt?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const messages: OllamaMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  return ollamaChat(messages, onChunk);
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });

    return res.ok;
  } catch {
    return false;
  }
}
