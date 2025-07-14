#!/bin/bash

# Exit immediately if any command fails
set -e

echo "🔐 Loading env vars from .env.production..."
export $(grep -v '^#' .env.production | xargs)

echo "🔨 Generating Prisma Client..."
npx prisma generate

echo "💣 Dropping existing DB (if any)..."
npx prisma migrate reset --force --skip-seed

echo "📦 Pushing DB schema..."
npx prisma db push

echo "🌱 Seeding database..."
npx prisma db seed

echo "📦 Building app for production..."
npm run build

echo "🚚 Deploying to Vercel (production)..."
vercel --prod

echo "✅ Done!"
