# Streaming Chat Implementation

## Server - Side: SSE with OpenAI SDK

    ** File **: `/src/app/api/chat/route.ts`(simplified)

        ```typescript
import { getOpenAIClient } from '@/lib/openai';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MODEL_CATALOG, getModeTuning } from '@/lib/config';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minute timeout

/**
 * Helper to create Server-Sent Event formatted strings
 */
function createSseEvent(event: string, data: unknown) {
  return `event: ${ event } \ndata: ${ JSON.stringify(data) } \n\n`;
}

/**
 * POST /api/chat - Handle streaming chat requests
 */
export async function POST(request: Request) {
  // 1. Authentication
  const session = await getServerAuthSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Parse request
  const formData = await request.formData();
  const message = formData.get('message') as string;
  const model = formData.get('model') as string || 'gpt-4o-mini';
  const mode = formData.get('mode') as 'auto' | 'instant' | 'thinking' | 'pro' || 'auto';
  const sessionId = formData.get('sessionId') as string;

  // 3. Get model configuration
  const modelMeta = MODEL_CATALOG[model];
  const tuning = getModeTuning(model, mode);
  const apiType = modelMeta?.api || 'chat';

  // 4. Create/fetch chat session
  const chatSession = await prisma.chatSession.upsert({
    where: { id: sessionId || 'new' },
    update: {},
    create: {
      userId: session.user.id,
      title: message.slice(0, 60) || 'New conversation',
    },
  });

  // 5. Save user message
  const userMessage = await prisma.message.create({
    data: {
      sessionId: chatSession.id,
      role: 'user',
      content: message,
    },
  });

  // 6. Fetch conversation history
  const conversationHistory = await prisma.message.findMany({
    where: { sessionId: chatSession.id },
    orderBy: { createdAt: 'asc' },
    take: 30,
  });

  // 7. Initialize OpenAI client
  const openai = getOpenAIClient();
  const encoder = new TextEncoder();

  // 8. Create ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send session metadata first
        controller.enqueue(
          encoder.encode(createSseEvent('session', {
            sessionId: chatSession.id,
            messageId: userMessage.id,
          }))
        );

        let assistantResponse = '';
        let inputTokens = 0;
        let outputTokens = 0;

        // 9. Route to appropriate API
        if (apiType === 'chat') {
          // ========== CHAT COMPLETIONS API ==========
          const chatStream = await openai.chat.completions.create({
            model,
            messages: conversationHistory.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
            stream: true,
            temperature: tuning?.temperature || 0.7,
            top_p: tuning?.topP || 1,
            max_tokens: tuning?.maxOutputTokens || 2048,
          });

          // Stream tokens to client
          for await (const chunk of chatStream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              assistantResponse += content;
              controller.enqueue(
                encoder.encode(createSseEvent('token', { text: content }))
              );
            }

            // Extract usage (last chunk)
            if (chunk.usage) {
              inputTokens = chunk.usage.prompt_tokens || 0;
              outputTokens = chunk.usage.completion_tokens || 0;
            }
          }

        } else if (apiType === 'responses') {
          // ========== RESPONSES API (GPT-5) ==========
          try {
            const responseStream = await openai.responses.stream({
              model,
              input: convertToResponsesFormat(conversationHistory),
              stream: true,
              reasoning: tuning?.reasoningEffort ? { effort: tuning.reasoningEffort } : undefined,
              text: tuning?.verbosity ? { verbosity: tuning.verbosity } : undefined,
              max_output_tokens: tuning?.maxOutputTokens || 32768,
            });

            // Stream tokens to client
            for await (const event of responseStream) {
              if (event.type === 'response.output_text.delta') {
                const delta = event.delta || '';
                if (delta) {
                  assistantResponse += delta;
                  controller.enqueue(
                    encoder.encode(createSseEvent('token', { text: delta }))
                  );
                }
              }
            }

            // Get usage from final response
            const finalResponse = await responseStream.finalResponse();
            inputTokens = finalResponse.usage?.input_tokens || 0;
            outputTokens = finalResponse.usage?.output_tokens || 0;

          } catch (streamError: any) {
            // ========== GPT-5 NON-STREAMING FALLBACK ==========
            if (streamError?.code === 'unsupported_value' && streamError?.param === 'stream') {
              console.warn('GPT-5 streaming not available, using non-streaming fallback');

              const nonStreamResponse = await openai.responses.create({
                model,
                input: convertToResponsesFormat(conversationHistory),
                stream: false,
                reasoning: tuning?.reasoningEffort ? { effort: tuning.reasoningEffort } : undefined,
                max_output_tokens: tuning?.maxOutputTokens,
              });

              // Extract text from complex response structure
              const messageOutput = nonStreamResponse.output?.find((item: any) => item.type === 'message');
              assistantResponse = messageOutput?.content
                ?.filter((item: any) => item.type === 'output_text')
                .map((item: any) => item.text || '')
                .join('') || 'No response';

              // Send complete response as single token
              controller.enqueue(
                encoder.encode(createSseEvent('token', { text: assistantResponse }))
              );

              inputTokens = nonStreamResponse.usage?.input_tokens || 0;
              outputTokens = nonStreamResponse.usage?.output_tokens || 0;
            } else {
              throw streamError;
            }
          }
        }

        // 10. Calculate cost
        const pricing = MODEL_CATALOG[model]?.pricing;
        const costInCents = Math.round(
          ((inputTokens * pricing.input + outputTokens * (pricing.reasoning || pricing.output)) / 1_000_000) * 100
        );

        // 11. Save assistant message
        await prisma.message.create({
          data: {
            sessionId: chatSession.id,
            role: 'assistant',
            content: assistantResponse,
            tokensUsed: inputTokens + outputTokens,
            costInCents,
            model,
          },
        });

        // 12. Update usage stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.usageStats.upsert({
          where: {
            userId_date_model: {
              userId: session.user.id,
              date: today,
              model,
            },
          },
          update: {
            tokensUsed: { increment: inputTokens + outputTokens },
            messagesCount: { increment: 1 },
            costInCents: { increment: costInCents },
          },
          create: {
            userId: session.user.id,
            date: today,
            model,
            tokensUsed: inputTokens + outputTokens,
            messagesCount: 1,
            costInCents,
          },
        });

        // 13. Signal completion
        controller.enqueue(
          encoder.encode(createSseEvent('done', {
            success: true,
            tokens: inputTokens + outputTokens,
            cost: costInCents,
          }))
        );
        controller.close();

      } catch (error) {
        console.error('Chat error:', error);
        controller.enqueue(
          encoder.encode(createSseEvent('error', {
            message: error instanceof Error ? error.message : 'Unknown error',
          }))
        );
        controller.close();
      }
    },
  });

  // 14. Return SSE stream
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Convert Chat Completions format → Responses API format
 */
function convertToResponsesFormat(messages: any[]) {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: [{
      type: msg.role === 'assistant' ? 'output_text' : 'input_text',
      text: msg.content,
    }],
  }));
}
```

