import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_URL = "https://apis.data.go.kr/1400119/InsectService";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, pageNo = "1", numOfRows = "10", insctPilbkNo } = await req.json();

    const apiKey = Deno.env.get("PUBLIC_DATA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "PUBLIC_DATA_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let url: URL;

    if (action === "detail" && insctPilbkNo) {
      // 곤충도감 상세정보 조회
      url = new URL(`${BASE_URL}/insectPilbkInfo`);
      url.searchParams.set("serviceKey", apiKey);
      url.searchParams.set("insctPilbkNo", insctPilbkNo);
    } else {
      // 곤충도감 목록 검색
      url = new URL(`${BASE_URL}/insectPilbkSearch`);
      url.searchParams.set("serviceKey", apiKey);
      url.searchParams.set("pageNo", String(pageNo));
      url.searchParams.set("numOfRows", String(numOfRows));
      if (query) {
        url.searchParams.set("reqSearchWrd", query);
      }
    }

    console.log("Fetching:", url.toString());

    const response = await fetch(url.toString());
    const text = await response.text();

    let data;
    try {
      // Try JSON first
      data = JSON.parse(text);
    } catch {
      // Try XML → extract error or wrap
      console.error("Non-JSON response:", text.slice(0, 500));
      // Check if it's an XML error from the API
      const codeMatch = text.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/);
      const msgMatch = text.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/);
      if (codeMatch) {
        return new Response(
          JSON.stringify({ error: msgMatch?.[1] || `API 오류 코드: ${codeMatch[1]}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "공공데이터 API에서 유효하지 않은 응답을 받았습니다." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("insect-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
