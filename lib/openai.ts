import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTeasingComment(imageUrl: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Look at this selfie and write a short, funny, and playful teasing comment about it (1-2 sentences max). Be creative and humorous but keep it light and friendly!",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 100,
    });

    return response.choices[0]?.message?.content || "Looking good! 📸";
  } catch (error) {
    console.error("Error generating AI comment:", error);
    return "Nice photo! 😊";
  }
}
