import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadToS3(
  imageData: string,
  filename: string
): Promise<string> {
  // Convert base64 to buffer
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME || "",
    Key: `selfies/${Date.now()}-${filename}`,
    Body: buffer,
    ContentType: "image/jpeg",
    // ACL removed - bucket uses bucket policy for public access
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    const url = `https://${params.Bucket}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${params.Key}`;
    return url;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image to S3");
  }
}
