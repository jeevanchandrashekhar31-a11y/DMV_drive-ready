const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL ?? "http://localhost:11434";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!response.ok) {
      return Response.json(
        { error: `Ollama error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return Response.json(
      { error: "Unable to connect to Ollama. Make sure ollama serve is running." },
      { status: 503 }
    );
  }
}
