# Database Schema

## Entity Relationship Diagram

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
        string displayName
        enum role "student|staff|admin"
        datetime createdAt
        datetime updatedAt
    }
    
    CHAT_SESSION {
        string id PK
        string userId FK
        string title
        string group
        datetime createdAt
        datetime updatedAt
    }
    
    MESSAGE {
        string id PK
        string sessionId FK
        enum role "user|assistant|system"
        string content
        string model
        integer tokensUsed
        integer costInCents
        string customStyleId
        datetime createdAt
    }
    
    ATTACHMENT {
        string id PK
        string messageId FK
        enum type "image|document|generated_image"
        string name
        string mimeType
        integer size
        string localPath
        string extractedText
    }
    
    USAGE_STATS {
        string id PK
        string userId FK
        date date
        string model
        integer tokensUsed
        integer messagesCount
        integer costInCents
    }
    
    CUSTOM_STYLE {
        string id PK
        string userId FK
        string name
        string systemPrompt
        datetime createdAt
        datetime updatedAt
    }
    
    MODEL_RATE_LIMIT {
        string id PK
        string model
        enum userRole "student|staff|admin"
        integer monthlyTokenLimit
        integer dailyRequestLimit
    }
```

## Model Descriptions

### User
- Central identity model
- LDAP-synced (username, email, displayName)
- Role determines access and limits

### ChatSession
- Container for conversations
- Titled for reference
- Grouped for organization (optional)

### Message
- Individual messages in a conversation
- Tracks model used and cost
- Links to custom style if used

### Attachment
- Files associated with messages
- Supports images, documents, generated images
- Stores extracted text for documents

### UsageStats
- Daily aggregation per user per model
- Enables rate limiting checks
- Powers admin analytics

### CustomStyle
- User-defined AI personas
- Stored system prompts
- Per-user isolation

### ModelRateLimit
- Administrative controls
- Per-model, per-role limits
- Daily and monthly caps

## Relationships

| From | To | Relationship |
|------|-----|--------------|
| User | ChatSession | One-to-Many |
| User | UsageStats | One-to-Many |
| User | CustomStyle | One-to-Many |
| ChatSession | Message | One-to-Many |
| Message | Attachment | One-to-Many |

## GDPR Compliance

### Cascade Deletes

When a user is deleted:
- All ChatSessions deleted
- All Messages deleted (cascade from sessions)
- All Attachments deleted (cascade from messages)
- All UsageStats deleted
- All CustomStyles deleted

```prisma
model ChatSession {
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

**See Also**:
- [Technical Architecture](../docs/02-technical-architecture.md)
- [Enterprise Features](../docs/06-enterprise-features.md)
