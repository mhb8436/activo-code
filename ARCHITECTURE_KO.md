# Ollama Code 아키텍처 분석

> 이 문서는 Ollama Code 코드베이스의 거시적 아키텍처와 동작 방식을 설명합니다.

## 📋 개요

**Ollama Code**는 로컬 Ollama 모델을 사용하는 프라이버시 중심의 AI 기반 개발 도구입니다. Google Gemini CLI에서 시작하여 Qwen Code로 포크된 후, 현재는 Ollama 전용으로 수정되었습니다.

**핵심 특징**: 모든 코드와 데이터가 로컬 환경에서만 처리되어 완전한 프라이버시를 보장합니다.

---

## 🏗️ 전체 시스템 아키텍처

```
사용자 입력 (터미널)
    ↓
┌──────────────────────────────────────────┐
│  CLI Layer (packages/cli)               │
│  - React + Ink 기반 터미널 UI            │
│  - 명령어 파싱 및 설정 관리               │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│  Core Engine (packages/core)            │
│  ┌────────────────────────────────────┐ │
│  │ 설정 & 인증 시스템                  │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ AI 모델 인터페이스                  │ │
│  │ - OpenAI/Ollama 호환               │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ 대화 관리 시스템                    │ │
│  │ - 히스토리 & 토큰 관리              │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ 도구 레지스트리 (10+ 도구)          │ │
│  │ - read, write, edit, shell 등      │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│  Ollama 서버 (로컬)                      │
│  http://localhost:11434/v1              │
└──────────────────────────────────────────┘
```

---

## 🔄 실행 흐름 (거시적 관점)

### 1️⃣ 시작 단계

```
사용자가 'ollama-code' 실행
    ↓
scripts/start.js → packages/cli/src/gemini.tsx::main()
    ↓
설정 파일 로드 (~/.config/ollama-code/)
    ↓
환경 변수 확인 (OLLAMA_BASE_URL, OLLAMA_MODEL 등)
    ↓
Ollama 서버 연결 확인
```

### 2️⃣ 인터랙티브 모드 (기본)

```
터미널이 TTY인지 확인
    ↓
React + Ink로 터미널 UI 렌더링
    ↓
사용자가 프롬프트 입력
    ↓
메시지 → Ollama API로 전송
    ↓
스트리밍 응답 받기
    ↓
AI가 도구 호출 제안 (파일 읽기, 편집 등)
    ↓
사용자 확인 대화상자 표시
    ↓
승인 시 도구 실행 → 결과를 AI에게 반환
    ↓
최종 응답 표시
```

### 3️⃣ 논인터랙티브 모드 (파이프/스크립트)

```
stdin으로 입력 받기
    ↓
UI 없이 직접 실행
    ↓
도구 자동 승인 (설정에 따라)
    ↓
stdout으로 결과 출력
```

---

## 📦 핵심 패키지 구조

### packages/cli/ - 사용자 인터페이스

**역할**: 명령줄 인터페이스, 터미널 UI, 사용자 입력 처리

**주요 기술**: React, Ink (터미널용 React), yargs (CLI 파싱)

**핵심 파일**:
- `src/gemini.tsx` - 메인 진입점
- `src/ui/App.tsx` - React 기반 UI 컴포넌트
- `src/nonInteractiveCli.ts` - 비대화형 모드 처리

**주요 디렉토리**:

| 디렉토리 | 목적 |
|---------|------|
| `src/config/` | 설정 로드, 인증 검증, 설정 관리 |
| `src/ui/` | 터미널 UI용 React 컴포넌트 |
| `src/ui/hooks/` | 커스텀 React 훅 (useGeminiStream 등) |
| `src/ui/components/` | 재사용 가능한 UI 컴포넌트 |
| `src/utils/` | CLI 유틸리티 |

### packages/core/ - 핵심 엔진

**역할**: AI 모델 통신, 도구 실행, 대화 관리

