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
    const { query, pageNo = 1, numOfRows = 10 } = await req.json();

    const apiKey = Deno.env.get("PUBLIC_DATA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "PUBLIC_DATA_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(
      "http://apis.data.go.kr/1400119/NationalSpeciesInformationService/species/search"
    );
    url.searchParams.set("serviceKey", apiKey);
    url.searchParams.set("sw_nm", query);
    url.searchParams.set("pageNo", String(pageNo));
    url.searchParams.set("numOfRows", String(numOfRows));
    url.searchParams.set("type", "json");
    url.searchParams.set("st", "4"); // 곤충

    console.log("Fetching:", url.toString());

    const response = await fetch(url.toString());
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Non-JSON response:", text.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "공공데이터 API에서 유효하지 않은 응답을 받았습니다.", raw: text.slice(0, 200) }),
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