---

## Client - Side: Consuming SSE Stream

    ```typescript
'use client';

import { useState } from 'react';

export function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Send message and consume SSE stream
   */
  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    // Prepare form data
    const formData = new FormData();
    formData.append('message', input);
    formData.append('model', 'gpt-4o');
    formData.append('mode', 'auto');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Request failed');

      // Create EventSource-like handler for SSE
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMessage = { role: 'assistant', content: '' };

      setMessages(prev => [...prev, assistantMessage]);

      // Read stream
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event: (.+)$/m);
          const dataMatch = line.match(/^data: (.+)$/m);

          if (!eventMatch || !dataMatch) continue;

          const event = eventMatch[1];
          const data = JSON.parse(dataMatch[1]);

          // Handle different event types
          if (event === 'session') {
            // Session metadata (could store for later reference)
            console.log('Session:', data.sessionId);
          } else if (event === 'token') {
            // Append token to assistant message
            assistantMessage.content += data.text;
            setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }]);
          } else if (event === 'done') {
            // Stream complete
            console.log('Complete! Tokens:', data.tokens, 'Cost:', data.cost, 'cents');
          } else if (event === 'error') {
            throw new Error(data.message);
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${ msg.role } `}>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

---

## Key Implementation Details

### 1. SSE Event Format

    ```
event: token
data: {"text":"Hello"}

event: done
data: {"success":true}

```

Each event is separated by double newline(`\n\n`)

### 2. Error Handling

    ```typescript
try {
  // Try streaming
  const stream = await openai.chat.completions.create({ stream: true });
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    return new Response('Rate limit hit', { status: 429 });
  }
  if (error.code === 'context_length_exceeded') {
    return new Response('Message too long', { status: 400 });
  }
  throw error;
}
```

### 3. Token Counting

    ```typescript
// Chat Completions API
const usage = completion.usage;
const inputTokens = usage.prompt_tokens || 0;
const outputTokens = usage.completion_tokens || 0;

// Responses API
const finalResponse = await stream.finalResponse();
const inputTokens = finalResponse.usage?.input_tokens || 0;
const outputTokens = finalResponse.usage?.output_tokens || 0;
```

### 4. Non - Streaming Fallback(GPT - 5)

When streaming fails for GPT - 5(organization not verified):

    ```typescript
catch (error) {
  if (error.code === 'unsupported_value' && error.param === 'stream') {
    // Fall back to non-streaming
    const response = await openai.responses.create({ stream: false });
    
    // Parse complex response structure
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

** See Also **:
-[API Architecture](../docs/04 - api - architecture.md) - Multi - API integration details
    - [Model Catalog](../docs/03 - model - catalog.md) - All supported models