**핵심 컴포넌트**:
- `src/core/openaiContentGenerator.ts` - Ollama API 클라이언트
- `src/core/client.ts` - 대화 히스토리 및 상태 관리
- `src/tools/` - 10+ 내장 도구
- `src/services/` - 파일 검색, Git 통합 등

**주요 디렉토리**:

| 디렉토리 | 목적 |
|---------|------|
| `src/config/` | Config 클래스, 모델 정의, content generator 팩토리 |
| `src/core/` | GeminiClient, ContentGenerator, 대화 관리 |
| `src/tools/` | 도구 구현 (read-file, shell, edit, glob, grep, mcp 등) |
| `src/services/` | FileDiscoveryService, GitService |
| `src/telemetry/` | 로깅, 메트릭, 분석 |
| `src/utils/` | 검증, 에러 처리, 프롬프트 헬퍼 |

### packages/vscode-ide-companion/ - VS Code 통합

**역할**: IDE 확장 기능 (옵션, CLI와 별도)

---

## 🔌 Ollama 연결 방식

### 연결 흐름

**파일**: `packages/core/src/core/openaiContentGenerator.ts`

```typescript
// 1. 환경 변수에서 URL 가져오기
const baseURL =
  process.env.OLLAMA_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  'http://localhost:11434/v1';  // 기본값

// 2. OpenAI SDK를 사용하여 연결
this.client = new OpenAI({
  apiKey: this.apiKey,
  baseURL,  // Ollama 서버 URL
  timeout: 120000,
  maxRetries: 3,
});

// 3. OpenAI 호환 API로 요청
POST /v1/chat/completions
{
  model: "qwen2.5-coder:14b",
  messages: [...],
  tools: [...]  // 사용 가능한 도구 목록
}

// 4. 스트리밍 응답 수신 및 처리
```

### 설정 우선순위

```
1. CLI 인자 (--model qwen2.5-coder)
    ↓
2. 환경 변수 (OLLAMA_MODEL, OLLAMA_BASE_URL)
    ↓
3. 설정 파일 (~/.config/ollama-code/config.json)
    ↓
4. 기본값 (qwen2.5-coder:14b)
```

### 주요 환경 변수

- `OLLAMA_BASE_URL` - Ollama 서버 엔드포인트 (기본: `http://localhost:11434/v1`)
- `OLLAMA_API_KEY` - 인증 키 (기본: `'ollama'`)
- `OLLAMA_MODEL` - 모델 이름 (예: `qwen2.5-coder:14b`)

---

## 🛠️ 도구 시스템 (Tool System)

### 도구 인터페이스

**파일**: `packages/core/src/tools/tools.ts`

```typescript
interface Tool<TParams, TResult> {
  name: string;              // "edit", "read-file", "shell" 등
  displayName: string;       // 사용자 친화적 이름
  description: string;       // 도구 설명
  schema: FunctionDeclaration; // JSON Schema
  validateToolParams(params): string | null;
  shouldConfirmExecute(params): ToolCallConfirmationDetails | false;
  execute(params, signal): Promise<ToolResult>;
}
```

### 내장 도구 (10+개)

| 도구 이름 | 파일 위치 | 기능 |
|---------|----------|------|
| ReadFileTool | `read-file.ts` | 파일 읽기 |
| WriteFileTool | `write-file.ts` | 파일 생성/덮어쓰기 |
| EditTool | `edit.ts` | 파일 수정 (diff 기반) |
| ShellTool | `shell.ts` | 쉘 명령 실행 |
| GlobTool | `glob.ts` | 패턴으로 파일 찾기 |
| GrepTool | `grep.ts` | 파일 내용 검색 |
| LSTool | `ls.ts` | 디렉토리 목록 조회 |
| ReadManyFilesTool | `read-many-files.ts` | 여러 파일 일괄 읽기 |
| WebFetchTool | `web-fetch.ts` | 웹 콘텐츠 가져오기 |
| MemoryTool | `memoryTool.ts` | 지속적 메모리 저장/조회 |
| MCPTool | `mcp-tool.ts` | Model Context Protocol 도구 |

