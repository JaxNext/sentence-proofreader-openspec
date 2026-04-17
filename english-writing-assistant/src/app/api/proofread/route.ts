import { NextRequest, NextResponse } from "next/server";
import { buildProofreadPrompt, parseProofreadResponse } from "@/lib/providers/prompt-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text field is required and must not be empty." },
        { status: 400 }
      );
    }

    const apiKey = process.env.LLM_API_KEY;
    const baseUrl = process.env.LLM_API_BASE_URL || "https://api.openai.com/v1";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Cloud API key is not configured. Please set LLM_API_KEY in .env.local." },
        { status: 500 }
      );
    }

    const prompt = buildProofreadPrompt(text);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("Cloud AI API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Cloud AI service error. Please try again later." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    const result = parseProofreadResponse(content, text);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Proofread API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
