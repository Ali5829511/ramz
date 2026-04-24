import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const isProd = process.env.NODE_ENV === "production";
  const port = Number(process.env.PORT || 3000);

  // Basic hardening for production deployment
  app.disable("x-powered-by");

  if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
  }

  if (isProd && process.env.FORCE_HTTPS === "true") {
    app.use((req, res, next) => {
      const proto = req.headers["x-forwarded-proto"];
      if (proto && proto !== "https") {
        const host = req.headers.host;
        return res.redirect(301, `https://${host}${req.originalUrl}`);
      }
      next();
    });
  }

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (isProd) {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://*.supabase.co https://api.supabase.com; font-src 'self' data:;"
      );
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }
    next();
  });

  // Serve static files from dist/public in production
  const staticPath =
    isProd
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/readyz", (_req, res) => {
    res.status(200).json({ status: "ready" });
  });

  // ─── WhatsApp Business Webhook ───────────────────────────────────────────────
  const WA_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || "ramz_wh_2026_abda";

  // Webhook verification (GET) — Meta sends this to verify the endpoint
  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode      = req.query["hub.mode"];
    const token     = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === WA_VERIFY_TOKEN) {
      console.log("[WhatsApp] Webhook verified ✅");
      res.status(200).send(challenge as string);
    } else {
      console.warn("[WhatsApp] Webhook verification failed — token mismatch");
      res.sendStatus(403);
    }
  });

  // Webhook events (POST) — incoming messages & status updates
  app.post("/api/whatsapp/webhook", express.json(), (req, res) => {
    const body = req.body;
    if (body?.object === "whatsapp_business_account") {
      const entries = body.entry || [];
      for (const entry of entries) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (value?.messages) {
            for (const msg of value.messages) {
              console.log(`[WhatsApp] Message from ${msg.from}: ${msg.text?.body || msg.type}`);
            }
          }
          if (value?.statuses) {
            for (const st of value.statuses) {
              console.log(`[WhatsApp] Status update: ${st.status} for message ${st.id}`);
            }
          }
        }
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });
  // ─────────────────────────────────────────────────────────────────────────────

  app.use(
    express.static(staticPath, {
      etag: true,
      maxAge: isProd ? "7d" : 0,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-store");
        }
      },
    })
  );

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(path.join(staticPath, "index.html"));
  });

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer().catch(console.error);
