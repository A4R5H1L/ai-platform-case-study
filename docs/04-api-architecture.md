# API Architecture - Dual API Integration

## Overview

The platform integrates **three distinct Open AI APIs**, each with different capabilities, request/response formats, and use cases. This multi-API architecture enables support for 13+ models across chat, reasoning, and image generation.

## The Three APIs

### 1. Chat Completions API (Traditional)

**Used By**: GPT-4o, GPT-4o-mini, GPT-4.1, o1-mini, o1-preview, o3, o3-mini

**Endpoint**: `openai.chat.completions.create()`

**Characteristics**:
- Streaming support (Server-Sent Events)
- Multi-turn conversation handling
- Vision input (images in messages)
- Temperature and top_p control
- Reasoning effort (for o-series models)

**Example Request**:
```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Explain quantum computing' }
  ],
  stream: true,
  temperature: 0.7,
  max_tokens: 4096
});
```

---

### 2. Responses API (New for GPT-5)

**Used By**: GPT-5, GPT-5-mini, GPT-5-nano

**Endpoint**: `openai.responses.stream()` or `openai.responses.create()`

**Characteristics**:
- Different message format (`input` with `input_text`/`output_text`)
- Reasoning effort control (minimal/low/medium/high)
- Verbosity settings (low/medium/high)
- **Streaming may fail** (organization verification required)
- Non-streaming fallback supported

**Example Request (Streaming)**:
```typescript
const response = await openai.responses.stream({
  model: 'gpt-5',
  input: [
    { 
      role: 'user', 
      content: [{ type: 'input_text', text: 'Explain quantum computing' }]
    }
  ],
  stream: true,
  reasoning: { effort: 'high' },
  text: { verbosity: 'medium' },
  max_output_tokens: 32768
});

for await (const event of response) {
  if (event.type === 'response.output_text.delta') {
    const delta = event.delta || '';
    // Stream to client...
  }
}
```

**Non-Streaming Fallback** (when streaming fails):
```typescript
try {
  // Try streaming first
  const response = await openai.responses.stream({...});
} catch (error) {
  if (error.code === 'unsupported_value' && error.param === 'stream') {
    // Fall back to non-streaming
    const response = await openai.responses.create({
      ...params,
      stream: false
    });
    
    // Extract text from complex response structure
    const text = response.output
      .find(item => item.type === 'message')
      ?.content
      .filter(item => item.type === 'output_text')
      .map(item => item.text)
      .join('');
  }
}
```

---

### 3. Images API

**Used By**: DALL-E 2, DALL-E 3, gpt-image-1

**Endpoint**: `openai.images.generate()`

**Characteristics**:
- Text-to-image generation
- Size and quality control
- Base64 or URL response
- No streaming (single image return)
- Safety filtering

**Example Request**:
```typescript
const image = await openai.images.generate({
  model: 'dall-e-3',
  prompt: 'A futuristic university campus with AI technology',
  size: '1024x1024',
  quality: 'hd',
  response_format: 'b64_json'
});

const base64 = image.data[0].b64_json;
const buffer = Buffer.from(base64, 'base64');
// Save to disk...
```

---

## Message Format Differences

### Chat Completions API Format

```typescript
type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
};
```

**Example**:
```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "What's in this image?" },
    { "type": "image_url", "image_url": { "url": "data:image/png;base64,..." } }
  ]
}
```

### Responses API Format

```typescript
type ResponseMessage = {
  role: 'system' | 'user' | 'assistant';
  content: Array<{
    type: 'input_text' | 'output_text' | 'input_image';
    text?: string;
    image_url?: { url: string };
  }>;
};
```

**Example**:
```json
{
  "role": "user",
  "content": [
    { "type": "input_text", "text": "Explain this concept" }
  ]
}
```

**Key Difference**: `text` vs `input_text`/`output_text`

---

## Platform Implementation

### API Selection Logic

**From `/src/app/api/chat/route.ts`:**

```typescript
const modelApi = MODEL_CATALOG[model]?.api || "chat";

if (modelApi === "responses") {
  // Use Responses API for GPT-5 family
  const stream = await openai.responses.stream({
    model,
    input: convertToResponsesInput(messages),
    stream: true,
    reasoning: tuning.reasoningEffort ? { effort: tuning.reasoningEffort } : undefined,
    text: tuning.verbosity ? { verbosity: tuning.verbosity } : undefined,
    max_output_tokens: tuning.maxOutputTokens
  });
} else if (modelApi === "chat") {
  // Use Chat Completions API for most models
  const stream = await openai.chat.completions.create({
    model,
    messages: messages,
    stream: true,
    temperature: tuning.temperature,
    top_p: tuning.topP,
    max_tokens: tuning.maxOutputTokens
  });
} else if (modelApi === "image") {
  // Use Images API for DALL-E
  const response = await openai.images.generate({
    model,
    prompt: userPrompt,
    size: imageSize,
    quality: quality,
    response_format: 'b64_json'
  });
}
```

### Message Format Conversion

**Converting Chat format → Responses format:**

