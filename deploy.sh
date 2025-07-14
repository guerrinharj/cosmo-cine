#!/bin/bash

set -e

TEMP_ENV_FILE=".env.temp"

echo "📦 Pulling Vercel envs to temporary file..."
vercel env pull $TEMP_ENV_FILE

echo "🔐 Exporting environment variables..."
export $(grep -v '^#' $TEMP_ENV_FILE | xargs)

echo "🔨 Generating Prisma Client..."
npx prisma generate

echo "💣 Resetting database (skip seed)..."
npx prisma migrate reset --force --skip-seed

echo "🧱 Pushing schema to DB..."
npx prisma db push

echo "🌱 Seeding database..."
npx prisma db seed

echo "🏗️ Building app for production..."
npm run build

echo "🚀 Deploying to Vercel (production)..."
vercel --prod

echo "🧹 Cleaning up..."
rm $TEMP_ENV_FILE

echo "✅ Done!"
