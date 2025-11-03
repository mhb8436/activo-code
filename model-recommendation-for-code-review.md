# 코드 품질 점검을 위한 모델 추천

## 작업 요구사항
- **Task**: 디렉토리 내 Java, HTML, JavaScript 코드 품질 점검
- **Key Challenge**: Multi-step tool calling (탐색 → 읽기 → 분석 → 리포트)
- **Command**: "소스코드 품질을 점검해줘"

---

## 🏆 최고 추천: **qwen2.5:14b** (일반 Qwen)

### 선택 이유
1. ✅ **범용 모델** - 코드만이 아닌 전반적 작업 처리
2. ✅ **Tool calling 지원 개선** - qwen2.5-coder보다 tool workflow 잘 처리
3. ✅ **분석 + 리포팅** - 코드 분석 후 종합 보고서 작성 능력
4. ✅ **크기 대비 성능** - 14B로 충분한 추론 능력
5. ✅ **다국어 지원** - Java, JavaScript, HTML 모두 잘 이해

### 설치 및 설정
```bash
# 모델 다운로드 (약 8.5GB)
ollama pull qwen2.5:14b

# activo-code에서 사용
export OLLAMA_MODEL="qwen2.5:14b"
activo-code
```

### 테스트 프롬프트
```bash
> src/ 디렉토리의 모든 Java, JavaScript, HTML 파일의 품질을 점검해줘.
  다음 항목을 확인:
  1. 코드 스타일 일관성
  2. 잠재적 버그
  3. 보안 취약점
  4. 성능 이슈
  각 파일별 점수(1-10)와 개선 제안을 포함한 리포트 작성해줘.
```

---

## 🥈 차선책 1: **llama3.1:8b**

### 선택 이유
1. ✅ **공식 function calling 지원** - Meta에서 tool use 학습
2. ✅ **빠른 속도** - 8B로 응답 빠름
3. ✅ **안정적인 tool workflow** - Multi-step 처리 안정적
4. ⚠️ **코드 품질은 Qwen보다 약간 낮음**

### 설치 및 설정
```bash
ollama pull llama3.1:8b
export OLLAMA_MODEL="llama3.1:8b"
```

### 장단점
| 장점 | 단점 |
|------|------|
| 빠른 응답 (8B) | 코드 이해도는 qwen2.5보다 낮음 |
| Tool calling 안정적 | 한국어 지원 약함 |
| 메모리 적게 사용 | 14B 모델보다 분석 깊이 부족 |

---

## 🥉 차선책 2: **deepseek-coder-v2:16b**

### 선택 이유
1. ✅ **코드 특화** - 코드 이해도 최고 수준
2. ✅ **Fill-in-the-middle** - 코드 문맥 이해 뛰어남
3. ✅ **다국어 코드 지원** - Java, JS, HTML 모두 강함
4. ⚠️ **Tool calling은 실험적**

### 설치 및 설정
```bash
ollama pull deepseek-coder-v2:16b
export OLLAMA_MODEL="deepseek-coder-v2:16b"
```

### 특징
- 코드 품질 분석 자체는 가장 정확
- Tool calling workflow는 qwen2.5보다 약할 수 있음
- 모델 크기가 커서 느릴 수 있음 (16B)

---

## 🎯 최종 추천 순위

### 당신의 use case: "소스코드 품질을 점검해줘"

1. **🥇 qwen2.5:14b** ⭐⭐⭐⭐⭐
   - **Best for**: Multi-step workflow + 코드 분석 + 리포팅
   - **이유**: Tool calling과 코드 분석의 균형이 가장 좋음
   - **속도**: 보통
   - **품질**: 높음

2. **🥈 llama3.1:8b** ⭐⭐⭐⭐
   - **Best for**: 빠른 피드백이 중요한 경우
   - **이유**: Tool calling은 안정적, 코드 분석은 조금 약함
   - **속도**: 빠름
   - **품질**: 중상

3. **🥉 deepseek-coder-v2:16b** ⭐⭐⭐⭐
   - **Best for**: 최고 수준의 코드 분석이 필요한 경우
   - **이유**: 코드 이해는 최고, tool workflow는 불안정할 수 있음
   - **속도**: 느림
   - **품질**: 최고 (코드 부분)

---

## 🔄 비교 테스트

같은 프롬프트로 3개 모델 비교:

```bash
# 테스트 프롬프트
"src/main/java/ 디렉토리의 모든 Java 파일에서
 NullPointerException 위험이 있는 코드를 찾아서 리포트해줘"
```

### 예상 결과

**qwen2.5:14b**
```
✅ 디렉토리 탐색
✅ .java 파일 10개 발견
✅ 각 파일 읽기
✅ NPE 위험 코드 5개 발견
✅ 상세 리포트 작성 (파일별, 라인별, 수정 제안)
```

**llama3.1:8b**
```
✅ 디렉토리 탐색
✅ .java 파일 10개 발견
✅ 각 파일 읽기
⚠️ NPE 위험 코드 3개 발견 (일부 놓침)
✅ 간단한 리포트 작성
```

**deepseek-coder-v2:16b**
```
⚠️ 디렉토리 탐색 (tool calling 불안정할 수 있음)
✅ .java 파일 읽기 성공 시
✅ NPE 위험 코드 6개 발견 (가장 정확)
✅ 매우 상세한 기술 분석
⚠️ 하지만 workflow 중간에 멈출 수 있음
```

---

## 💡 실전 조언

### Option 1: qwen2.5:14b만 사용 (추천)
```bash
ollama pull qwen2.5:14b
export OLLAMA_MODEL="qwen2.5:14b"

# 모든 작업을 이 모델로
activo-code
```

### Option 2: 용도별 모델 스위칭
```bash
# 1. 빠른 탐색/간단한 점검: llama3.1:8b
export OLLAMA_MODEL="llama3.1:8b"
activo-code
> "src/ 디렉토리 구조를 보여주고 주요 파일들 나열해줘"

# 2. 심층 코드 분석: qwen2.5:14b
export OLLAMA_MODEL="qwen2.5:14b"
activo-code
> "src/main/java/com/example/UserService.java의
   보안 취약점을 상세히 분석해줘"

# 3. 특정 코드 패턴 검색: deepseek-coder-v2:16b
export OLLAMA_MODEL="deepseek-coder-v2:16b"
activo-code
> "이 파일에서 SQL injection 위험이 있는 코드를 찾아줘"
```

### Option 3: 하이브리드 접근
```bash
# 첫 번째 패스: llama3.1:8b (빠른 스캔)
# 두 번째 패스: qwen2.5:14b (발견된 이슈 상세 분석)
```

---

## 📊 성능 비교표

| 항목 | qwen2.5:14b | llama3.1:8b | deepseek-coder-v2:16b | qwen2.5-coder:14b |
|------|-------------|-------------|----------------------|-------------------|
| **Tool Calling** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **코드 분석** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **리포트 작성** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Multi-step** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **속도** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **메모리** | 8GB | 5GB | 10GB | 8GB |
| **종합 점수** | **19/25** | 18/25 | 17/25 | 14/25 |

---

## 🚀 즉시 시작하기

### 추천 설정
```bash
# 1. qwen2.5:14b 다운로드
ollama pull qwen2.5:14b

# 2. 환경 변수 설정 (영구 적용)
echo 'export OLLAMA_MODEL="qwen2.5:14b"' >> ~/.zshrc
source ~/.zshrc

# 3. 테스트
activo-code
```

### 첫 번째 프롬프트
```
src/ 디렉토리의 모든 Java, JavaScript, HTML 파일을 스캔해서
다음 항목별로 품질 점검해줘:

1. 코드 스타일 (naming, formatting)
2. 잠재적 버그 (null checks, error handling)
3. 보안 이슈 (injection, XSS)
4. 성능 문제 (N+1 query, 불필요한 loop)

각 파일별로 점수(1-10)와 상위 3개 개선 사항을 markdown 표로 정리해줘.
```

---

## 결론

**"소스코드 품질을 점검해줘"라는 요청에는 `qwen2.5:14b`가 최적입니다.**

이유:
- ✅ Multi-step tool calling 안정적
- ✅ 코드 분석 품질 충분
- ✅ 종합 리포트 작성 능력 우수
- ✅ 크기 대비 최고 성능
- ✅ 한국어 프롬프트 잘 이해

qwen2.5-coder:14b는 "특정 함수 리팩토링"처럼 single-step 코드 작업에는 최고지만,
디렉토리 탐색 → 분석 → 리포트 같은 workflow에는 qwen2.5:14b가 훨씬 낫습니다.