### 도구 실행 흐름

```
AI가 도구 호출 제안
    ↓
도구 파라미터 검증 (validateToolParams)
    ↓
확인 필요 여부 확인 (shouldConfirmExecute)
    ↓
[인터랙티브 모드] 사용자 확인 대화상자
  - 도구 이름 및 목적
  - 파일 경로 또는 실행할 명령
  - Diff 미리보기 (편집의 경우)
    ↓
사용자 승인/거부/편집
    ↓
도구 실행 (execute)
    ↓
결과를 FunctionResponse로 변환
    ↓
다음 메시지에서 AI에게 전송
    ↓
AI가 결과를 바탕으로 다음 응답 생성
```

### 도구 실행 예시: EditTool

```typescript
// 1. AI가 함수 호출 생성
{
  name: "edit",
  args: {
    file_path: "/app/src/index.ts",
    new_content: "...",
    description: "명확성을 위한 함수 리팩토링"
  }
}

// 2. 도구가 파라미터 검증
EditTool.validateToolParams(args) // 파일 존재 확인 등

// 3. 확인 정보 생성
const diff = computeDiff(oldContent, newContent)
shouldConfirmExecute() returns {
  type: 'edit',
  fileName: "/app/src/index.ts",
  fileDiff: "< old\n> new"
}

// 4. 사용자 승인

// 5. 실행
EditTool.execute(args)

// 6. 결과
{
  llmContent: [{ text: "파일이 성공적으로 수정되었습니다" }],
  returnDisplay: "사용자를 위한 Diff 미리보기"
}
```

---

## 💬 대화 관리 및 메시지 흐름

### 완전한 대화 턴

```
┌─────────────────────────────────────────────┐
│ 1. 사용자 입력                               │
│    "main.go 파일을 분석하고 최적화 제안해줘"  │
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│ 2. 메시지 구성                               │
│    - 시스템 프롬프트 + 프로젝트 컨텍스트      │
│    - 사용자 메시지                           │
│    - 대화 히스토리 (필요시 압축)              │
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│ 3. Ollama API 요청                          │
│    POST /v1/chat/completions                │
│    {                                        │
│      "model": "qwen2.5-coder:14b",         │
│      "messages": [...],                    │
│      "tools": [...]                        │
│    }                                        │
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│ 4. Ollama 처리                              │
│    - 모델이 응답 생성                        │
│    - 도구 호출 필요 여부 결정                 │
│    - 스트리밍 청크 반환                      │
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│ 5. 응답 스트리밍                             │
│    for each chunk in stream:                │
│      - 텍스트 추출 (있는 경우)               │
│      - 함수 호출 누적                        │
│      - 실시간 텍스트 표시                    │
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│ 6. 함수 호출 감지                            │
│    if response.functionCalls.length > 0:    │
│      - 함수 이름 및 인자 파싱                │
│      - 각 호출에 대해: shouldConfirmExecute()│
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│ 7. 사용자 확인 (인터랙티브 모드)              │
│    - 도구 호출 대화상자 표시                  │
│    - 사용자: 진행/항상 진행/취소              │
│    - 수정 가능한 도구: 파라미터 편집 가능      │
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│ 8. 도구 실행                                 │
│    executeToolCall(toolName, args)          │
│    {                                        │
│      - 파라미터 검증                         │
│      - 도구 실행                             │
│      - 출력/결과 캡처                        │
│      - FunctionResponse로 변환               │
│    }                                        │
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│ 9. 피드백 루프                               │
│    함수 응답을 API로 다시 전송:               │
│    {                                        │
│      "role": "user",                       │
│      "parts": [{                           │
│        "functionResponse": {               │
│          "name": "read_file",              │
│          "response": { content: "..." }    │
│        }                                    │
│      }]                                     │
│    }                                        │
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│ 10. 대화 계속                                │
│     더 이상 함수 호출이 없을 때까지 3단계로    │
│     루프하고 최종 텍스트 응답을 사용자에게     │
│     반환                                     │
└─────────────────────────────────────────────┘
```

