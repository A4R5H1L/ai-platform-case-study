# AI Platform - Enterprise Multi-Model Chat System

> **Enterprise multi-model AI platform** | Built for SAMK University

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Multi--API-412991?logo=openai)](https://openai.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16-2D3748?logo=prisma)](https://www.prisma.io/)

## 🎯 Project Overview

An enterprise-grade AI chat platform demonstrating **sophisticated architecture**, **multi-model integration**, and **production-ready thinking**. Built as a cost-effective alternative to commercial ChatGPT licensing for a 60-user university pilot program.

### Key Achievements

🚀 **13+ AI Models Integrated**
- GPT-4 family (GPT-4o, GPT-4o-mini, GPT-4.1)
- o-series reasoning models (o1-mini, o1-preview, o3, o3-mini)
- **GPT-5 flagship** (GPT-5, GPT-5-mini, GPT-5-nano) with government ID verification
- Image generation (DALL-E 2, DALL-E 3, gpt-image-1)

💰 **88% Cost Reduction**
- From: €23-60/user/month (ChatGPT Pro/Enterprise)
- To: ~€2.70/user/month (usage-based OpenAI API)
- Projected savings: €13,116/year for 60 users

⚡ **Advanced Features**
- Dual API architecture (Chat + Responses + Image APIs)
- 4-mode system per model (auto/instant/thinking/pro)
- Real-time streaming with Server-Sent Events
- Enterprise LDAP authentication
- Per-role rate limiting and cost tracking
- Full image generation with safety filtering

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

**ROI**: Break-even in <1 month | Year 1 savings: €13,116

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

### 1. Multi-Model Selection

Users can choose from 13+ AI models based on their needs:

```typescript
// Available models with pricing
GPT-4o-mini    $0.15/$0.60 per 1M tokens  // Cost-effective
GPT-4o         $2.50/$10.00 per 1M tokens // High-intelligence
o1-preview     $15.00/$60.00 per 1M tokens // Advanced reasoning
GPT-5          $1.25/$10.00 per 1M tokens  // Flagship model
DALL-E 3       $0.04-0.08 per image        // Image generation
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

---

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

## 🌐 Demo Deployment

**Current Status**: Platform deployed to containerized AI server for demonstration and testing.

**Environment**:
- Containerized deployment (Docker)
- University AI server infrastructure
- SSH-based deployment workflow
- Accessible for stakeholder demos

**Purpose**:
- Validate platform functionality in production-like environment
- Demonstrate features to university stakeholders
- Gather feedback for pilot program
- Prove deployment viability

**Next Steps**: Full production deployment pending SSL/TLS, PostgreSQL, and message encryption implementation.

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

1. **Multi-Model Integration**: 13+ AI models including cutting-edge GPT-5
2. **Dual API Architecture**: Seamless handling of Chat, Responses, and Image APIs
3. **Production Fallbacks**: GPT-5 non-streaming fallback when streaming unavailable
4. **Enterprise Patterns**: LDAP SSO, rate limiting, cost tracking, admin analytics
5. **Production Engineering**: Comprehensive security audit, GDPR compliance planning
6. **Real Deployment**: Containerized deployment to university AI server for demos

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

**Project Context**: Built for SAMK University (Finland) as cost-effective alternative to ChatGPT licensing

**Status**: Functional MVP awaiting deployment (encryption + domain provisioning)

**Pilot Plan**: 60 users (staff + students) across 4 campuses

**Timeline**: November-December 2024

---

**Note**: This is a portfolio case study documenting a real development project. Cost estimates are projections pending pilot program validation. The platform is production-ready pending final security enhancements (encryption, PostgreSQL, SSL).

Built by A4R5H1L | [GitHub](https://github.com/A4R5H1L) | [LinkedIn](https://linkedin.com/in/yourprofile)
