import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { uploadToS3 } from "@/lib/s3";
import { generateTeasingComment } from "@/lib/openai";
import { savePhotoRecord } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { imageData, emoji } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    // Get user's email
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get user profile to get their email
    const profile = await gmail.users.getProfile({ userId: "me" });
    const userEmail = profile.data.emailAddress;

    // Upload to S3
    const s3Url = await uploadToS3(imageData, `${userEmail}-selfie.jpg`);
    console.log("Uploaded to S3:", s3Url);

    // Generate AI teasing comment
    const aiComment = await generateTeasingComment(s3Url);
    console.log("AI Comment:", aiComment);

    // Save photo metadata to S3
    await savePhotoRecord(userEmail || "unknown", s3Url, aiComment, emoji);

    // Remove data URL prefix
    const base64Image = imageData.replace(/^data:image\/\w+;base64,/, "");

    // Your email address (sender)
    const senderEmail = process.env.SENDER_EMAIL || userEmail;

    // Create email with inline embedded image and AI comment
    const boundary = "boundary_selfie_email";
    const messageParts = [
      `From: ${senderEmail}`,
      `To: ${userEmail}`,
      `Subject: =?UTF-8?B?${Buffer.from('Someone Caught You on Camera!').toString('base64')}?=`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/related; boundary="${boundary}"; charset=UTF-8`,
      "",
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "",
      `<html>
        <body style="font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 25px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
                📸 Selfie Alert! 🎉
              </h1>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <!-- AI Comment Box -->
              <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); border-left: 5px solid #e17055; padding: 20px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <p style="margin: 0; font-size: 18px; color: #2d3436; font-weight: 600; line-height: 1.6;">
                  💬 ${aiComment}
                </p>
              </div>

              <!-- Image -->
              <div style="text-align: center; margin: 30px 0;">
                <img src="cid:selfie_image" style="max-width: 100%; height: auto; border-radius: 20px; box-shadow: 0 8px 25px rgba(0,0,0,0.2);" alt="Your Selfie" />
              </div>

              ${emoji ? `<p style="text-align: center; font-size: 48px; margin: 20px 0;">${emoji}</p>` : ""}

              <!-- Footer Message -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="font-size: 16px; color: #636e72; margin: 10px 0;">
                  Keep making memories! 🌟
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f5f6fa; padding: 20px; text-align: center; border-top: 1px solid #dfe6e9;">
              <p style="margin: 0; font-size: 13px; color: #b2bec3;">
                Sent with 💜 from <strong style="color: #667eea;">Selfie Mailer</strong>
              </p>
            </div>
          </div>
        </body>
      </html>`,
      "",
      `--${boundary}`,
      "Content-Type: image/jpeg",
      "Content-Transfer-Encoding: base64",
      'Content-ID: <selfie_image>',
      'Content-Disposition: inline; filename="my-selfie.jpg"',
      "",
      base64Image,
      "",
      `--${boundary}--`,
    ];

    const message = messageParts.join("\r\n");
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Photo sent successfully!",
      recipient: userEmail,
    });
  } catch (error) {
    console.error("Error sending photo email:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send photo email",
      },
      { status: 500 }
    );
  }
}
