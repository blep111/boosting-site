import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static UI
app.use(express.static(path.join(__dirname, "public")));

// Reaction API
app.post("/api/react", async (req, res) => {
  const { accessToken, postId, reaction } = req.body;

  if (!accessToken || !postId || !reaction) {
    return res.json({ success: false, message: "Missing parameters." });
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${postId}/reactions?type=${reaction}&access_token=${accessToken}`;
    const response = await fetch(url, { method: "POST" });
    const result = await response.json();

    if (!result.error) {
      res.json({ success: true, message: "Reaction added successfully!" });
    } else {
      res.json({ success: false, message: result.error.message });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);