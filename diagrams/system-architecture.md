# System Architecture Diagrams

## High-Level System Flow

```mermaid
graph TB
    subgraph "Client"
        UI[React UI]
        Auth[Auth State]
    end

    subgraph "Next.js Server"
        API[API Routes]
        SSR[Server Components]
        Auth2[NextAuth.js]
    end

    subgraph "OpenAI APIs"
        Chat[Chat Completions API]
        Resp[Responses API]
        Img[Images API]
    end

    subgraph "External Services"
        LDAP[University LDAP]
    end

    subgraph "Database"
        DB[(PostgreSQL/SQLite)]
    end

    subgraph "Storage"
        Files[File System]
    end

    UI -->|HTTP/SSE| API
    UI --> SSR
    Auth --> Auth2
    
    API -->|GPT-4, o1, o3| Chat
    API -->|GPT-5 family| Resp
    API -->|DALL-E| Img
    
    Auth2 -->|Authenticate| LDAP
    API --> DB
    API --> Files
    
    Chat -->|Streaming| API
    Resp -->|Streaming/Non-streaming| API
    Img -->|Base64| API
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant NextAuth
    participant LDAP
    participant Database

    User->>NextAuth: Login (username, password)
    NextAuth->>LDAP: Authenticate user
    LDAP-->>NextAuth: User data (email, name, groups)
    
    alt User exists
        NextAuth->>Database: Update user info
    else New user
        NextAuth->>Database: Create user (auto-provision)
    end
    
    Database-->>NextAuth: User record
    NextAuth-->>User: JWT session token
    User->>User: Store session in cookie
```

## Multi-Model Chat Flow

```mermaid
graph LR
    subgraph "User Request"
        Msg[User Message]
        Model{Model Selected?}
    end

    subgraph "Model Router"
        Catalog[Model Catalog]
        APIType{"API Type?"}
    end

    subgraph "Processing"
        ChatAPI[Chat API Handler]
        RespAPI[Responses API Handler]
        ImgAPI[Image API Handler]
    end

    subgraph "OpenAI"
        ChatComplete[chat.completions]
        RespStream[responses.stream]
        ImgGen[images.generate]
    end

    Msg --> Model
    Model --> Catalog
    Catalog --> APIType
    
    APIType -->|chat| ChatAPI
    APIType -->|responses| RespAPI
    APIType -->|image| ImgAPI
    
    ChatAPI --> ChatComplete
    RespAPI --> RespStream
    ImgAPI --> ImgGen
    
    ChatComplete -->|Stream SSE| User
    RespStream -->|Stream SSE| User
    ImgGen -->|Base64 PNG| User
```

## File Processing Pipeline

```mermaid
graph TD
    Upload[File Upload] --> Validate{Valid Type?}
    
    Validate -->|No| Reject[Reject - Error]
    Validate -->|Yes| Store[Save to Filesystem]
    
    Store --> TypeCheck{File Type?}
    
    TypeCheck -->|Image| Vision[Load as DataURL]
    TypeCheck -->|PDF| PDFExtract[Extract Text - pdf-parse]
    TypeCheck -->|DOCX| DOCXExtract[Extract Text - mammoth]
    TypeCheck -->|TXT/MD| ReadText[Read as UTF-8]
    
    Vision --> Context[Add to Chat Context]
    PDFExtract --> Limit[Limit to 10k chars]
    DOCXExtract --> Limit
    ReadText --> Limit
    
    Limit --> Context
    Context --> ChatAPI[Send to Chat API]
```

