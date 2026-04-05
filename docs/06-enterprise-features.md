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
- Advanced schema based on modern `ldapts`
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

## Dynamic Access Control & Model Groups

### Group-Level Permissions

Instead of hardcoded identifiers, models are batched into `ModelGroups`. Users and roles are safely granted rights via `UserModelAccess`:

```typescript
model ModelGroup {
  id                String             @id @default(cuid())
  name              String             @unique
  models            String             // JSON: [{"id":"gpt-4o","dailyLimit":null},...]
  monthlyBudgetCents Int?              // Monthly cost budget in cents
}

model UserModelAccess {
  userId                    String?
  userRole                  UserRole?
  modelGroupId              String
  dailyMessageLimit         Int?
  monthlyBudgetOverrideCents Int?
}
```

### Whitelisting & Blacklisting

System admins have exact intervention abilities through `UserAccessList`:

```typescript
model UserAccessList {
  email     String         @unique
  listType  AccessListType // whitelist | blacklist
}
```

### Enforcement Logic

1. Intercept user email via Blacklist -> Revoke if listed
2. Identify assigned `ModelGroups` via explicit UserID or broad Role matching
3. Evaluate Monthly Budget constraints ($ vs tokens)
4. Evaluate specific limits for the individual Model within the group
5. Execute request -> Log to UsageStats

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
- Configure **Hard Blacklists & Whitelists** dynamically
- **Group Management:** Assign models to logical groups (e.g., Cheap, Expensive, Image) without pushing code
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
