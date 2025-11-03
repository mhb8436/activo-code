# qwen2.5-coder:14b 효과적인 프롬프팅 가이드

## 🎯 핵심 원칙

1. **구체적인 파일/경로 지정** - 모델이 탐색하지 않고 바로 작업
2. **단일 작업 요청** - Multi-step 대신 one-shot
3. **명확한 출력 형식 지정** - 모델이 무엇을 출력할지 명확히
4. **코드 중심 질문** - Tool calling보다 코드 분석/생성에 집중

---

## 📝 카테고리별 예제

### 1. 코드 분석 (Code Analysis)

#### ❌ 비효율적
```
모든 TypeScript 파일을 읽고 분석해줘
```
**문제:** 너무 광범위, multi-step 필요

#### ✅ 효율적
```
packages/core/src/core/openaiContentGenerator.ts 파일을 읽고,
parseOllamaToolCall 함수가 어떻게 동작하는지 설명해줘
```
**이유:**
- 구체적 파일 지정
- 특정 함수 타겟팅
- 단일 작업 (읽기 → 설명)

#### ✅ 더 나은 예제
```
src/app/api/scores/route.ts 파일의 POST 핸들러를 읽고,
어떤 validation을 수행하는지 코드로 보여줘
```

---

### 2. 버그 수정 (Bug Fixing)

#### ❌ 비효율적
```
에러가 나는데 원인을 찾아서 고쳐줘
```
**문제:** 탐색 → 진단 → 수정 (multi-step)

#### ✅ 효율적
```
src/lib/prisma.ts:15 라인에서 "Cannot find module 'prisma'" 에러가 나.
import 문을 고쳐줘
```
**이유:**
- 정확한 위치 지정
- 에러 메시지 제공
- 명확한 수정 범위

#### ✅ 더 나은 예제
```
packages/cli/src/ui/components/AsciiArt.ts 파일에서
longAsciiLogo 변수를 "ACTIVO CODE" ASCII art로 바꿔줘
```

---

### 3. 코드 작성 (Code Generation)

#### ❌ 비효율적
```
사용자 인증 기능을 추가해줘
```
**문제:** 어디에, 어떤 패턴으로? 불명확

#### ✅ 효율적
```
src/app/api/auth/login/route.ts 파일을 만들고,
email/password 받아서 JWT 토큰 반환하는 Next.js API handler 작성해줘.
이 프로젝트의 src/app/api/scores/route.ts 패턴을 따라줘.
```
**이유:**
- 정확한 파일 경로
- 명확한 기능 명세
- 기존 패턴 참조

#### ✅ 더 나은 예제
```
src/context/AuthContext.js 파일을 만들어줘.
PointsContext.js와 같은 구조로,
user 상태(id, email, name)를 관리하는 Context를 작성해줘.
```

---

### 4. 리팩토링 (Refactoring)

#### ❌ 비효율적
```
코드를 개선해줘
```
**문제:** 범위/목표 불명확

#### ✅ 효율적
```
src/app/page.js의 QuizQuestion 컴포넌트를 읽고,
useState 대신 useReducer로 리팩토링해줘.
현재 로직은 그대로 유지.
```
**이유:**
- 구체적 파일/컴포넌트
- 명확한 리팩토링 목표
- 제약사항 명시

#### ✅ 더 나은 예제
```
packages/core/src/core/openaiContentGenerator.ts의
parseOllamaToolCall 함수를 읽고,
중복된 regex 패턴을 상수로 추출해서 리팩토링해줘.
```

---

### 5. 탐색 및 검색 (Exploration)

#### ❌ 비효율적
```
에러 처리가 어떻게 되어있는지 알려줘
```
**문제:** 전체 프로젝트 탐색 필요

#### ✅ 효율적
```
"parseOllamaToolCall"이라는 텍스트를 포함하는 파일을 찾아서,
그 함수에서 어떤 에러 처리를 하는지 보여줘
```
**이유:**
- 구체적 검색어
- 명확한 출력 기대

#### ✅ 더 나은 예제
```
packages/ 디렉토리에서 "tool_calls" 문자열을 grep으로 찾고,
상위 3개 파일의 해당 부분 코드를 보여줘
```

---

### 6. 문서 작성 (Documentation)

#### ❌ 비효율적
```
README를 작성해줘
```
**문제:** 전체 프로젝트 분석 필요

#### ✅ 효율적
```
src/lib/prisma.ts 파일을 읽고,
이 파일 맨 위에 JSDoc 스타일 주석으로
PrismaClient 초기화 방식을 설명하는 주석을 추가해줘.
```
**이유:**
- 특정 파일
- 명확한 위치/형식
- 단일 작업

#### ✅ 더 나은 예제
```
packages/core/src/tools/read-file.js의 ReadFileTool 클래스를 읽고,
각 메서드에 JSDoc 주석을 추가해줘.
parameters, returns, example 포함.
```