## Database Schema (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ CHAT_SESSION : owns
    USER ||--o{ USAGE_STATS : tracks
    USER ||--o{ CUSTOM_STYLE : creates
    CHAT_SESSION ||--o{ MESSAGE : contains
    MESSAGE ||--o{ ATTACHMENT : has
    
    USER {
        string id PK
        string email UK
        string username UK
        enum role
        datetime createdAt
    }
    
    CHAT_SESSION {
        string id PK
        string userId FK
        string title
        string group
        datetime updatedAt
    }
    
    MESSAGE {
        string id PK
        string sessionId FK
        enum role
        string content
        int tokensUsed
        int costInCents
        string model
        datetime createdAt
    }
    
    ATTACHMENT {
        string id PK
        string messageId FK
        enum type
        string name
        string mimeType
        int size
        string localPath
        string extractedText
    }
    
    USAGE_STATS {
        string id PK
        string userId FK
        date date
        string model
        int tokensUsed
        int messagesCount
        int costInCents
    }
    
    CUSTOM_STYLE {
        string id PK
        string userId FK
        string name
        string systemPrompt
    }
```

## Request-Response Cycle

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Prisma
    participant OpenAI

    Client->>API: POST /api/chat (message, model, files)
    API->>API: Validate session
    API->>Prisma: Create user message
    Prisma-->>API: Message ID
    
    API->>API: Process files (extract text)
    API->>Prisma: Save attachments
    API->>Prisma: Fetch conversation history
    Prisma-->>API: Last 30 messages
    
    API->>API: Convert to API format
    API->>OpenAI: Stream request
    
    loop Token streaming
        OpenAI-->>API: Token chunk
        API-->> Client: SSE event (token)
    end
    
    OpenAI-->>API: Stream complete + usage
    API->>API: Calculate cost
    API->>Prisma: Save assistant message
    API->>Prisma: Update usage stats
    API-->>Client: SSE event (done)
```

## Cost Tracking Flow

```mermaid
graph TD
    ChatComplete[Chat Completed] --> Extract[Extract Usage Data]
    Extract --> Input[Input Tokens]
    Extract --> Output[Output Tokens]
    
    Input --> Price[Get Model Pricing]
    Output --> Price
    
    Price --> Calc[Calculate Cost in Cents]
    Calc --> Save[Save to Message]
    Save --> Aggregate[Aggregate to UsageStats]
    
    Aggregate --> Daily[Daily Total]
    Aggregate --> Monthly[Monthly Total]
    Aggregate --> PerModel[Per-Model Breakdown]
    
    Daily --> Dashboard[Admin Dashboard]
    Monthly --> Dashboard
    PerModel --> Dashboard
    
    Dashboard --> Alerts{Over Budget?}
    Alerts -->|Yes| Notify[Alert Admin]
    Alerts -->|No| Continue[Continue Monitoring]
```

## Rate Limiting Logic

```mermaid
graph TD
    Request[User Makes Request] --> GetLimits[Fetch Rate Limits for User Role]
    GetLimits --> CheckDaily{Daily Limit?}
    
    CheckDaily -->|No Limit| CheckMonthly{Monthly Limit?}
    CheckDaily -->|Has Limit| QueryDaily[Query Today's Usage]
    
    QueryDaily --> CompareDaily{Usage >= Limit?}
    CompareDaily -->|Yes| RejectDaily[429: Daily limit reached]
    CompareDaily -->|No| CheckMonthly
    
    CheckMonthly -->|No Limit| Proceed[Process Request]
    CheckMonthly -->|Has Limit| QueryMonthly[Query This Month's Usage]
    
    QueryMonthly --> CompareMonthly{Usage >= Limit?}
    CompareMonthly -->|Yes| RejectMonthly[429: Monthly limit reached]
    CompareMonthly -->|No| Proceed
    
    Proceed --> SaveUsage[Track Usage]
    SaveUsage --> Success[Return Response]
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "User Devices"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Load Balancer/CDN"
        HTTPS[HTTPS/SSL]
        Cache[Static Asset Cache]
    end

    subgraph "Application Server"
        Next[Next.js Server]
        Container[Docker Container]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        Files[File Storage]
        Secrets[Secrets Manager]
    end

    subgraph "External"
        OpenAI[OpenAI API]
        LDAP[University LDAP]
    end

    Browser --> HTTPS
    Mobile --> HTTPS
    
    HTTPS --> Cache
    Cache --> Next
    Next --> Container
    
    Container --> PG
    Container --> Files
    Container --> Secrets
    
    Container --> OpenAI
    Container --> LDAP
```

---

## Component Interactions

### Model Selection Process

```mermaid
stateDiagram-v2
    [*] --> UserSelects
    UserSelects --> ValidateModel
    ValidateModel --> GetCatalog
    GetCatalog --> CheckAllowed
    
    CheckAllowed --> Allowed: Model in allowed list
    CheckAllowed --> Fallback: Not allowed
    
    Fallback --> DefaultModel
    DefaultModel --> GetAPI
    
    Allowed --> GetAPI
    GetAPI --> ChatAPI: api = "chat"
    GetAPI --> ResponsesAPI: api = "responses"
    GetAPI --> ImagesAPI: api = "image"
    
    ChatAPI --> GetMode
    ResponsesAPI --> GetMode
    ImagesAPI --> ProcessImage
    
    GetMode --> ApplyTuning
    ApplyTuning --> MakeRequest
    ProcessImage --> MakeRequest
    
    MakeRequest --> [*]
```

---

## Key Architectural Decisions

### 1. Next.js App Router
**Decision**: Use Next.js 15 with App Router (not Pages Router)

**Rationale**:
- Server components reduce client bundle
- Built-in API routes
- TypeScript-first
- SSR+CSR flexibility

### 2. Prisma ORM
**Decision**: Prisma with SQLite (dev) → PostgreSQL (prod)

**Rationale**:
- Type-safe database access
- Easy migrations
- Auto-generated types
- Good DX (schema.prisma)

### 3. LDAP Authentication
**Decision**: Integrate with university Active Directory

**Rationale**:
- No user management needed
- Reuse existing credentials
- Auto-provisioning
- Single sign-on experience

### 4. Database-Driven Rate Limiting
**Decision**: Store limits in database, not Redis

**Rationale**:
- Simpler deployment (no Redis needed)
- Adequate for 60-user pilot
- Easy admin changes (update DB row)
- Migrate to Redis if scaling to 1000+ users

### 5. Server-Side File Storage
**Decision**: Local filesystem, not S3/Cloud Storage

**Rationale**:
- Simpler for pilot (no cloud config)
- Lower latency for file access
- Easy migration to cloud later
- Adequate for moderate usage

---

**See Also**:
- [API Architecture](../docs/04-api-architecture.md) - Detailed API integration
- [Security & Compliance](../docs/09-security-compliance.md) - Production deployment
- [Code Examples](../code-examples/) - Implementation details
