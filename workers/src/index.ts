/**
 * Cloudflare Worker – Sentinel AI edge ingestion layer.
 *
 * Routes:
 *   POST /edge/ingest        – Receive telemetry from IoT devices and forward to backend
 *   POST /edge/cv-frame      – Receive base64-encoded frame, return CV reading (stub)
 *   GET  /edge/health        – Health check
 *   GET  /edge/workers       – Proxy list workers from backend
 *
 * The Worker validates the payload, adds Cloudflare-sourced metadata
 * (cf-ray, datacenter, timestamp), and forwards to the origin backend.
 *
 * Environment bindings (set in wrangler.toml / dashboard):
 *   BACKEND_URL   – URL of the FastAPI backend (e.g. https://api.sentinel-ai.io)
 *   API_SECRET    – Shared secret for worker→backend auth
 */

export interface Env {
  BACKEND_URL: string;
  API_SECRET: string;
}

// ─────────────────────────────────────── helpers
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Powered-By": "Sentinel-AI-Edge",
    },
  });
}

function errorJson(message: string, status = 400): Response {
  return json({ error: message }, status);
}

async function proxyToBackend(
  env: Env,
  path: string,
  init: RequestInit
): Promise<Response> {
  const url = `${env.BACKEND_URL}${path}`;
  const headers = new Headers(init.headers as HeadersInit);
  headers.set("X-Edge-Secret", env.API_SECRET);
  headers.set("Content-Type", "application/json");
  return fetch(url, { ...init, headers });
}

// ─────────────────────────────────────── main handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // ── health check
    if (pathname === "/edge/health" && request.method === "GET") {
      return json({
        status: "ok",
        edge: true,
        datacenter: (request as any).cf?.colo ?? "unknown",
        timestamp: new Date().toISOString(),
      });
    }

    // ── ingest telemetry
    if (pathname === "/edge/ingest" && request.method === "POST") {
      let body: Record<string, unknown>;
      try {
        body = await request.json();
      } catch {
        return errorJson("Invalid JSON body");
      }

      if (!body.worker_id) {
        return errorJson("Missing required field: worker_id");
      }

      // Enrich with edge metadata
      const enriched = {
        ...body,
        _edge_meta: {
          cf_ray: request.headers.get("CF-Ray") ?? null,
          colo: (request as any).cf?.colo ?? null,
          country: (request as any).cf?.country ?? null,
          edge_timestamp: new Date().toISOString(),
        },
      };

      try {
        const backendResp = await proxyToBackend(
          env,
          "/api/v1/telemetry/ingest",
          { method: "POST", body: JSON.stringify(enriched) }
        );
        const data = await backendResp.json();
        return json(data, backendResp.status);
      } catch (err) {
        return errorJson("Backend unreachable", 502);
      }
    }

    // ── CV frame processing stub
    if (pathname === "/edge/cv-frame" && request.method === "POST") {
      let body: Record<string, unknown>;
      try {
        body = await request.json();
      } catch {
        return errorJson("Invalid JSON body");
      }

      if (!body.worker_id || !body.frame_b64) {
        return errorJson("Missing required fields: worker_id, frame_b64");
      }

      // In a full deployment this would call a Workers AI binding.
      // For now return a placeholder CV reading for the worker to act on.
      const placeholder = {
        worker_id: body.worker_id,
        timestamp: new Date().toISOString(),
        cv: {
          ear: null,
          mar: null,
          perclos: null,
          blink_rate: null,
          head_pose_pitch: null,
          head_pose_yaw: null,
          note: "Edge CV inference not yet bound – use backend MediaPipe path",
        },
      };
      return json(placeholder, 202);
    }

    // ── proxy worker list
    if (pathname === "/edge/workers" && request.method === "GET") {
      try {
        const backendResp = await proxyToBackend(env, "/api/v1/workers/", {
          method: "GET",
        });
        const data = await backendResp.json();
        return json(data, backendResp.status);
      } catch {
        return errorJson("Backend unreachable", 502);
      }
    }

    return errorJson("Not found", 404);
  },
};
