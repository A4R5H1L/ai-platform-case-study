# AI Platform - Enterprise Multi-Model Chat System

> **Enterprise multi-model AI platform** | Built for SAMK University

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Multi--API-412991?logo=openai)](https://openai.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16-2D3748?logo=prisma)](https://www.prisma.io/)

## 📸 Visual Showcase

### User Experience
<div align="center">
  <img src="roboai-images/login_screen.png" alt="Login Screen" width="400" />
</div>
<br/>
<div align="center">
  <img src="roboai-images/main_interface.png" alt="Main Interface" width="800" />
  <p><em>Sleek, modern Chat Interface powered by Next.js & Framer Motion</em></p>
</div>
<br/>

### Model Capabilities & Settings
<div align="center">
  <img src="roboai-images/normal_model.png" alt="Standard Model" width="400" />
  <img src="roboai-images/reasoning_model.png" alt="Reasoning Model" width="400" />
</div>
<div align="center">
  <img src="roboai-images/reasoning_refrence.png" alt="Reasoning Reference" width="800" />
  <p><em>Rich formatting with sources, thinking process, and code highlights</em></p>
</div>
<br/>
<div align="center">
  <img src="roboai-images/user_controls.png" alt="User Settings & Persistent Personas" width="800" />
  <p><em>Extensive user controls, including Custom Styles and default model mappings</em></p>
</div>

### Admin Tools & Governance
<div align="center">
  <img src="roboai-images/admin_dashboard.png" alt="Admin Dashboard Overview" width="800" />
  <img src="roboai-images/model_access.png" alt="Group Model Access" width="800" />
  <img src="roboai-images/white&black_list.png" alt="Access Control Management" width="800" />
  <p><em>Comprehensive administrative controls for model groupings, rate limiting, and exact user permissions</em></p>
</div>

---

## 🎯 Project Overview

An enterprise-grade AI chat platform demonstrating **sophisticated architecture**, **multi-model integration**, and **production-ready thinking**. Built as a cost-effective alternative to commercial ChatGPT licensing for a 60-user university pilot program.

### Key Achievements

🚀 **15+ AI Models Integrated**
- GPT-4 family (GPT-4o, GPT-4o-mini, GPT-4.1)
- o-series reasoning models (o1-mini, o1-preview, o3, o3-mini)
- **GPT-5 flagship** (GPT-5, GPT-5-mini, GPT-5-nano) with government ID verification
- Image generation (DALL-E 2, DALL-E 3, gpt-image-1)
- **Local Open-Source & Custom Models** (SAMK Qwen Integration, DeepSeek, Local Reasoning)

💰 **88% Cost Reduction**
- From: €23-60/user/month (ChatGPT Pro/Enterprise)
- To: ~€2.70/user/month (usage-based OpenAI API)
- Estimated savings: €13,116/year for 60 users (pending pilot validation)

⚡ **Advanced Features**
- Dual API architecture (Chat + Responses + Image APIs)
- 4-mode system per model (auto/instant/thinking/pro)
- Real-time streaming with Server-Sent Events
- Enterprise LDAP authentication
- Per-role rate limiting and cost tracking
- Full image generation with safety filtering
- Robust **Admin Dashboard** with custom Model Groups & User Access Control (Whitelist/Blacklist)
- Advanced categorized **Model Selection UI** with real-time search and icons
- Highly persistent User Preferences (Default Models, Custom Personas UI)

🏢 **Production Planning**
- Comprehensive security analysis (10 vulnerabilities documented)
- GDPR compliance roadmap (9 requirements mapped)
- Future roadmap (n8n workflows, Moodle LMS integration)

---

## 📊 Business Impact

### Problem
SAMK University needed AI chat capabilities for 60 staff and students, facing:
- **Fixed licensing costs**: €23/user (ChatGPT Pro) or €30-60/user (Enterprise)
- **Budget waste**: Light users subsidize heavy users
- **No cost visibility**: Can't track or optimize usage
- **Scalability concerns**: Linear cost growth per user

### Solution
Custom AI platform with:
- **Usage-based pricing**: Pay only for actual API calls
- **Multi-model support**: 13+ models for different use cases
- **Enterprise integration**: University LDAP authentication
- **Cost transparency**: Real-time usage tracking and analytics

### Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Cost (60 users)** | €1,380/month | €162/month | **88% reduction** |
| **Model options** | 1 (GPT-4) | 13+ models | **13x choice** |
| **Cost visibility** | None | Real-time | **Full transparency** |
| **Scalability** | Linear | Usage-based | **Optimal** |

**Estimated ROI**: Break-even in <1 month | Projected Year 1 savings: €13,116

---

## 🏗️ Architecture Highlights

### Multi-Model System

```
┌─────────────────┐
│  GPT-4 Family   │  GPT-4o, GPT-4o-mini, GPT-4.1
│                 │  Fast, reliable, vision-capable
└─────────────────┘

┌─────────────────┐
│  o-Series       │  o1-mini, o1-preview, o3, o3-mini
│  Reasoning      │  Advanced reasoning, complex problems
└─────────────────┘

┌─────────────────┐
│  GPT-5 Flagship │  GPT-5, GPT-5-mini, GPT-5-nano
│                 │  Cutting-edge with verbosity control
└─────────────────┘

┌─────────────────┐
│  Image Gen      │  DALL-E 2, DALL-E 3, gpt-image-1
│                 │  High-quality image generation
└─────────────────┘
```

### Dual API Integration

The platform supports **three OpenAI APIs**:

1. **Chat Completions API** - Traditional streaming chat (most models)
2. **Responses API** - GPT-5 family with reasoning effort control
3. **Images API** - DALL-E generation with safety filtering

**Fallback Strategy**: When GPT-5 streaming fails (organization not verified), automatically falls back to non-streaming mode.

### Tech Stack

**Frontend**:
- Next.js 15 (App Router) + React 19
- TypeScript for full type safety
- Tailwind CSS 4 + Framer Motion
- React Markdown + Prism.js for code highlighting

**Backend**:
- Next.js Route Handlers (serverless)
- Prisma ORM (SQLite dev → PostgreSQL production)
- NextAuth.js for session management
- LDAP integration for university SSO

**AI Integration**:
- OpenAI SDK 5.23 with streaming support
- Multi-API architecture (Chat, Responses, Image)
- Token counting and cost calculation
- Safety filtering for image generation

**Database**:
- 6 Prisma models (User, ChatSession, Message, Attachment, UsageStats, CustomStyle)
- GDPR-compliant schema with cascade deletes
- Per-user, per-day, per-model usage tracking

---

## ✨ Feature Showcase

### 1. Multi-Model Selection & Custom Local Run

Users can choose from diverse AI models grouped logically (Flagship, Reasoning, Image, Local) utilizing a powerful searchable model selector UI:

```typescript
// GPT-4 Family (Vision-capable)
GPT-4o-mini    $0.15/$0.60 per 1M tokens    // Fast, cost-effective
GPT-4o         $2.50/$10.00 per 1M tokens   // High-intelligence
GPT-4.1        $2.50/$10.00 per 1M tokens   // Enhanced reasoning

// o-Series Reasoning Models (Extended thinking)
o1-mini        $3.00/$12.00 + $12.00 reasoning per 1M tokens   // Efficient
o1-preview     $15.00/$60.00 + $60.00 reasoning per 1M tokens  // Advanced
o3             $20.00/$80.00 + $80.00 reasoning per 1M tokens  // Latest
o3-mini        $3.50/$14.00 + $14.00 reasoning per 1M tokens   // Cost-effective

// GPT-5 Flagship (Verbosity control, government ID required)
GPT-5          $1.25/$10.00 + $10.00 reasoning per 1M tokens   // Flagship
GPT-5-mini     $0.25/$2.00 + $2.00 reasoning per 1M tokens     // Balanced
GPT-5-nano     $0.05/$0.40 + $0.40 reasoning per 1M tokens     // Ultra-fast

// Local & Custom Education Models (Data secured on-premises)
SAMK Qwen      Local Inference                                 // Secure Institutional Data
DeepSeek R1    Local Inference                                 // Advanced Local Reasoning

// Image Generation
DALL-E 2       $2.00 per image                                 // Fast
DALL-E 3       $4.00-8.00 per image (Standard/HD)              // High-quality
gpt-image-1    $5.00 input / $40.00 output                     // Latest
```


### 2. Advanced Mode System

Each model supports 4 runtime modes with different tuning:

- **Auto**: Balanced temperature and token limit (default)
- **Instant**: Fast responses, lower token allowance
- **Thinking**: Deep reasoning, higher token budget
- **Pro**: Maximum capabilities, premium settings

Example configuration for GPT-4o:
```typescript
modes: {
  auto: { temperature: 0.65, topP: 1, maxOutputTokens: 4096 },
  instant: { temperature: 0.35, topP: 0.85, maxOutputTokens: 2048 },
  thinking: { temperature: 0.6, topP: 1, maxOutputTokens: 6144 },
  pro: { temperature: 0.2, topP: 0.8, maxOutputTokens: 6144 },
}
```

### 3. Image Generation

Fully implemented with 3 models:

**Features**:
- Size selection: 512x512, 1024x1024, 1024x1536, 1536x1024
- Quality levels: low/medium/high (→ Standard/HD for DALL-E 3)
- Safety filtering: Automatic content rewrites for policy compliance
- Server storage: Generated images saved to `uploads/generated/`
- Chat integration: Images returned as message attachments

**Example safety filtering**:
```typescript
// DALL-E 3 content policy compliance
prompt = prompt
  .replace(/\b(baby|infant|child)\b/gi, "young adult")
  .replace(/\b(nude|sexual|explicit)\b/gi, "artistic")
  .replace(/\b(violence|violent|blood)\b/gi, "dramatic");
```

### 4. Real-Time Streaming

Server-Sent Events (SSE) for token-by-token delivery:

```typescript
// Streaming implementation
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: conversationHistory,
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
}
```

### 5. Enterprise Authentication

**LDAP Integration**:
- University Active Directory SSO
- Auto-provision users on first login
- No local password storage
- Role derivation from LDAP groups (student/staff/admin)
- Configurable timeout and TLS settings

**Session Security**:
- JWT-based sessions via NextAuth
- Configurable expiration (8-hour default recommended)
- HTTP-only, SameSite cookies
- Automatic session rotation

### 6. Rate Limiting & Cost Control

**Per-Role Limits**:
```typescript
model ModelRateLimit {
  model             String   // e.g., "gpt-5"
  userRole          UserRole // student/staff/admin
  monthlyTokenLimit Int      // Max tokens per month
  dailyRequestLimit Int      // Max requests per day
}
```

**Features**:
- Database-driven limits (no external Redis needed for simple deployments)
- Per-model, per-role enforcement
- 429 errors when limits exceeded
- Real-time cost tracking (cents precision)

### 7. File Processing Pipeline

**Supported Formats**:
- **Images**: PNG, JPG, JPEG, WebP, GIF → Vision models
- **Documents**: PDF, DOCX → Text extraction → Context
- **Text**: TXT, MD → Direct inclusion

**Implementation**:
- `pdf-parse` for PDF text extraction
- `mammoth` for DOCX conversion
- 10,000 character limit per document (token cost control)
- Multi-file support (up to 5 files per message)

### 8. Admin Dashboard

**Features**:
- Platform-wide usage statistics
- Per-user token consumption
- Cost breakdown by model
- Top 10 users by usage
- Daily/monthly trends
- GDPR-compliant (message content hidden)

**Analytics**:
```typescript
// Aggregated usage data
const stats = await prisma.usageStats.groupBy({
  by: ['model'],
  _sum: {
    tokensUsed: true,
    messagesCount: true,
    costInCents: true,
  },
});
```

### 9. Dynamic Access Control & Model Groups

The platform administration allows granular constraint mechanisms previously unavailable via generic commercial packages:
- **Model Groups**: Logically combine models (e.g., "Expensive Models", "Local Safe Models", "Image Creators") and assign access based on role identifiers (student, staff, admin).
- **Hard Whitelisting & Blacklisting**: Intercept users by exact identifier to grant or suspend their platform privileges directly.
- **Limit Controls**: Enforce history truncation for specific models (like Qwen) to preserve context limits dynamically without code modifications.

### 10. Custom AI Styles (System Prompts)

**User-Created Personas**:
- Create custom AI personalities with unique system prompts
- Save up to 5 custom styles per user
- Stored in database with `CustomStyle` model
- Select from dropdown when chatting
- Persistent UI elements ensure seamless UX across app boundaries

**Features**:
- Name your custom style (e.g., "Code Reviewer", "Creative Writer")
- Define custom system prompt that shapes AI behavior
- Persistent across sessions & auto-loads previous settings
- Per-user isolation (only you see your styles)

**Use Cases**:
- Technical documentation writer
- Creative storytelling assistant
- Code review expert
- Subject-specific tutor
- Business analyst persona

**Implementation**:
```typescript
// Save custom style
await prisma.customStyle.create({
  data: {
    userId: session.user.id,
    name: "Code Reviewer",
    systemPrompt: "You are an expert code reviewer focused on best practices..."
  }
});
```

### 11. Professional Code Rendering

**Syntax Highlighting**:
- Automatic language detection for code blocks
- Powered by `react-syntax-highlighter` with Prism
- VSCode Dark Plus theme (dark mode compatible)
- Supports 100+ programming languages

**Copy to Clipboard**:
- One-click copy button on every code block
- Visual feedback on successful copy
- Preserves formatting and indentation
- Works like ChatGPT/Claude interface

**Features**:
- Language badge shows detected language
- Line numbers (optional)
- Syntax coloring for readability
- Monospace font with proper spacing
- Mobile-responsive code blocks

**Example Output**:
- User asks: "Write a Python function to sort a list"
- AI responds with properly formatted, syntax-highlighted code
- Copy button appears in top-right of code block
- Click to copy → clipboard contains clean code


## 🛠️ Development Approach

### Core Platform

**Foundation**:
- Next.js 15 (App Router) with TypeScript strict mode
- Prisma ORM with type-safe database access
- OpenAI SDK with streaming support
- Modern React 19 with Server Components

**Enterprise Integration**:
- LDAP/Active Directory authentication
- University SSO (no password storage)
- Role-based access control
- Auto-provisioning from directory

**AI Integration**:
- 13+ model support across 4 families
- Dual API architecture (Chat + Responses + Image)
- Real-time streaming with SSE
- Cost tracking per token

**Production Features**:
- File processing (PDF/DOCX/images)
- Usage analytics dashboard
- Per-role rate limiting
- GDPR-compliant schema

### Engineering Approach

1. **Modern Architecture**: Next.js 15 (App Router), TypeScript strict mode
2. **Production Libraries**: OpenAI SDK, Prisma ORM, NextAuth, enterprise patterns
3. **Integration Focus**: Leverage existing infrastructure (LDAP, Active Directory)
4. **Business-Driven**: Cost optimization as primary architectural constraint

---

## 📁 Documentation

### Core Documentation

- **[Executive Summary](docs/01-executive-summary.md)** - Business case and ROI analysis
- **[Technical Architecture](docs/02-technical-architecture.md)** - System design and diagrams
- **[Model Catalog](docs/03-model-catalog.md)** - All 13+ models documented
- **[API Architecture](docs/04-api-architecture.md)** - Dual API integration breakdown
- **[Image Generation](docs/05-image-generation.md)** - DALL-E implementation details
- **[Enterprise Features](docs/06-enterprise-features.md)** - LDAP, rate limiting, admin
- **[Development Timeline](docs/07-development-timeline.md)** - Iterative development journey
- **[Cost Analysis](docs/08-cost-analysis.md)** - Detailed financial comparison
- **[Security & Compliance](docs/09-security-compliance.md)** - GDPR roadmap, vulnerabilities
- **[Future Roadmap](docs/10-future-roadmap.md)** - n8n workflows, Moodle integration

### Diagrams

- **[System Architecture](diagrams/system-architecture.md)** - High-level system flow
- **[Dual API Flow](diagrams/dual-api-flow.md)** - Chat vs Responses API comparison
- **[Model Catalog](diagrams/model-catalog-viz.md)** - Visual model comparison
- **[Cost Comparison](diagrams/cost-comparison.md)** - Savings visualization
- **[Database Schema](diagrams/database-schema.md)** - ER diagram with relationships

### Code Examples

- **[Streaming Chat](code-examples/streaming-chat.ts)** - SSE implementation
- **[Image Generation](code-examples/image-generation.ts)** - DALL-E integration
- **[Rate Limiting](code-examples/rate-limiting.ts)** - Per-role enforcement
- **[LDAP Authentication](code-examples/ldap-auth.ts)** - University SSO

---

## 🔒 Production Readiness

### Current Status: **Functional MVP**

**What's Production-Ready**:
- ✅ Multi-model AI integration (13+ models)
- ✅ Streaming chat with SSE
- ✅ LDAP authentication
- ✅ File upload and processing
- ✅ Usage tracking and cost calculation
- ✅ Admin dashboard with analytics
- ✅ Image generation (3 models)
- ✅ Rate limiting (per-role database-driven)

**Pending for Production**:
- ⏳ Database migration: SQLite → PostgreSQL (4-8 hours)
- ⏳ HTTPS/SSL setup (2-4 hours)
- ⏳ API key secrets management (4-6 hours)
- ⏳ Session security hardening (1-2 hours)
- ⏳ Message encryption for GDPR (Est. 20-30 hours)

### Security Analysis

From comprehensive security audit (**[full details](docs/09-security-compliance.md)**):

**Critical** (Must fix before deployment):
1. **Database**: SQLite → PostgreSQL for concurrency
2. **HTTPS**: SSL/TLS for credential protection
3. **Secrets**: Move API keys to secrets manager

**Estimated effort to production**: 10-18 hours for critical fixes

### GDPR Compliance

Current compliance: **40%** | Target: **90%+**

**Missing Requirements** (**[roadmap](docs/09-security-compliance.md)**):
1. Privacy policy and terms
2. Data export functionality
3. Right to erasure endpoint
4. Consent banner for AI processing
5. Audit logging
6. Data encryption at rest

**Estimated effort**: 30-40 hours

**Total estimated effort to production**: 40-60 hours (security + encryption + deployment)

---

## 🌐 Production Deployment & Staff Pilot

**Current Status**: Platform deployed securely to SAMK University AI infrastructure and running an active staff pilot program.

**Environment**:
- Containerized deployment (Docker)
- Secure University AI server infrastructure on-premise
- SSH-based CI/CD deployment workflow
- Strict Role-Based Access Controls (staff-only for pilot phase)

**Purpose**:
- Provide highly scalable and localized AI resources to the university.
- Reduce recurring licensing costs with dynamic usage-based infrastructure.
- Evaluate local self-hosted models (e.g., SAMK Qwen) vs flagship models.
- Gather comprehensive feedback during the pilot scaling phase.

**Next Steps**: Expand platform access smoothly to students following the conclusion of the staff pilot program.

---

## 🚀 Future Enhancements

### Planned Features

**n8n Workflow Automation** (60-92 hours):
- Trigger workflows from chat
- Pre-built templates (email, Moodle, calendar)
- Shareable agent marketplace

**Moodle LMS Integration** (42-64 hours):
- Course lookup and enrollment
- Assignment tracking and deadlines
- Grade checking
- Real-time data sync

**Enhanced Security** (42-60 hours):
- IP-based rate limiting (DDoS protection)
- Comprehensive audit logging
- Cost alerts and budget controls
- Intrusion detection

**See [Future Roadmap](docs/10-future-roadmap.md) for detailed breakdown**

---

## 💡 Key Takeaways for Portfolio

### Technical Achievements

1. **Multi-Model Integration**: 15+ AI models including cutting-edge GPT-5 and local self-hosted deployments (Qwen, DeepSeek).
2. **Dual API Architecture**: Seamless handling of Chat, Responses, and Image APIs.
3. **Advanced Admin Layer**: Enterprise-tier dynamic whitelists/blacklists and logic-based model groups routing.
4. **Enterprise Patterns**: LDAP SSO, rate limiting, cost tracking, administrative overrides.
5. **Production Engineering**: Comprehensive security audit, GDPR compliance planning, sophisticated history state management.
6. **Real Deployment**: Containerized deployment to university AI server for demos.

### Business Acumen

1. **Cost Optimization**: 88% reduction through usage-based pricing
2. **Scalability Planning**: Costs grow with usage, not user count
3. **ROI Analysis**: <1 month break-even, €13k Year 1 savings
4. **Compliance Awareness**: GDPR roadmap, security audit documented
5. **Stakeholder Communication**: Clear value proposition to university

### Production Thinking

1. **Security First**: Comprehensive vulnerability analysis
2. **Compliance by Design**: GDPR requirements documented upfront
3. **Scalability Considered**: PostgreSQL migration path defined
4. **Cost Transparency**: Real-time tracking enables optimization
5. **Future-Proof**: Extensible architecture (n8n, Moodle planned)

---

## 📞 Contact & Links

**Project Context**: Built for SAMK University (Finland) as a comprehensive cost-effective enterprise AI platform and secure ChatGPT alternative. Solo developed to provide next-gen integrations securely.

**Status**: Deployed to production on university infrastructure and actively scaling via a staff pilot program.

**Pilot Plan**: Currently rolling out to initial staff users, building towards full university adoption.

**Timeline**: November 2024 - Present

---

**Note**: This is a portfolio case study documenting a production development project. For code access or technical inquiries, please reach out directly, as full proprietary codebase access is restricted to ensure institutional security.

Built by A4R5H1L | [GitHub](https://github.com/A4R5H1L)
