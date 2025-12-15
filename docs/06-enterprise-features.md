# Enterprise Features

## LDAP Authentication

### University SSO Integration

Seamless integration with university Active Directory:

```typescript
// LDAP authentication flow
const ldapUser = await authenticateWithLdap(username, password);
if (ldapUser) {
  // Auto-provision or update user
  const user = await prisma.user.upsert({
    where: { username },
    update: { email: ldapUser.email, displayName: ldapUser.displayName },
    create: { username, email: ldapUser.email, role: deriveRole(ldapUser.groups) }
  });
}
```

**Features**:
- No local password storage
- Auto-provisioning on first login
- Role derivation from LDAP groups
- Configurable TLS and timeout settings
- Fallback handling for LDAP failures

### Role System

| Role | Description | Default Limits |
|------|-------------|----------------|
| **student** | Default for students | Lower token limits |
| **staff** | Faculty and staff | Higher limits |
| **admin** | Full platform access | Unlimited |

---

## Rate Limiting

### Database-Driven Limits

Per-model, per-role enforcement:

```typescript
model ModelRateLimit {
  model             String   // e.g., "gpt-5"
  userRole          UserRole // student/staff/admin
  monthlyTokenLimit Int      // Max tokens per month
  dailyRequestLimit Int      // Max requests per day
}
```

### Enforcement Logic

1. Check daily request count
2. Check monthly token usage
3. If exceeded: return 429 with reset time
4. If allowed: process request, update counters

### Example Limits

| Model | Students | Staff | Admin |
|-------|----------|-------|-------|
| GPT-4o-mini | 100K/month | 500K/month | Unlimited |
| GPT-5 | 50K/month | 200K/month | Unlimited |
| o3 | 10K/month | 50K/month | Unlimited |

---

## Cost Tracking

### Real-Time Token Accounting

Every message tracks:
- Input tokens (prompt)
- Output tokens (response)
- Reasoning tokens (o-series, GPT-5)
- Cost in cents

```typescript
const costInCents = Math.round(
  ((inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000) * 100
);

await prisma.message.update({
  where: { id: messageId },
  data: { tokensUsed: totalTokens, costInCents }
});
```

### Usage Statistics

Aggregated by user, model, and day:

```typescript
await prisma.usageStats.upsert({
  where: { userId_date_model: { userId, date: today, model } },
  update: {
    tokensUsed: { increment: tokens },
    messagesCount: { increment: 1 },
    costInCents: { increment: cost }
  },
  create: { userId, date: today, model, tokensUsed: tokens, messagesCount: 1, costInCents: cost }
});
```

---

## Admin Dashboard

### Platform Analytics

- **Total usage**: Tokens, messages, cost
- **Per-model breakdown**: Which models are popular
- **Top users**: Highest consumption by user
- **Daily trends**: Usage patterns over time
- **Cost projections**: Estimated monthly spend

### User Management

- View all users with roles
- See individual usage stats
- Adjust rate limits
- Export usage data

### GDPR Compliance

- Message content hidden from admin
- Only metadata visible (tokens, cost, timestamps)
- Cascade delete on user removal
- Audit trail for admin actions (planned)

---

## Custom AI Styles

### User-Created Personas

Users can create custom system prompts:

```typescript
model CustomStyle {
  id           String   @id @default(cuid())
  userId       String
  name         String   // e.g., "Code Reviewer"
  systemPrompt String   // Custom instructions
}
```

**Limits**: Up to 5 custom styles per user

**Use Cases**:
- Subject-specific tutors
- Writing assistants with specific tone
- Technical experts for different domains
- Language learning helpers

---

## File Processing

### Supported Formats

| Type | Formats | Processing |
|------|---------|------------|
| **Images** | PNG, JPG, WebP, GIF | Vision model input (DataURL) |
| **Documents** | PDF, DOCX | Text extraction |
| **Text** | TXT, MD | Direct inclusion |

### Text Extraction

```typescript
// PDF extraction
const pdfData = await pdfParse(buffer);
const text = pdfData.text.slice(0, 10000); // 10K char limit

// DOCX extraction
const result = await mammoth.extractRawText({ buffer });
const text = result.value.slice(0, 10000);
```

### Multi-File Support

- Up to 5 files per message
- Combined context passed to model
- Attachments stored with message reference

---

**See Also**:
- [Rate Limiting Code](../code-examples/rate-limiting.ts)
- [LDAP Auth Code](../code-examples/ldap-auth.ts)
- [Security & Compliance](09-security-compliance.md)
