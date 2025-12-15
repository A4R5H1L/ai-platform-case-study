/**
 * Image Generation Implementation
 * 
 * Demonstrates DALL-E integration with safety filtering,
 * quality controls, and server-side storage.
 */

import { getOpenAIClient } from '@/lib/openai';
import { MODEL_CATALOG } from '@/lib/config';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// ===== Type Definitions =====

interface ImageGenerationParams {
    prompt: string;
    model: 'dall-e-2' | 'dall-e-3' | 'gpt-image-1';
    size?: '256x256' | '512x512' | '1024x1024' | '1024x1536' | '1536x1024';
    quality?: 'low' | 'medium' | 'high';
    userId: string;
    sessionId: string;
}

interface GeneratedImage {
    url: string;
    localPath: string;
    attachmentId: string;
}

// ===== Safety Filtering =====

/**
 * Apply content policy safety rewrites for DALL-E 3
 * Automatically sanitizes prompts to comply with OpenAI policies
 */
function applySafetyFiltering(prompt: string, model: string): string {
    if (model !== 'dall-e-3') {
        return prompt;
    }

    return prompt
        // Age-related safety
        .replace(/\b(baby|infant|child|toddler|kid|minor)\b/gi, 'young adult')

        // Explicit content safety
        .replace(/\b(nude|naked|sexual|explicit|nsfw)\b/gi, 'artistic')
        .replace(/\b(erotic|sensual|seductive)\b/gi, 'elegant')

        // Violence safety
        .replace(/\b(violence|violent|blood|gore|death)\b/gi, 'dramatic')
        .replace(/\b(weapon|gun|knife|sword)\b/gi, 'tool')

        // Other policy concerns
        .replace(/\b(terrorist|terrorism|bomb)\b/gi, 'action scene')
        .replace(/\b(drugs|cocaine|heroin)\b/gi, 'abstract concept');
}

// ===== Quality Mapping =====

/**
 * Map internal quality levels to DALL-E API parameters
 */
function mapQuality(quality: string, model: string): 'standard' | 'hd' | undefined {
    if (model !== 'dall-e-3') {
        return undefined; // DALL-E 2 doesn't support quality parameter
    }

    switch (quality) {
        case 'high':
            return 'hd';
        case 'medium':
        case 'low':
        default:
            return 'standard';
    }
}

// ===== Size Validation =====

/**
 * Validate and normalize image size for model
 */
function normalizeSize(size: string | undefined, model: string): string {
    const dalleE2Sizes = ['256x256', '512x512', '1024x1024'];
    const dalleE3Sizes = ['1024x1024', '1024x1536', '1536x1024'];

    if (model === 'dall-e-2') {
        return dalleE2Sizes.includes(size || '') ? size! : '1024x1024';
    }

    if (model === 'dall-e-3') {
        return dalleE3Sizes.includes(size || '') ? size! : '1024x1024';
    }

    return '1024x1024'; // Default for gpt-image-1
}

// ===== Main Generation Function =====

/**
 * Generate an image using OpenAI's Images API
 * Includes safety filtering, server storage, and database tracking
 */
export async function generateImage(params: ImageGenerationParams): Promise<GeneratedImage> {
    const { prompt, model, size, quality, userId, sessionId } = params;

    const openai = getOpenAIClient();

    // 1. Apply safety filtering
    const safePrompt = applySafetyFiltering(prompt, model);

    // 2. Prepare API parameters
    const imageParams: Parameters<typeof openai.images.generate>[0] = {
        model,
        prompt: safePrompt,
        size: normalizeSize(size, model) as any,
        response_format: 'b64_json',
        n: 1,
    };

    // Add quality for DALL-E 3
    if (model === 'dall-e-3') {
        imageParams.quality = mapQuality(quality || 'medium', model);
    }

    // 3. Generate image
    console.log(`Generating image with ${model}:`, safePrompt.slice(0, 50) + '...');
    const response = await openai.images.generate(imageParams);

    const base64Data = response.data[0].b64_json;
    if (!base64Data) {
        throw new Error('No image data returned from API');
    }

    // 4. Save to disk
    const uploadsDir = join(process.cwd(), 'uploads', 'generated');
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}_${randomUUID()}.png`;
    const localPath = join(uploadsDir, filename);
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(localPath, buffer);

    // 5. Create database record
    const message = await prisma.message.create({
        data: {
            sessionId,
            role: 'assistant',
            content: `Generated image: "${prompt.slice(0, 100)}"`,
            model,
            tokensUsed: 0, // Images don't use tokens in traditional sense
            costInCents: calculateImageCost(model, quality),
        },
    });

    const attachment = await prisma.attachment.create({
        data: {
            messageId: message.id,
            type: 'generated_image',
            name: filename,
            mimeType: 'image/png',
            size: buffer.length,
            localPath: `/uploads/generated/${filename}`,
        },
    });

    // 6. Update usage stats
    await prisma.usageStats.upsert({
        where: {
            userId_date_model: {
                userId,
                date: new Date(new Date().setHours(0, 0, 0, 0)),
                model,
            },
        },
        update: {
            messagesCount: { increment: 1 },
            costInCents: { increment: calculateImageCost(model, quality) },
        },
        create: {
            userId,
            date: new Date(new Date().setHours(0, 0, 0, 0)),
            model,
            tokensUsed: 0,
            messagesCount: 1,
            costInCents: calculateImageCost(model, quality),
        },
    });

    return {
        url: `/api/attachments/${attachment.id}`,
        localPath,
        attachmentId: attachment.id,
    };
}

// ===== Cost Calculation =====

/**
 * Calculate image generation cost in cents
 */
function calculateImageCost(model: string, quality?: string): number {
    switch (model) {
        case 'dall-e-2':
            return 200; // $2.00
        case 'dall-e-3':
            return quality === 'high' ? 800 : 400; // $8.00 HD, $4.00 standard
        case 'gpt-image-1':
            return 500; // Estimated
        default:
            return 0;
    }
}

// ===== Example Usage =====

/*
const result = await generateImage({
  prompt: 'A futuristic university campus with AI technology',
  model: 'dall-e-3',
  size: '1024x1024',
  quality: 'high',
  userId: session.user.id,
  sessionId: chatSession.id,
});

console.log('Generated image:', result.url);
*/
