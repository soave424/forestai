import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_URL = "https://apis.data.go.kr/1400119/InsectService";

function parseXmlToJson(xml: string): any {
  xml = xml.replace(/<\?xml[^?]*\?>\s*/g, "");
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
    const { query, pageNo = "1", numOfRows = "10" } = await req.json();

    const apiKey = Deno.env.get("PUBLIC_DATA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "PUBLIC_DATA_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(`${BASE_URL}/insectPilbkSearch`);
    url.searchParams.set("serviceKey", apiKey);
    url.searchParams.set("pageNo", String(pageNo));
    url.searchParams.set("numOfRows", String(numOfRows));
    if (query) {
      url.searchParams.set("reqSearchWrd", query);
    }

    console.log("Fetching:", url.toString());

    const response = await fetch(url.toString());
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      try {
        const parsed = parseXmlToJson(text);
        data = parsed?.response || parsed;

        if (data?.header?.resultCode && data.header.resultCode !== "00") {
          return new Response(
            JSON.stringify({ error: data.header.resultMsg || `API 오류: ${data.header.resultCode}` }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

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
