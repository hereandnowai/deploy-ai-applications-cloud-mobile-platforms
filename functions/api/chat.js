export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { message, systemPrompt, model, stream } = body;

    const apiKey = env.GEMINI_API_KEY;
    const modelName = "gemma-3-27b-it";

    const endpoint = stream ? "streamGenerateContent?alt=sse" : "generateContent";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:${endpoint}&key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt + "\n\nUser: " + message }
                        ]
                    }
                ]
            }),
        });

        if (stream) {
            return new Response(response.body, {
                headers: { 
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive"
                },
            });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
