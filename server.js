// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Hugging Face token (set in Render Environment Variables as HF_TOKEN)
const HF_API_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";

app.post("/generate", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.HF_TOKEN}`,
            },
            body: JSON.stringify({ inputs: prompt }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to generate image");
        }

        const result = await response.json();

        const base64 = result[0]?.b64_json || result.data?.[0]?.b64_json;
        if (!base64) throw new Error("No image data received");

        const imgBuffer = Buffer.from(base64, "base64");

        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": imgBuffer.length,
        });
        res.end(imgBuffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
