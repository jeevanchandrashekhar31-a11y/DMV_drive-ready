const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL ?? "http://localhost:11434";

export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      return Response.json(
        { error: `Ollama error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Unable to connect to Ollama. Make sure ollama serve is running." },
      { status: 503 }
    );
  }
}
