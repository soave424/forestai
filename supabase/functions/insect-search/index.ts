import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_URL = "https://apis.data.go.kr/1400119/InsectService";

function xmlToJson(node: any): any {
  if (!node) return null;
  const children = node.children;
  if (!children || children.length === 0) {
    return node.textContent?.trim() || "";
  }
  const obj: any = {};
  for (const child of children) {
    const key = child.tagName;
    const val = xmlToJson(child);
    if (obj[key] !== undefined) {
      if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
      obj[key].push(val);
    } else {
      obj[key] = val;
    }
  }
  return obj;
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
    } else {
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
      data = JSON.parse(text);
    } catch {
      // Parse XML response
      try {
        const doc = new DOMParser().parseFromString(text, "text/xml");
        if (doc) {
          data = xmlToJson(doc.documentElement);
          // Check for API error
          if (data?.header?.resultCode && data.header.resultCode !== "00") {
            return new Response(
              JSON.stringify({ error: data.header.resultMsg || `API 오류: ${data.header.resultCode}` }),
              { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          // Normalize items.item to always be an array
          if (data?.body?.items?.item && !Array.isArray(data.body.items.item)) {
            data.body.items.item = [data.body.items.item];
          }
        } else {
          throw new Error("XML parse failed");
        }
      } catch (xmlErr) {
        console.error("XML parse error:", xmlErr, "Raw:", text.slice(0, 500));
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