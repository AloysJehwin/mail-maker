import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listMessages, getMessage } from "@/lib/gmail";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const messagesList = await listMessages(session.accessToken, 10);
    const messageIds = messagesList.messages || [];

    // Fetch full details for each message
    const messagesPromises = messageIds.map((msg) =>
      getMessage(session.accessToken!, msg.id!)
    );
    const messagesDetails = await Promise.all(messagesPromises);

    // Extract relevant information
    const messages = messagesDetails.map((msg) => {
      const headers = msg.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
          ?.value || "";

      return {
        id: msg.id,
        snippet: msg.snippet,
        subject: getHeader("Subject"),
        from: getHeader("From"),
        date: getHeader("Date"),
      };
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching Gmail messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
