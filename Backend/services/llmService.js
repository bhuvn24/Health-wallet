const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function analyzeMedicalDocument(textContext) {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert medical AI assistant. Analyze the following medical report data.
                    Values provided are extracted from a report.
                    
                    Return a JSON object with exactly two keys:
                    1. "summary": A concise HTML-formatted summary of the key findings (use <p>, <ul>, <li>, <strong> tags).
                    2. "recommendations": An HTML-formatted list of actionable health recommendations based on these findings (use <ul>, <li> tags).
                    
                    Do not include markdown backticks or JSON prefix. Just the raw JSON object.`
                },
                {
                    role: "user",
                    content: `Analyze this data: ${textContext}`
                }
            ],
            model: "llama3-70b-8192",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return result;
    } catch (error) {
        console.error("Groq Analysis Error:", error);
        return {
            summary: "Analysis failed. Please try again later.",
            recommendations: "No recommendations available."
        };
    }
}

module.exports = { analyzeMedicalDocument };