---

### 7. 테스트 작성 (Testing)

#### ❌ 비효율적
```
테스트를 작성해줘
```
**문제:** 무엇을, 어떤 프레임워크로?

#### ✅ 효율적
```
src/lib/prisma.ts 파일을 읽고,
같은 디렉토리에 prisma.test.ts 파일을 만들어줘.
Jest로 PrismaClient 초기화를 테스트하는 코드 작성.
```
**이유:**
- 정확한 타겟
- 테스트 프레임워크 지정
- 파일 위치 명확

#### ✅ 더 나은 예제
```
packages/core/src/core/openaiContentGenerator.ts의
looksLikeTemplateToolCall 함수를 읽고,
이 함수를 테스트하는 유닛 테스트 5개를 작성해줘.
프로젝트의 다른 .test.ts 파일 패턴을 따라줘.
```

---

## 🎨 고급 팁

### Tip 1: 컨텍스트 제공
```
❌ "이 함수를 최적화해줘"

✅ "src/utils/parser.js의 parseJSON 함수를 읽어봐.
   이 함수는 초당 1000번 호출되는데 현재 너무 느려.
   정규식 대신 더 빠른 방법으로 최적화해줘."
```

### Tip 2: 예제 파일 참조
```
❌ "새로운 컴포넌트를 만들어줘"

✅ "src/app/page.js를 읽고 같은 스타일로,
   src/components/UserProfile.js 컴포넌트를 만들어줘.
   Props: {userId: string, onUpdate: () => void}"
```

### Tip 3: 점진적 작업
```
# 한 번에 하나씩
1. "src/app/api/users/route.ts에 GET handler 추가해줘"
   [완료 확인]
2. "같은 파일에 POST handler도 추가해줘"
   [완료 확인]
3. "이제 DELETE handler도 추가해줘"

❌ "src/app/api/users/route.ts에 CRUD 전부 구현해줘" (한번에)
```

### Tip 4: 출력 형식 지정
```
❌ "이 코드가 뭐하는지 알려줘"

✅ "src/lib/auth.ts를 읽고,
   다음 형식으로 설명해줘:
   1. 주요 기능 (bullet points)
   2. 사용하는 라이브러리
   3. 보안 취약점 (있다면)
   4. 개선 제안"
```

---

## 📊 질문 품질 체크리스트

좋은 질문인지 확인:

- [ ] 구체적인 파일 경로가 있는가?
- [ ] 요청이 1-2 단계로 완료 가능한가?
- [ ] 원하는 출력이 명확한가?
- [ ] 기존 코드 패턴을 참조했는가?
- [ ] 필요한 컨텍스트를 제공했는가?

---

## 🚀 실전 예제 모음

### 신규 프로젝트 이해하기
```bash
# Step 1: 엔트리 포인트 확인
"package.json을 읽고, main 파일 경로를 알려줘"

# Step 2: 메인 파일 분석
"packages/cli/src/index.ts를 읽고,
 주요 export들과 각각의 역할을 간단히 설명해줘"

# Step 3: 핵심 기능 파악
"packages/core/src/core/ 디렉토리의 파일 목록을 보여주고,
 각 파일이 담당하는 역할을 추측해서 알려줘"
```

### 버그 트러블슈팅
```bash
# Step 1: 에러 위치 특정
"packages/core/src/core/openaiContentGenerator.ts의
 1240번 라인 근처 코드를 보여줘"

# Step 2: 원인 분석
"이 코드에서 parsedToolCalls가 null일 때
 어떤 동작을 하는지 설명해줘"

# Step 3: 수정
"parsedToolCalls가 null이고 content가 template tool call이면
 parts에 추가하지 않도록 수정해줘"
```

### 기능 추가
```bash
# Step 1: 기존 패턴 확인
"packages/core/src/tools/ 디렉토리의 read-file.js를 읽고,
 Tool 클래스의 기본 구조를 보여줘"

# Step 2: 새 도구 작성
"같은 디렉토리에 delete-file.js를 만들어줘.
 read-file.js와 같은 구조로,
 파일 삭제 기능을 구현하되 안전 확인 추가."

# Step 3: 통합
"packages/core/src/tools/index.ts에
 DeleteFileTool을 export에 추가해줘"
```

---

## 💡 요약

**qwen2.5-coder:14b는 "코드 전문가"지 "AI 어시스턴트"가 아닙니다.**

따라서:
1. 파일을 직접 지정해주세요 (탐색 시키지 말고)
2. 코드 작성/분석/수정에 집중하세요
3. 한 번에 하나씩 작업하세요
4. 명확한 입력 → 명확한 출력

이렇게 하면 qwen2.5-coder:14b의 강력한 코드 능력을 최대한 활용할 수 있습니다!
