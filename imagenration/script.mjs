import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

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

async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyCaVnK8fHyDrtYZYgg-xLOT_zZZPib_jEI" });
    const contents = "generate logo for a brand called charan use black bg lion illustration";

    const response = await generateWithRetry(ai, contents);
    
    for (const part of response.candidates[0].content.parts) {
      // Based on the part type, either show the text or save the image
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        fs.writeFileSync("gemini-native-image.png", buffer);
        console.log("Image saved as gemini-native-image.png");
      }
    }
  } catch (error) {
    console.error('Failed to generate image:', error.message);
    process.exit(1);
  }
}

main();