### 대화 히스토리 관리

**파일**: `packages/core/src/core/client.ts` (GeminiClient)

```typescript
class GeminiClient {
  private sessionTurnCount = 0;
  private readonly COMPRESSION_TOKEN_THRESHOLD = 0.7;

  // 다중 턴 대화 관리:
  // 1. 채팅 히스토리 유지
  // 2. 토큰 제한에 접근하면 오래된 메시지 압축
  // 3. AI 요약을 사용한 압축 처리
  // 4. 히스토리에서 유효한 턴 추출
}
```

**토큰 관리**:
- 대화 히스토리 토큰 수 모니터링
- 제한에 가까워지면 오래된 턴 압축
- AI를 사용하여 이전 컨텍스트 요약
- 연속성을 위해 최근 컨텍스트 유지

---

## 🎨 주요 기술 스택

### 프레임워크 & 라이브러리

| 계층 | 기술 | 용도 |
|-----|------|------|
| **UI** | React + Ink | 터미널 UI 렌더링 |
| **언어** | TypeScript | 타입 안전 코드베이스 |
| **AI 통신** | OpenAI SDK | Ollama API 클라이언트 (OpenAI 호환) |
| **CLI** | yargs | CLI 인자 파싱 |
| **패키지 관리** | npm workspaces | 모노레포 구조 |
| **MCP** | MCP SDK | Model Context Protocol 지원 |
| **관찰성** | OpenTelemetry | 텔레메트리 & 관찰성 |
| **테스팅** | Vitest | 단위 및 통합 테스트 |

### 디자인 패턴

1. **전략 패턴** (Strategy Pattern)
   - `ContentGenerator` 인터페이스와 여러 구현체
   - `OpenAIContentGenerator` (Ollama용)
   - `GeminiContentGenerator` (Google용)

2. **레지스트리 패턴** (Registry Pattern)
   - `ToolRegistry`로 동적 도구 관리
   - 도구가 메타데이터로 자체 등록
   - 런타임에 이름으로 조회

3. **스트림 기반 처리**
   - 비동기 제너레이터 패턴
   - API에서 스트리밍 응답
   - 실시간 UI 업데이트
   - 청크 단위 처리

4. **확인 체인** (Confirmation Chain)
   - 실행 전 다단계 검증
   - 검증 → 확인 → 실행 → 결과

5. **컨텍스트 기반 설정**
   - 계층적 설정
   - CLI 인자 > 환경 변수 > 설정 파일 > 기본값

---

## 🔐 인증 및 설정

### 인증 타입

```typescript
enum AuthType {
  LOGIN_WITH_GOOGLE = 'oauth-personal'  // OAuth2 리디렉션
  USE_GEMINI = 'gemini-api-key'        // Google API 키
  USE_VERTEX_AI = 'vertex-ai'          // Google Cloud
  CLOUD_SHELL = 'cloud-shell'          // GCP Cloud Shell
  USE_OPENAI = 'openai'                // OpenAI/Ollama API 키
}
```

**Ollama의 경우**: 일반적으로 `AuthType.USE_OPENAI` 사용

### 설정 계층 구조

```
1. CLI 인자 (--model, --debug 등)
   ↓
2. 환경 변수 (OLLAMA_*, OPENAI_*)
   ↓
3. 설정 파일 (~/.config/ollama-code/)
   ↓
4. 내장 기본값
```

### 설정 파일 구조

```json
{
  "selectedAuthType": "openai",
  "model": "qwen2.5-coder:14b",
  "baseUrl": "http://localhost:11434/v1",
  "approvalMode": "default",
  "excludeTools": [],
  "theme": "dark",
  "autoSave": true
}
```

---

## 🚀 실행 모드

### 인터랙티브 모드 (기본)

- **TTY 감지**: `process.stdin.isTTY`
- **React/Ink UI 렌더링**
- **사용자 확인 및 편집**
- **실시간 스트리밍 표시**
- **채팅 히스토리 지속성**
- **테마/설정 관리**

