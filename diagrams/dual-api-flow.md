# Dual API Flow Diagrams

## Overview

The platform supports three distinct OpenAI APIs, each with different request/response patterns.

## API Selection Flow

```mermaid
graph TD
    Request[User Message] --> GetModel[Get Model Info]
    GetModel --> CheckAPI{API Type?}
    
    CheckAPI -->|chat| ChatPath[Chat Completions API]
    CheckAPI -->|responses| RespPath[Responses API]
    CheckAPI -->|image| ImgPath[Images API]
    
    ChatPath --> ChatStream[Stream Response]
    RespPath --> RespStream[Stream/Non-Stream]
    ImgPath --> ImgGen[Generate Image]
    
    ChatStream --> SSE[SSE to Client]
    RespStream --> SSE
    ImgGen --> Attachment[Return as Attachment]
```

## Chat Completions API Flow

**Used By**: GPT-4o, GPT-4o-mini, GPT-4.1, o1-mini, o1-preview, o3, o3-mini

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant OpenAI

    Client->>API: POST /api/chat (message, model)
    API->>API: Build messages array
    API->>OpenAI: chat.completions.create({ stream: true })
    
    loop Token Streaming
        OpenAI-->>API: delta.content
        API-->>Client: SSE event: token
    end
    
    OpenAI-->>API: usage stats
    API->>API: Save message + usage
    API-->>Client: SSE event: done
```

## Responses API Flow

**Used By**: GPT-5, GPT-5-mini, GPT-5-nano

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant OpenAI

    Client->>API: POST /api/chat (message, model=gpt-5)
    API->>API: Convert to input format
    
    alt Streaming Supported
        API->>OpenAI: responses.stream()
        loop Token Streaming
            OpenAI-->>API: response.output_text.delta
            API-->>Client: SSE event: token
        end
    else Streaming Not Supported (org not verified)
        API->>OpenAI: responses.create({ stream: false })
        OpenAI-->>API: Complete response
        API->>API: Parse output array
        API-->>Client: Full response at once
    end
    
    API-->>Client: SSE event: done
```

## Images API Flow

**Used By**: DALL-E 2, DALL-E 3, gpt-image-1

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant OpenAI
    participant Storage

    Client->>API: POST /api/chat (prompt, model=dall-e-3)
    API->>API: Apply safety filtering
    API->>OpenAI: images.generate({ prompt, size, quality })
    OpenAI-->>API: Base64 image data
    
    API->>Storage: Save PNG to disk
    API->>API: Create attachment record
    API-->>Client: Image URL
```

## Message Format Comparison

### Chat Completions API

```json
{
  "messages": [
    { "role": "system", "content": "You are helpful" },
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" }
  ]
}
```

### Responses API

```json
{
  "input": [
    { "role": "user", "content": [{ "type": "input_text", "text": "Hello" }] },
    { "role": "assistant", "content": [{ "type": "output_text", "text": "Hi!" }] }
  ]
}
```

**Key Difference**: `input_text`/`output_text` vs plain `content`

## Format Conversion

```typescript
function convertToResponsesFormat(messages) {
  return messages.map(msg => ({
    role: msg.role,
    content: [{
      type: msg.role === 'assistant' ? 'output_text' : 'input_text',
      text: msg.content
    }]
  }));
}
```

---

**See Also**:
- [API Architecture](../docs/04-api-architecture.md) - Full implementation details
- [Model Catalog](../docs/03-model-catalog.md) - Which models use which API
