#!/bin/bash
# Tool calling 테스트 스크립트

echo "=== Tool Calling Test Script ==="
echo ""

# 테스트할 모델 목록
MODELS=(
    "gpt-oss:20b"
    "llama3.1:latest"
    "llama3.2:3b"
)

for MODEL in "${MODELS[@]}"; do
    echo "Testing: $MODEL"
    echo "---"

    # 모델이 설치되어 있는지 확인
    if ollama list | grep -q "$MODEL"; then
        # Tool calling 테스트
        RESULT=$(curl -s http://localhost:11434/v1/chat/completions \
          -H "Content-Type: application/json" \
          -d "{
            \"model\": \"$MODEL\",
            \"messages\": [{\"role\": \"user\", \"content\": \"Read test.txt\"}],
            \"tools\": [{
              \"type\": \"function\",
              \"function\": {
                \"name\": \"read_file\",
                \"description\": \"Read a file\",
                \"parameters\": {
                  \"type\": \"object\",
                  \"properties\": {
                    \"path\": {\"type\": \"string\"}
                  }
                }
              }
            }]
          }" | jq -r '.choices[0].message | if .tool_calls then "✅ SUPPORTED" else "❌ NOT SUPPORTED" end')

        echo "Result: $RESULT"
    else
        echo "Result: ⚠️  NOT INSTALLED"
    fi

    echo ""
done

echo "=== Test Complete ==="
