import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Facebook reaction API using cookies
app.post("/api/react", async (req, res) => {
  const { cookie, postId, reaction } = req.body;

  if (!cookie || !postId || !reaction) {
    return res.json({ success: false, message: "Missing fields." });
  }

  try {
    const url = `https://mbasic.facebook.com/ufi/reaction/?reaction_type=${reaction}&ft_ent_identifier=${postId}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "cookie": cookie,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "content-type": "application/x-www-form-urlencoded"
      }
    });

    if (response.ok) {
      res.json({ success: true, message: "Reaction sent successfully!" });
    } else {
      res.json({ success: false, message: "Failed to send reaction." });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Facebook Cookie Booster running at http://localhost:${PORT}`)
);