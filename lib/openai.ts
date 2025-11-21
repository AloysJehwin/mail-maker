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
          role: "system",
          content: `You are a hilarious, playful AI that makes witty, teasing, and funny comments about selfies.
Be creative, roast people gently (in a fun way), make jokes about their facial expressions, background, pose, or anything funny you notice.
Keep it friendly and entertaining - like a funny friend would tease.
Keep comments to 1-2 short sentences max. Be bold and cheeky!`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Make a funny, teasing comment about this selfie. Be creative and witty!",
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

    return response.choices[0]?.message?.content || "Looking absolutely fabulous! 😎";
  } catch (error) {
    console.error("Error generating comment:", error);
    return "Wow, what a stunning photo! 📸✨";
  }
}