### 논인터랙티브 모드 (파이프 입력)

- **TTY 불필요**
- **ApprovalMode에 따른 자동 승인**:
  - `DEFAULT`: 확인 요청
  - `AUTO_EDIT`: 편집 자동 승인
  - `YOLO`: 모두 자동 승인
- **stdout으로 직접 출력**
- **CI/CD 파이프라인에 적합**
- **종료 코드로 성공/실패 표시**

---

## 🔍 에러 처리 및 검증

### 검증 계층

1. **파라미터 검증**: 각 도구가 입력 검증
2. **스키마 검증**: 도구 파라미터의 JSON Schema 검증
3. **실행 검증**: 도구 실행 주변 try-catch
4. **API 에러 처리**: 할당량 감지, 타임아웃 처리
5. **사용자 피드백**: 명확한 에러 메시지 및 복구 제안

---

## 📊 핵심 실행 파일

### 진입점

| 파일 | 역할 |
|-----|------|
| `scripts/start.js` | 개발 모드 시작 스크립트 |
| `packages/cli/src/gemini.tsx` | 메인 진입점 - `main()` 함수 |
| `packages/cli/src/nonInteractiveCli.ts` | 논인터랙티브 모드 처리 |

### 핵심 컴포넌트

| 파일 | 역할 |
|-----|------|
| `packages/core/src/core/openaiContentGenerator.ts` | Ollama API 클라이언트 |
| `packages/core/src/core/client.ts` | 대화 관리 (GeminiClient) |
| `packages/core/src/tools/tool-registry.ts` | 도구 레지스트리 |
| `packages/core/src/core/nonInteractiveToolExecutor.ts` | 도구 실행 로직 |
| `packages/cli/src/ui/App.tsx` | React UI 메인 컴포넌트 |

---

## 🔐 프라이버시 보장 방식

Ollama Code가 **프라이버시 우선 AI 지원 개발**을 가능하게 하는 방법:

1. **로컬 처리**: 모든 AI 추론이 로컬 Ollama 서버에서 실행
2. **외부 전송 없음**: 코드가 외부 서비스로 전송되지 않음
3. **텔레메트리 없음**: 사용 데이터가 외부로 전송되지 않음
4. **코드 격리**: 소스 코드가 환경을 벗어나지 않음
5. **완전한 제어**: 처리 및 데이터에 대한 완전한 가시성
6. **오프라인 기능**: 모델 다운로드 후 인터넷 의존성 없음
7. **엔터프라이즈 준비**: 민감한 코드베이스 및 에어갭 환경에 적합

---

## 🎯 요약

### Ollama Code의 핵심 동작 방식

1. **사용자가 터미널에서 질문/요청 입력**
2. **React/Ink 기반 UI가 입력 처리 및 렌더링**
3. **Core 엔진이 메시지를 Ollama API로 전송**
4. **Ollama가 로컬에서 AI 모델 실행 (완전 프라이버시)**
5. **AI가 필요시 도구 호출 제안**
   - 파일 읽기/쓰기/편집
   - 쉘 명령 실행
   - 파일 검색 및 패턴 매칭
   - 웹 콘텐츠 가져오기
   - 외부 MCP 도구
6. **사용자 확인 후 도구 실행**
7. **결과를 AI에게 반환하여 다음 단계 진행**
8. **최종 응답을 터미널에 표시**

**이 모든 과정이 로컬 환경에서만 진행되어 코드가 외부로 유출되지 않습니다.**

---

## 📚 추가 참고 자료

- **README.md** - 프로젝트 개요 및 시작 가이드
- **CONTRIBUTING.md** - 기여 가이드라인
- **packages/cli/src/** - CLI 구현 세부사항
- **packages/core/src/** - 핵심 엔진 구현 세부사항

---

*이 문서는 코드베이스 분석을 통해 작성되었습니다. 구현이 변경될 수 있으므로 최신 코드를 참조하세요.*
