#!/bin/bash
# ============================================
# CASTFRAME-PRO API Test Script
# ============================================
BASE_URL="${API_BASE_URL:-http://localhost:3000}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}CASTFRAME-PRO API Test Suite${NC}"
echo -e "${YELLOW}============================================${NC}"
echo -e "Base URL: ${BASE_URL}\n"

print_result() {
  local test_name=$1
  local status=$2
  if [ "$status" -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: $test_name"
  else
    echo -e "${RED}✗ FAIL${NC}: $test_name"
  fi
}

api_test() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_field=$4
  local response http_code body
  
  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n -1)
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    if [ -n "$expected_field" ]; then
      echo "$body" | grep -q "\"$expected_field\"" && return 0 || return 1
    else
      return 0
    fi
  else
    return 1
  fi
}

echo -e "\n${YELLOW}Test 1: Health Check${NC}"
api_test "GET" "/api/health" "" "status"
print_result "Health endpoint returns OK" $?

echo -e "\n${YELLOW}Test 2: Script Generation (requires GEMINI_API_KEY)${NC}"
SCRIPT_DATA='{"niche":"Fitness","tone":"Energetic","duration":30,"personaName":"FitAI"}'
if [ -n "$GEMINI_API_KEY" ]; then
  api_test "POST" "/api/generate/script" "$SCRIPT_DATA" "success"
  print_result "Script generation with Gemini" $?
else
  echo -e "${YELLOW}⊘ SKIP${NC}: GEMINI_API_KEY not set"
fi

echo -e "\n${YELLOW}Test 3: Visual Generation (Pollinations.ai)${NC}"
VISUALS_DATA='{"prompts":["Professional fitness coach in gym"],"aspectRatio":"9:16"}'
api_test "POST" "/api/generate/visuals" "$VISUALS_DATA" "success"
print_result "Visual generation with Pollinations" $?

echo -e "\n${YELLOW}Test 4: Audio Generation (Edge TTS)${NC}"
AUDIO_DATA='{"text":"Hello world!","voiceStyle":"energetic"}'
api_test "POST" "/api/generate/audio" "$AUDIO_DATA" "success"
print_result "Audio generation with Edge TTS" $?

echo -e "\n${YELLOW}Test 5: Video Render Queue${NC}"
RENDER_DATA='{"imageUrls":["https://image.pollinations.ai/prompt/test?width=768&height=1344"],"aspectRatio":"9:16","outputFormat":"mp4"}'
api_test "POST" "/api/render/video" "$RENDER_DATA" "jobId"
print_result "Video render job queued" $?

JOB_ID=$(curl -s -X POST "$BASE_URL/api/render/video" -H "Content-Type: application/json" -d "$RENDER_DATA" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)

echo -e "\n${YELLOW}Test 6: Job Status Check${NC}"
if [ -n "$JOB_ID" ]; then
  sleep 2
  api_test "GET" "/api/status/$JOB_ID" "" "success"
  print_result "Job status retrieval" $?
  echo -e "\n${YELLOW}Job Details:${NC}"
  curl -s "$BASE_URL/api/status/$JOB_ID" | python3 -m json.tool 2>/dev/null || curl -s "$BASE_URL/api/status/$JOB_ID"
else
  echo -e "${RED}✗ FAIL${NC}: Could not extract jobId"
fi

echo -e "\n${YELLOW}Test 7: List All Jobs${NC}"
api_test "GET" "/api/jobs" "" "success"
print_result "List all jobs" $?

echo -e "\n${YELLOW}Test 8: Available Voices${NC}"
api_test "GET" "/api/voices" "" "success"
print_result "Get available voices" $?

echo -e "\n${YELLOW}Test 9: Validation Error Handling${NC}"
INVALID_DATA='{"invalid":"data"}'
RESPONSE=$(curl -s -X POST "$BASE_URL/api/generate/visuals" -H "Content-Type: application/json" -d "$INVALID_DATA")
if echo "$RESPONSE" | grep -q "VALIDATION_ERROR"; then
  print_result "Validation error handling" 0
else
  print_result "Validation error handling" 1
fi

echo -e "\n${YELLOW}Test 10: CORS Configuration${NC}"
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$BASE_URL/api/health" -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET")
if echo "$CORS_RESPONSE" | grep -qi "Access-Control-Allow-Origin"; then
  print_result "CORS headers present" 0
else
  print_result "CORS headers present" 1
fi

echo -e "\n${YELLOW}============================================${NC}"
echo -e "${YELLOW}Test Suite Complete${NC}"
echo -e "${YELLOW}============================================${NC}"
