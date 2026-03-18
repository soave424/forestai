import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_URL = "https://apis.data.go.kr/1400119/InsectService";

// Simple XML to JSON parser using regex (no external deps)
function parseXmlToJson(xml: string): any {
  // Remove XML declaration
  xml = xml.replace(/<\?xml[^?]*\?>\s*/g, "");
  
  // Expand self-closing tags: <tag/> → <tag></tag>
  xml = xml.replace(/<(\w+)\s*\/>/g, "<$1></$1>");

  function parseNode(s: string): any {
    const obj: any = {};
    const tagRegex = /<(\w+)>([\s\S]*?)<\/\1>/g;
    let match;
    let found = false;

    while ((match = tagRegex.exec(s)) !== null) {
      found = true;
      const key = match[1];
      const inner = match[2];

      if (/<\w+>/.test(inner)) {
        const val = parseNode(inner);
        if (obj[key] !== undefined) {
          if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
          obj[key].push(val);
        } else {
          obj[key] = val;
        }
      } else {
        const text = inner.trim();
        if (obj[key] !== undefined) {
          if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
          obj[key].push(text);
        } else {
          obj[key] = text;
        }
      }
    }

    return found ? obj : s.trim();
  }

  return parseNode(xml);
}

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
      url = new URL(`${BASE_URL}/insectPilbkInfo`);
      url.searchParams.set("serviceKey", apiKey);
      url.searchParams.set("insctPilbkNo", insctPilbkNo);
      url.searchParams.set("pageNo", "1");
      url.searchParams.set("numOfRows", "1");
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
    console.log("Raw response (first 1000 chars):", text.slice(0, 1000));

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // Parse XML
      try {
        const parsed = parseXmlToJson(text);
        // The root is <response> so parsed = { header: {...}, body: {...} }
        data = parsed?.response || parsed;

        // Check for API error
        if (data?.header?.resultCode && data.header.resultCode !== "00") {
          return new Response(
            JSON.stringify({ error: data.header.resultMsg || `API 오류: ${data.header.resultCode}` }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Normalize: ensure items.item is always an array
        if (data?.body?.items?.item && !Array.isArray(data.body.items.item)) {
          data.body.items.item = [data.body.items.item];
        }
      } catch (xmlErr) {
        console.error("Parse error:", xmlErr, "Raw:", text.slice(0, 300));
        return new Response(
          JSON.stringify({ error: "공공데이터 API에서 유효하지 않은 응답을 받았습니다." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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