```typescript
function convertToResponsesInput(messages: ChatCompletionMessageParam[]): ResponsesInputMessage[] {
  return messages.map((message) => {
    const role = message.role === "system" ? "system" 
               : message.role === "assistant" ? "assistant" 
               : "user";

    const toPart = (part: unknown): ResponsesInputItem => {
      if (typeof part === "string") {
        return {
          type: role === "assistant" ? "output_text" : "input_text",
          text: part,
        };
      }
      
      if (part && typeof part === "object" && "type" in part) {
        const typed = part as { type: string; text?: string; image_url?: any };
        if (typed.type === "text") {
          return {
            type: role === "assistant" ? "output_text" : "input_text",
            text: typed.text || "",
          };
        }
        // Note: GPT-5 doesn't support image input yet
        if (typed.type === "image_url") {
          return {
            type: "input_text",
            text: "[Image content - not supported in this model]",
          };
        }
      }
      
      return { type: "input_text", text: "" };
    };

    const contentParts: ResponsesInputItem[] = [];
    if (typeof message.content === "string") {
      contentParts.push(toPart(message.content));
    } else if (Array.isArray(message.content)) {
      message.content.forEach(part => contentParts.push(toPart(part)));
    }

    return { role, content: contentParts };
  });
}
```

---

## Streaming Implementation

### Server-Sent Events (SSE)

Both Chat and Responses APIs support streaming via SSE:

```typescript
const encoder = new TextEncoder();
const stream = new ReadableStream({
  async start(controller) {
    // Send initial metadata
    controller.enqueue(
      encoder.encode(`event: session\ndata: ${JSON.stringify({ sessionId })}\n\n`)
    );

    // Stream tokens
    for await (const chunk of aiStream) {
      const content = extractContent(chunk); // API-specific extraction
      controller.enqueue(
        encoder.encode(`event: token\ndata: ${JSON.stringify({ text: content })}\n\n`)
      );
    }

    // Signal completion
    controller.enqueue(
      encoder.encode(`event: done\ndata: ${JSON.stringify({ success: true })}\n\n`)
    );
    controller.close();
  },
});

return new Response(stream, {
  headers: { 'Content-Type': 'text/event-stream' },
});
```

### Client-Side Consumption

```typescript
const eventSource = new EventSource('/api/chat');

eventSource.addEventListener('token', (event) => {
  const { text } = JSON.parse(event.data);
  // Append to UI...
});

eventSource.addEventListener('done', () => {
  eventSource.close();
});
```

---

## Error Handling

### API-Specific Errors

#### Chat Completions API
```typescript
try {
  const stream = await openai.chat.completions.create({...});
} catch (error) {
  if (error.code === 'model_not_found') {
    return new Response('Model unavailable', { status: 400 });
  }
  if (error.code === 'context_length_exceeded') {
    return new Response('Message too long', { status: 400 });
  }
  if (error.code === 'rate_limit_exceeded') {
    return new Response('Rate limit hit, try again later', { status: 429 });
  }
}
```

#### Responses API (GPT-5)
```typescript
try {
  const stream = await openai.responses.stream({...});
} catch (error) {
  // Streaming not supported - fall back to non-streaming
  if (error.code === 'unsupported_value' && error.param === 'stream') {
    console.warn('GPT-5 streaming unavailable, using non-streaming');
    const response = await openai.responses.create({
      ...params,
      stream: false
    });
    // Parse non-streaming response...
  }
}
```

#### Images API
```typescript
try {
  const image = await openai.images.generate({...});
} catch (error) {
  if (error.code === 'content_policy_violation') {
    return new Response('Prompt rejected by safety filter', { status: 400 });
  }
}
```

---

## Performance Considerations

### Token Counting

Different APIs return usage data in different formats:

**Chat Completions API**:
```typescript
const usage = completion.usage;
const inputTokens = usage.prompt_tokens;
const outputTokens = usage.completion_tokens;
const totalTokens = usage.total_tokens;
```

**Responses API**:
```typescript
const finalResponse = await responseStream.finalResponse();
const usage = finalResponse.usage;
const inputTokens = usage.input_tokens || 0;
const outputTokens = usage.output_tokens || 0;
```

### Cost Calculation

```typescript
function estimateCostInCents(modelId: string, inputTokens: number, outputTokens: number): number {
  const pricing = getModelInfo(modelId);
  const inputRate = pricing.input / 1_000_000;  // Price per 1M tokens
  const outputRate = (pricing.reasoning ?? pricing.output) / 1_000_000;

  const dollars = (inputTokens * inputRate) + (outputTokens * outputRate);
  return Math.round(dollars * 100); // Convert to cents
}
```

---

## Future API Additions

### Potential Integrations

1. **Anthropic Claude API**:
   - Similar to Chat Completions format
   - Add `api: "claude"` to model catalog
   - Implement conversion layer

2. **Google Gemini API**:
   - Different authentication (API key + project ID)
   - Streaming via SSE supported
   - Add to dual API architecture

3. **Local Model APIs**:
   - Ollama, LM Studio
   - OpenAI-compatible format
   - Lower cost, higher latency

---

**See Also**:
- [Model Catalog](03-model-catalog.md) - Which models use which API
- [Code Examples](../code-examples/streaming-chat.ts) - Full implementation
- [Future Roadmap](10-future-roadmap.md) - Planned API additions
