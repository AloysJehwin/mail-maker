# 📸 Selfie Mailer - AI-Powered Selfie to Email App

A fun, interactive web app that lets users take selfies, add animal emoji stickers, and automatically receive them via email with hilarious AI-generated roasts!

## ✨ Features

- 📱 **Portrait Mode Camera** - Vertical orientation for perfect selfies
- 🐶 **64 Animal Emoji Stickers** - Choose from a huge collection of animal emojis to overlay on photos
- 🤖 **AI-Generated Roasts** - OpenAI generates teasing, funny comments about each selfie
- ☁️ **Cloud Storage** - All photos automatically uploaded to AWS S3
- 📧 **Beautiful Emails** - Receive gorgeously designed HTML emails with inline images and AI comments
- 🎨 **Admin Gallery** - View all captured selfies with AI descriptions in a beautiful dashboard
- 🔐 **Google OAuth** - Secure authentication with Gmail integration
- 🌐 **Public Deployment** - Deployed via Cloudflare Tunnel with custom domain

## 🚀 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Authentication**: NextAuth with Google OAuth
- **APIs**: Gmail API, OpenAI GPT-4 Vision, AWS S3
- **Database**: Vercel Postgres
- **Deployment**: Docker + Cloudflare Tunnel
- **Platform**: Node.js 20 (Alpine Linux)

## 📋 Prerequisites

Before running this app, you'll need:

1. **Google Cloud Project** with Gmail API enabled
2. **AWS Account** with S3 bucket configured
3. **OpenAI API Key** (for AI comments)
4. **Vercel Postgres Database** (or any PostgreSQL database)
5. **Cloudflare Tunnel** (for public deployment)

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd my-next-app
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required variables:
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME` - From AWS
- `OPENAI_API_KEY` - From OpenAI Platform
- `POSTGRES_URL` - From Vercel or your PostgreSQL provider
- `SENDER_EMAIL` - Your Gmail address to send emails from
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `TUNNEL_TOKEN` - From Cloudflare Zero Trust Dashboard

### 3. Initialize Database

Run this to create the photos table:

```sql
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  ai_comment TEXT NOT NULL,
  emoji VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Configure AWS S3 Bucket

1. Create an S3 bucket
2. Set bucket policy to allow public read access for images:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

3. Create IAM user with S3 upload permissions
4. Add credentials to `.env.local`

### 5. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Gmail API
4. Configure OAuth consent screen:
   - Add your email as test user
   - Add scopes: gmail.readonly, gmail.modify, gmail.compose, gmail.send
5. Create OAuth 2.0 credentials (Web application)
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Secret to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🐳 Docker Deployment

### Local Docker

```bash
docker-compose build
docker-compose up -d
```

### Production with Cloudflare Tunnel

1. Create a Cloudflare Tunnel in Zero Trust Dashboard
2. Get your tunnel token
3. Add `TUNNEL_TOKEN` to `.env.local`
4. Update `docker-compose.yml` with your domain
5. Deploy:

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

## 📱 Usage

1. **Sign In** - Click "Sign in with Google" and authorize Gmail access
2. **Take Selfie** - Click "Open Camera" to start your webcam
3. **Choose Sticker** - Select an animal emoji from the grid (optional)
4. **Capture** - Click "Capture Photo" when ready
5. **Send** - Click "Email to Yourself" to receive the photo with AI roast
6. **View Gallery** - Click "🎨 Gallery" to see all selfies with AI comments

## 🎨 Admin Gallery

Access `/admin` to view:
- All captured selfies in a beautiful grid
- AI-generated roasts for each photo
- User email and timestamp
- Selected emoji stickers

## 🔧 How It Works

1. User takes selfie with optional emoji overlay
2. Photo is uploaded to AWS S3
3. OpenAI GPT-4 Vision analyzes the photo and generates a funny, teasing comment
4. Photo metadata saved to PostgreSQL database
5. Email sent via Gmail API with:
   - Beautiful HTML design
   - Inline embedded image
   - AI-generated roast
   - Selected emoji
6. All photos viewable in admin dashboard

## 📂 Project Structure

```
my-next-app/
├── app/
│   ├── admin/                 # Admin gallery page
│   ├── api/
│   │   ├── admin/photos/      # Fetch all photos API
│   │   ├── auth/              # NextAuth routes
│   │   └── gmail/             # Gmail API routes
│   ├── dashboard/             # Main selfie camera page
│   └── page.tsx               # Login page
├── lib/
│   ├── auth.ts                # NextAuth configuration
│   ├── db.ts                  # Database functions
│   ├── gmail.ts               # Gmail helpers
│   ├── openai.ts              # OpenAI integration
│   └── s3.ts                  # AWS S3 upload
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Multi-stage Docker build
└── .env.example               # Environment variables template
```

## 🎯 Key Features Explained

### Portrait Mode Camera
- Uses `getUserMedia` with 720x1280 resolution
- Mirrored preview (scaleX(-1)) for natural selfie view
- Aspect ratio 9:16 for vertical photos

### AI Roasting System
- Uses OpenAI GPT-4o-mini with vision
- Custom prompt for funny, teasing comments
- Analyzes facial expressions, pose, background
- Keeps comments short and entertaining

### Email Design
- Responsive HTML emails
- Gradient backgrounds
- Inline image embedding (not attachments)
- Beautiful AI comment callout box
- Mobile-friendly design

## 🚨 Troubleshooting

**Camera not working:**
- Ensure HTTPS (required for camera access)
- Check browser permissions
- Try Chrome or Safari

**Gmail API errors:**
- Verify OAuth scopes are correct
- Add yourself as test user in Google Cloud Console
- Re-authenticate after scope changes

**S3 upload fails:**
- Check AWS credentials
- Verify bucket policy allows public read
- Ensure IAM user has PutObject permission

**Database errors:**
- Run the CREATE TABLE SQL command
- Verify POSTGRES_URL is correct
- Check database connection string format

## 📄 License

MIT

## 👤 Author

Built with ❤️ and AI assistance

---

**Have fun taking selfies and getting roasted by AI!** 📸🤖😂
