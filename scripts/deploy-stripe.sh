#!/bin/bash

# Load environment variables from .env
set -a
source .env
set +a

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project reference
PROJECT_REF="ulsafrboqmcqrqmeiczo"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Deploying Stripe Integration to Supabase${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Validate required environment variables
if [ -z "$STRIPE_SECRET_KEY" ] || [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo -e "${RED}❌ Error: STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET not set in .env${NC}"
    exit 1
fi

# Step 1: Deploy Edge Functions
echo -e "${YELLOW}📦 Step 1: Deploying Edge Functions...${NC}"
echo ""

echo -e "${BLUE}→${NC} Deploying stripe-webhook..."
supabase functions deploy stripe-webhook --project-ref $PROJECT_REF --no-verify-jwt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} stripe-webhook deployed successfully"
else
    echo -e "${RED}✗${NC} Failed to deploy stripe-webhook"
fi
echo ""

echo -e "${BLUE}→${NC} Deploying stripe-create-checkout..."
supabase functions deploy stripe-create-checkout --project-ref $PROJECT_REF --no-verify-jwt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} stripe-create-checkout deployed successfully"
else
    echo -e "${RED}✗${NC} Failed to deploy stripe-create-checkout"
fi
echo ""

echo -e "${BLUE}→${NC} Deploying stripe-connect-account..."
supabase functions deploy stripe-connect-account --project-ref $PROJECT_REF --no-verify-jwt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} stripe-connect-account deployed successfully"
else
    echo -e "${RED}✗${NC} Failed to deploy stripe-connect-account"
fi
echo ""

echo -e "${BLUE}→${NC} Deploying stripe-create-transfer..."
supabase functions deploy stripe-create-transfer --project-ref $PROJECT_REF --no-verify-jwt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} stripe-create-transfer deployed successfully"
else
    echo -e "${RED}✗${NC} Failed to deploy stripe-create-transfer"
fi
echo ""

# Step 2: Set Secrets
echo -e "${YELLOW}🔐 Step 2: Setting Secrets...${NC}"
echo ""

echo -e "${BLUE}→${NC} Setting STRIPE_SECRET_KEY..."
supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" --project-ref $PROJECT_REF
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} STRIPE_SECRET_KEY set successfully"
else
    echo -e "${RED}✗${NC} Failed to set STRIPE_SECRET_KEY"
fi
echo ""

echo -e "${BLUE}→${NC} Setting STRIPE_WEBHOOK_SECRET..."
supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" --project-ref $PROJECT_REF
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} STRIPE_WEBHOOK_SECRET set successfully"
else
    echo -e "${RED}✗${NC} Failed to set STRIPE_WEBHOOK_SECRET"
fi
echo ""

# Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically provided by Supabase
echo -e "${GREEN}✓${NC} SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (auto-provided by Supabase)"
echo ""

# Set VITE_APP_URL based on environment or default to localhost
APP_URL="${VITE_APP_URL:-http://localhost:7001}"
echo -e "${BLUE}→${NC} Setting VITE_APP_URL ($APP_URL)..."
supabase secrets set VITE_APP_URL="$APP_URL" --project-ref $PROJECT_REF
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} VITE_APP_URL set successfully"
else
    echo -e "${RED}✗${NC} Failed to set VITE_APP_URL"
fi
echo ""

# Step 3: Display Webhook URL
echo -e "${YELLOW}📍 Step 3: Configure Stripe Webhook${NC}"
echo ""
echo -e "${BLUE}Add this webhook URL in your Stripe Dashboard:${NC}"
echo -e "${GREEN}https://ulsafrboqmcqrqmeiczo.supabase.co/functions/v1/stripe-webhook${NC}"
echo ""
echo -e "${BLUE}Select these events:${NC}"
echo "  • checkout.session.completed"
echo "  • account.updated"
echo "  • payment_intent.succeeded"
echo "  • payment_intent.payment_failed"
echo ""
echo -e "${BLUE}Stripe Dashboard:${NC} https://dashboard.stripe.com/test/webhooks"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
