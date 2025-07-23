
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

console.log("🔐 OPENAI_API_KEY:", apiKey ? "Loaded ✅" : "Missing ❌");

if (!apiKey) {
  console.error("❌ OPENAI_API_KEY is missing in environment variables.");
  throw new Error("OPENAI_API_KEY is not defined in .env.local");
}

const openai = new OpenAI({
  apiKey, 
});

export default openai;
