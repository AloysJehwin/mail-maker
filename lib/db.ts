import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export interface PhotoRecord {
  id: number;
  user_email: string;
  image_url: string;
  ai_comment: string;
  emoji?: string;
  created_at: string;
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const METADATA_KEY = "metadata/photos.json";
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

// Get all photos from S3 JSON file
async function getPhotosFromS3(): Promise<PhotoRecord[]> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: METADATA_KEY,
    });
    const response = await s3Client.send(command);
    const bodyString = await response.Body?.transformToString();
    return bodyString ? JSON.parse(bodyString) : [];
  } catch (error: any) {
    // If file doesn't exist, return empty array
    if (error.name === "NoSuchKey") {
      return [];
    }
    console.error("Error reading photos from S3:", error);
    return [];
  }
}

// Save photos array to S3
async function savePhotosToS3(photos: PhotoRecord[]): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: METADATA_KEY,
    Body: JSON.stringify(photos, null, 2),
    ContentType: "application/json",
  });
  await s3Client.send(command);
}

export async function savePhotoRecord(
  userEmail: string,
  imageUrl: string,
  aiComment: string,
  emoji?: string
): Promise<PhotoRecord> {
  const photos = await getPhotosFromS3();

  const newPhoto: PhotoRecord = {
    id: photos.length > 0 ? Math.max(...photos.map(p => p.id)) + 1 : 1,
    user_email: userEmail,
    image_url: imageUrl,
    ai_comment: aiComment,
    emoji: emoji,
    created_at: new Date().toISOString(),
  };

  photos.push(newPhoto);
  await savePhotosToS3(photos);

  return newPhoto;
}

export async function getAllPhotos(): Promise<PhotoRecord[]> {
  const photos = await getPhotosFromS3();
  return photos.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
