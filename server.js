import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Cooldown store
let cooldown = false;

// Reaction endpoint
app.post("/api/react", async (req, res) => {
  if (cooldown) return res.json({ success: false, message: "Please wait before sending another reaction." });

  const { cookie, postId, reaction } = req.body;
  if (!cookie || !postId || !reaction) return res.json({ success: false, message: "Missing fields." });

  cooldown = true; // set cooldown (can adjust timer)
  setTimeout(() => (cooldown = false), 15000); // 15s cooldown

  try {
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage();

    // Set cookie
    await page.setCookie({
      name: "c_user",
      value: cookie.match(/c_user=(\d+)/)[1],
      domain: ".facebook.com",
    });
    await page.setCookie({
      name: "xs",
      value: cookie.match(/xs=([^;]+)/)[1],
      domain: ".facebook.com",
    });

    // Go to post URL
    const postURL = `https://www.facebook.com/${postId}`;
    await page.goto(postURL, { waitUntil: "networkidle2" });

    // Click the reaction button
    const reactionSelector = {
      LIKE: 'div[aria-label="Like"]',
      LOVE: 'div[aria-label="Love"]',
      HAHA: 'div[aria-label="Haha"]',
      WOW: 'div[aria-label="Wow"]',
      SAD: 'div[aria-label="Sad"]',
      ANGRY: 'div[aria-label="Angry"]',
    }[reaction];

    await page.waitForSelector(reactionSelector, { timeout: 5000 });
    await page.click(reactionSelector);

    await page.waitForTimeout(2000); // wait for reaction to register
    await browser.close();

    res.json({ success: true, message: "Reaction sent successfully!" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to send reaction. Make sure your cookie is valid." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Running on http://localhost:${PORT}`));