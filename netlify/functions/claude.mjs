// Proxy between the quiz and the Claude API. The API key lives only here,
// in the ANTHROPIC_API_KEY environment variable set in Netlify.
// The model and token ceiling are fixed server side so the endpoint
// cannot be used to run arbitrary requests on our key.
// Netlify cuts a function call at about 30 seconds (measured: a 40 second
// request came back 504), so the quiz splits the paid analysis into three
// parallel requests of about 2000 tokens each. Keep every request well
// under 30 seconds.
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 4000;
const MAX_PROMPT_CHARS = 30000;

const client = new Anthropic();

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Use POST" });

  let body;
  try { body = await req.json(); } catch { body = {}; }
  const messages = Array.isArray(body.messages) ? body.messages : null;
  const valid =
    messages &&
    messages.length > 0 &&
    messages.length <= 4 &&
    messages.every(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string") &&
    messages.reduce((n, m) => n + m.content.length, 0) <= MAX_PROMPT_CHARS;
  if (!valid) return json(400, { error: "Invalid request" });

  const maxTokens = Math.min(Math.max(parseInt(body.max_tokens, 10) || 800, 1), MAX_TOKENS);

  try {
    const response = await client.messages.create({ model: MODEL, max_tokens: maxTokens, messages });
    return json(200, { content: response.content, stop_reason: response.stop_reason });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json(429, { error: "Busy, try again in a moment" });
    if (err instanceof Anthropic.APIError) {
      console.error("Claude API error", err.status, err.message);
      return json(502, { error: "Upstream error" });
    }
    console.error("Unexpected error", err);
    return json(500, { error: "Server error" });
  }
};

// Served at /api/claude, which is what the quiz calls.
export const config = { path: "/api/claude" };
