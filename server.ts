import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "GEMINI_API_KEY environment variable is required. Please set it via the Secrets panel in AI Studio Settings."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || "0.0.0.0";
  const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
  const ALLOWED_UPLOAD_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg", "gif", "webp", "svg", "txt", "xlsx", "docx"]);

  function sanitizeUploadFilename(filename: string): string | null {
    const baseName = path.basename(filename).replace(/[^\w.\- ()]/g, "_");
    if (!baseName || baseName === "." || baseName === "..") {
      return null;
    }

    const ext = baseName.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
      return null;
    }

    return baseName;
  }

  function resolveUploadPath(filename: string): { uploadsDir: string; filePath: string; safeName: string } | null {
    const safeName = sanitizeUploadFilename(filename);
    if (!safeName) {
      return null;
    }

    const uploadsDir = path.resolve(process.cwd(), "uploads");
    const filePath = path.resolve(uploadsDir, safeName);
    if (!filePath.startsWith(uploadsDir + path.sep)) {
      return null;
    }

    return { uploadsDir, filePath, safeName };
  }

  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ limit: "30mb", extended: true }));

  // API: AI Assistant Chat proxying to server-side Gemini 3.5 Flash API
  app.post("/api/chat", async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid messages format. Must be an array." });
        return;
      }

      // Initialize Gemini safely and lazy-loaded
      let ai;
      try {
        ai = getGeminiClient();
      } catch (err: any) {
        // If API key is missing, respond gracefully with instructions rather than crashing
        res.status(403).json({
          error: "API_KEY_MISSING",
          message: err.message || "Gemini API key is not configured.",
        });
        return;
      }

      // Convert messages to GoogleGenAI chat schema
      // Model expects history to be properly aligned
      const contents = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: `You are Dr. Krishna Garg, the world's most prestigious Senior Professor of Anatomy, Author of 'Textbook of Anatomy for Dental Students', and Chief Editor of B.D. Chaurasia's Human Anatomy.
Your teaching tone is academic, warm, encouraging, and deeply inspiring, specifically tailored for BDS (Bachelor of Dental Surgery) students.
Answer the dental student's question about head and neck anatomy, cranial nerves (especially Trigeminal CN V and Facial CN VII), TMJ mechanics, oral cavity, salivary glands, and dental local anaesthesia landmarks with extreme clinical and academic authority.

Guidelines for your response:
1. Speak with elegant, encouraging, and clear academic composure.
2. Highlight complex clinical head and neck terminology in bold (e.g. **Temporomandibular Joint**, **Inferior Alveolar Nerve**, **Pterygomandibular space**, **Stensen's duct**, **Maxilla**, **Mandible**).
3. Structure your response with distinct, beautiful sections (e.g., "Anatomical Blueprint", "BDS Clinical Relevance", "Dr. Garg's Oral Surgical Tip").
4. Keep answers extremely focused, high-density, and highly readable (under 200-250 words) with bullet points rather than dense paragraphs.`,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "My neural synapses could not map that request. Let us consult the anatomy atlas again.";

      // Scan response text for anatomical words to enable highlights on client
      const keySystems = [
        "brain",
        "mandible",
        "maxilla",
        "trigeminal",
        "facial",
        "tongue",
        "salivary",
        "parotid",
        "denture",
        "molar",
        "pterygoid",
        "masseter",
        "temple",
        "joint",
        "skull",
        "bone",
        "nerve",
        "muscle",
        "artery",
        "vein",
        "synaptic",
        "atrium",
        "ventricle",
      ];
      const foundHighlights = keySystems.filter((sys) => replyText.toLowerCase().includes(sys));

      res.json({
        text: replyText,
        anatomyHighlights: foundHighlights,
      });
    } catch (error: any) {
      console.error("Gemini Assistant Route Error:", error);
      res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: error.message || "An unexpected error occurred in Garg AI Synapse server.",
      });
    }
  });

  // Real Upload endpoint saving files to disk on the persistent server
  app.post("/api/upload", (req, res) => {
    try {
      const { filename, content } = req.body;
      if (!filename || !content) {
        return res.status(400).json({ error: "Missing filename or content" });
      }

      const resolved = resolveUploadPath(filename);
      if (!resolved) {
        return res.status(400).json({ error: "Invalid filename or unsupported file type" });
      }

      // Convert Base64 data URL to binary buffer
      const base64Data = content.replace(/^data:.*;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      if (buffer.length > MAX_UPLOAD_BYTES) {
        return res.status(413).json({ error: "File is too large" });
      }

      if (!fs.existsSync(resolved.uploadsDir)) {
        fs.mkdirSync(resolved.uploadsDir, { recursive: true });
      }

      fs.writeFileSync(resolved.filePath, buffer);

      console.log(`Successfully stored file to ${resolved.filePath}`);

      res.json({
        success: true,
        message: "Anatomical material synchronized successfully with KRISHNA GARG AI cloud indexes.",
        fileId: "file_" + Math.random().toString(36).substr(2, 9),
        filename: resolved.safeName,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Upload handler error:", error);
      res.status(500).json({ error: "Upload failed: " + error.message });
    }
  });

  // Real Download endpoint serving the exact file from disk
  app.get("/api/download/:filename", (req, res) => {
    try {
      const resolved = resolveUploadPath(req.params.filename);
      if (!resolved) {
        return res.status(400).send("Invalid filename or unsupported file type.");
      }

      const filename = resolved.safeName;
      const filePath = resolved.filePath;

      if (!fs.existsSync(filePath)) {
        return res.status(404).send("Uploaded file not found. Please re-upload this attachment.");
      }

      // Force proper browser display/download configuration
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(filename)}"`);

      // Determine correct content-type
      const ext = filename.split(".").pop()?.toLowerCase();
      let contentType = "application/octet-stream";

      // Detect SVG content because some uploaded placeholders may keep image-like extensions.
      let isSvg = false;
      try {
        const fileHead = fs.readFileSync(filePath, { encoding: "utf8", flag: "r" }).substring(0, 100);
        if (fileHead.includes("<svg")) {
          isSvg = true;
        }
      } catch (err) {}

      if (isSvg) {
        contentType = "image/svg+xml";
      } else if (ext === "pdf") {
        contentType = "application/pdf";
      } else if (ext === "png") {
        contentType = "image/png";
      } else if (ext === "jpg" || ext === "jpeg") {
        contentType = "image/jpeg";
      } else if (ext === "txt") {
        contentType = "text/plain";
      } else if (ext === "xlsx") {
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else if (ext === "docx") {
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      }

      res.setHeader("Content-Type", contentType);
      res.sendFile(filePath);
    } catch (error: any) {
      console.error("Download handler error:", error);
      res.status(500).send("Server error processing your download request.");
    }
  });

  // Vite development middleware vs Static Production files serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Serve the /assets directory statically so any custom teacher photo or SVG is served reliably.
  // This runs after Vite in development so import requests like /assets/foo.jpg?import are still handled by Vite.
  app.use("/assets", express.static(path.join(process.cwd(), "assets")));

  app.listen(PORT, HOST, () => {
    console.log(`KRISHNA GARG ANATOMY server running on http://${HOST}:${PORT}`);
  });
}

startServer();
