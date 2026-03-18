import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, insectName, mode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = mode === "detail"
      ? `너는 초등학생을 위한 곤충 백과사전 작가야. 주어진 곤충의 기본 분류 정보를 바탕으로, 아이들이 재미있게 읽을 수 있는 상세한 곤충 설명을 작성해줘.

다음 항목을 포함해서 마크다운으로 작성해줘:
## 🦋 이 곤충은 누구?
일반적인 특징, 생김새 설명

## 🏠 어디에 살아?
서식지, 한국에서 볼 수 있는 곳

## 🍽️ 무엇을 먹어?
먹이, 식성

## 🌱 어떻게 자라?
생활사 (알→유충→번데기→성충 등)

## ✨ 재미있는 사실
흥미로운 특징이나 재미있는 이야기

이모지를 적절히 사용하고, 초등학교 3~4학년이 이해할 수 있는 쉬운 말로 써줘. 정확한 과학 정보를 바탕으로 하되 재미있게 써줘.`
      : "너는 초등학생을 위한 곤충 도감 도우미야. 어려운 생물학 용어를 초등학교 3~4학년이 이해할 수 있는 쉬운 말로 바꿔줘. 이모지를 적절히 사용하고, 친근하고 재미있는 말투로 설명해줘. 핵심 정보는 빠뜨리지 마.";

    const userPrompt = mode === "detail"
      ? `다음 곤충에 대한 재미있는 백과사전 글을 작성해줘:\n\n${text}`
      : `다음은 "${insectName || "곤충"}"에 대한 과학적 설명이야. 초등학생이 이해할 수 있게 쉽게 풀어 설명해줘:\n\n${text}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 크레딧이 부족합니다." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI 변환 중 오류가 발생했습니다." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const simplified = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ simplified }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("simplify-text error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
