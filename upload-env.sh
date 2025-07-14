#!/bin/bash

# Make sure you're logged in
vercel login

# Read each line of .env.production and add to Vercel production environment
while IFS='=' read -r key value || [[ -n "$key" ]]; do
    if [[ ! "$key" =~ ^# && -n "$key" ]]; then
        echo "Setting $key in Vercel production..."
        vercel env add "$key" production <<< "$value"
    fi
done < .env.production