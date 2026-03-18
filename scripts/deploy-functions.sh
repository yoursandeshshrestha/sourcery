#!/bin/bash

# Deploy All Edge Functions
# This script deploys all Supabase Edge Functions with --no-verify-jwt

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project reference
PROJECT_REF="ulsafrboqmcqrqmeiczo"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Deploying All Edge Functions${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Array of all edge functions
FUNCTIONS=(
  "stripe-webhook"
  "stripe-create-checkout"
  "stripe-connect-account"
  "stripe-create-transfer"
  "stream-token"
  "stream-create-channel"
  "stream-upsert-user"
  "stream-initialize-channel"
)

# Track deployment status
SUCCESS_COUNT=0
FAIL_COUNT=0
FAILED_FUNCTIONS=()

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
  echo -e "${BLUE}→${NC} Deploying $func..."
  supabase functions deploy $func --project-ref $PROJECT_REF --no-verify-jwt

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $func deployed successfully"
    ((SUCCESS_COUNT++))
  else
    echo -e "${RED}✗${NC} Failed to deploy $func"
    ((FAIL_COUNT++))
    FAILED_FUNCTIONS+=("$func")
  fi
  echo ""
done

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Deployment Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Successful:${NC} $SUCCESS_COUNT functions"
echo -e "${RED}Failed:${NC} $FAIL_COUNT functions"

if [ ${#FAILED_FUNCTIONS[@]} -gt 0 ]; then
  echo ""
  echo -e "${RED}Failed functions:${NC}"
  for func in "${FAILED_FUNCTIONS[@]}"; do
    echo "  • $func"
  done
fi

echo ""
echo -e "${BLUE}View your functions:${NC}"
echo -e "https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo ""
