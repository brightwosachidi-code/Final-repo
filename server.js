
// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Hugging Face API token from environment variable
const HF_TOKEN = process.env.HF_TOKEN;

// POST route to generate image
app.post("/generate", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/prompthero/openjourney", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to generate image");
        }

        const buffer = await response.arrayBuffer();
        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": buffer.byteLength
        });
        res.end(Buffer.from(buffer));

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
