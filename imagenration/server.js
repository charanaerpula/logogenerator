import express from 'express';
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const app = express();
app.use(express.json());
app.use(express.static('.'));

// Move the generateWithRetry function here
async function generateWithRetry(ai, contents, maxRetries = 3, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: contents,
        config: {
          responseModalities: ["Text", "Image"],
        },
      });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Attempt ${i + 1} failed, retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

app.post('/generate', async (req, res) => {
    try {
        const ai = new GoogleGenAI({ apiKey: "AIzaSyCaVnK8fHyDrtYZYgg-xLOT_zZZPib_jEI" });
        const contents = req.body.prompt;
        
        const response = await generateWithRetry(ai, contents);
        const part = response.candidates[0].content.parts.find(p => p.inlineData);
        
        if (part) {
            const imageData = part.inlineData.data;
            res.json({ image: imageData });
        } else {
            res.status(400).json({ error: 'No image generated' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});