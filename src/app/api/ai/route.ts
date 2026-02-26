import { NextRequest } from "next/server";
import {
  PremiumFeatureType,
  buildPrompt,
  SYSTEM_PROMPT,
} from "@/lib/ai";
import { getCenterById } from "@/lib/centers";

/**
 * POST /api/ai
 * Q헬퍼 AI 스트리밍 엔드포인트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, query, centerId } = body as {
      type: PremiumFeatureType;
      query: string;
      centerId?: string;
    };

    if (!type || !query) {
      return new Response(
        JSON.stringify({ error: "type과 query는 필수입니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const validTypes: PremiumFeatureType[] = [
      "intent_analysis",
      "custom_script",
      "cancellation_coaching",
      "complaint_draft",
      "complex_resolution",
    ];

    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: "지원하지 않는 기능입니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API 키가 설정되지 않았습니다." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const center = centerId ? getCenterById(centerId) : undefined;
    const userPrompt = buildPrompt(type, query, center);

    // Claude API 스트리밍 호출
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json().catch(() => ({}));
      console.error("Claude API error:", claudeResponse.status, errorData);
      return new Response(
        JSON.stringify({ error: `API 오류 (${claudeResponse.status})` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // SSE 스트림을 그대로 프록시
    const stream = new ReadableStream({
      async start(controller) {
        const reader = claudeResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);

                  // content_block_delta 이벤트에서 텍스트 추출
                  if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                    controller.enqueue(
                      new TextEncoder().encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`)
                    );
                  }

                  // 메시지 완료
                  if (parsed.type === "message_stop") {
                    controller.enqueue(
                      new TextEncoder().encode(`data: [DONE]\n\n`)
                    );
                  }
                } catch {
                  // JSON 파싱 실패 무시
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI API error:", error);
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
