import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLabels } from "@/lib/gmail";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const labels = await getLabels(session.accessToken);
    return NextResponse.json({ labels });
  } catch (error) {
    console.error("Error fetching Gmail labels:", error);
    return NextResponse.json(
      { error: "Failed to fetch labels" },
      { status: 500 }
    );
  }
}
