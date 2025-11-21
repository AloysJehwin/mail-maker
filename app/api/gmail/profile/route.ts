import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProfile } from "@/lib/gmail";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getProfile(session.accessToken);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching Gmail profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
