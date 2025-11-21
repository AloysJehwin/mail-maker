# PostgreSQL Setup Guide for Selfie Mailer

This guide will walk you through setting up PostgreSQL for storing photo metadata.

## Option 1: Vercel Postgres (Recommended - Easiest)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub, GitLab, or Email
3. Complete the registration

### Step 2: Create Postgres Database
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **"Storage"** tab in the top menu
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Give it a name (e.g., `selfie-mailer-db`)
6. Select region closest to you
7. Click **"Create"**

### Step 3: Get Connection Strings
1. After database is created, click on it
2. Go to **".env.local"** tab
3. You'll see several environment variables like:
   ```
   POSTGRES_URL="postgres://..."
   POSTGRES_PRISMA_URL="postgres://..."
   POSTGRES_URL_NO_SSL="postgres://..."
   POSTGRES_URL_NON_POOLING="postgres://..."
   POSTGRES_USER="..."
   POSTGRES_HOST="..."
   POSTGRES_PASSWORD="..."
   POSTGRES_DATABASE="..."
   ```
4. Click **"Copy Snippet"** button

### Step 4: Add to Your .env.local
1. Open your `.env.local` file
2. Paste all the Postgres variables you copied
3. Save the file

### Step 5: Initialize Database Table
1. Go back to Vercel dashboard
2. Click on your database
3. Go to **"Query"** tab
4. Paste this SQL and click **"Run Query"**:

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

5. You should see "Query executed successfully"

### Step 6: Verify Setup
1. Run this query to check:
```sql
SELECT * FROM photos;
```
2. Should return empty result (no rows yet)

### ✅ Done!
Your PostgreSQL database is ready. The app will automatically use it.

---

## Option 2: Local PostgreSQL (For Development)

### Step 1: Install PostgreSQL

**macOS (with Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
1. Download from [postgresql.org/download](https://www.postgresql.org/download/)
2. Run installer
3. Remember the password you set for `postgres` user

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database
```bash
# Connect to PostgreSQL
psql postgres

# Inside psql, run:
CREATE DATABASE selfie_mailer;

# Create a user (optional)
CREATE USER selfie_user WITH PASSWORD 'your_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE selfie_mailer TO selfie_user;

# Exit
\q
```

### Step 3: Create Table
```bash
# Connect to your database
psql selfie_mailer

# Create the table
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  ai_comment TEXT NOT NULL,
  emoji VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

# Verify
\dt

# Exit
\q
```

### Step 4: Update .env.local
```bash
POSTGRES_URL="postgresql://selfie_user:your_password_here@localhost:5432/selfie_mailer"
```

---

## Option 3: Railway (Free Alternative)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify your email

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Provision PostgreSQL"**
3. Wait for database to be created

### Step 3: Get Connection String
1. Click on the PostgreSQL service
2. Go to **"Variables"** tab
3. Copy the `DATABASE_URL` value
4. It looks like: `postgresql://postgres:password@containers-us-west-xxx.railway.app:7431/railway`

### Step 4: Add to .env.local
```bash
POSTGRES_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:7431/railway"
```

### Step 5: Create Table
1. In Railway dashboard, click on PostgreSQL service
2. Go to **"Data"** tab
3. Click **"Query"**
4. Paste and execute:

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

---

## Option 4: Supabase (Free with Generous Limits)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Verify email

### Step 2: Create New Project
1. Click **"New Project"**
2. Fill in:
   - Name: `selfie-mailer`
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to you
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup

### Step 3: Create Table
1. Go to **"Table Editor"** in left sidebar
2. Click **"Create a new table"**
3. Fill in:
   - Name: `photos`
   - Enable RLS: ❌ (unchecked for now)
4. Add columns:
   - `id` - int8 - Primary, Auto-increment
   - `user_email` - text - Required
   - `image_url` - text - Required
   - `ai_comment` - text - Required
   - `emoji` - text - Optional
   - `created_at` - timestamptz - Default: now()
5. Click **"Save"**

### Step 4: Get Connection String
1. Go to **"Project Settings"** (gear icon)
2. Click **"Database"**
3. Scroll to **"Connection String"**
4. Select **"URI"**
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with the password you created

### Step 5: Add to .env.local
```bash
POSTGRES_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

---

## Testing Your Database

After setup, test it with this Node.js script:

```javascript
// test-db.js
const { sql } = require('@vercel/postgres');

async function testDatabase() {
  try {
    const result = await sql`SELECT * FROM photos`;
    console.log('✅ Database connection successful!');
    console.log('Photos:', result.rows);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDatabase();
```

Run with:
```bash
node test-db.js
```

---

## Troubleshooting

### Error: "relation 'photos' does not exist"
**Solution:** You forgot to create the table. Run the CREATE TABLE SQL.

### Error: "password authentication failed"
**Solution:** Check your password in the connection string.

### Error: "could not connect to server"
**Solution:**
- Check if PostgreSQL is running
- Verify host and port in connection string
- Check firewall settings

### Error: "SSL connection is required"
**Solution:** Add `?sslmode=require` to your connection string:
```
POSTGRES_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

---

## My Recommendation

**For production/deployment:** Use **Vercel Postgres** - It's free, auto-configured, and works perfectly with Next.js.

**For local development:** Use **Vercel Postgres** too - No need to install anything locally!

**Alternative free option:** Use **Supabase** - Generous free tier, great dashboard.

---

## Quick Setup (Vercel - 5 minutes)

1. ✅ Go to vercel.com → Sign up
2. ✅ Storage → Create Database → Postgres
3. ✅ Copy all env variables
4. ✅ Paste in .env.local
5. ✅ Run CREATE TABLE query in Vercel dashboard
6. ✅ Done!

No local installation needed! 🎉
