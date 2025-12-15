/**
 * Rate Limiting Implementation
 * 
 * Database-driven per-role, per-model rate limiting.
 * Checks daily request count and monthly token usage.
 */

import { prisma } from '@/lib/prisma';

// ===== Type Definitions =====

interface RateLimitResult {
    allowed: boolean;
    reason?: string;
    resetAt?: Date;
    usage?: {
        daily: { used: number; limit: number };
        monthly: { used: number; limit: number };
    };
}

interface UserContext {
    userId: string;
    userRole: 'student' | 'staff' | 'admin';
}

// ===== Main Rate Limit Check =====

/**
 * Check if user is within rate limits for a specific model
 * Returns allowed status and reset time if limited
 */
export async function checkRateLimit(
    user: UserContext,
    model: string
): Promise<RateLimitResult> {
    // Admins bypass rate limits
    if (user.userRole === 'admin') {
        return { allowed: true };
    }

    // Get limits for this model and role
    const limits = await prisma.modelRateLimit.findUnique({
        where: {
            model_userRole: {
                model,
                userRole: user.userRole,
            },
        },
    });

    // No limits configured = allow
    if (!limits) {
        return { allowed: true };
    }

    // Get current usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Daily usage check
    const dailyUsage = await prisma.usageStats.aggregate({
        where: {
            userId: user.userId,
            model,
            date: today,
        },
        _sum: {
            messagesCount: true,
        },
    });

    const dailyRequests = dailyUsage._sum.messagesCount || 0;

    // Check daily limit
    if (limits.dailyRequestLimit > 0 && dailyRequests >= limits.dailyRequestLimit) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return {
            allowed: false,
            reason: `Daily request limit reached for ${model}`,
            resetAt: tomorrow,
            usage: {
                daily: { used: dailyRequests, limit: limits.dailyRequestLimit },
                monthly: { used: 0, limit: limits.monthlyTokenLimit },
            },
        };
    }

    // Monthly usage check
    const monthlyUsage = await prisma.usageStats.aggregate({
        where: {
            userId: user.userId,
            model,
            date: { gte: startOfMonth },
        },
        _sum: {
            tokensUsed: true,
        },
    });

    const monthlyTokens = monthlyUsage._sum.tokensUsed || 0;

    // Check monthly limit
    if (limits.monthlyTokenLimit > 0 && monthlyTokens >= limits.monthlyTokenLimit) {
        const nextMonth = new Date(startOfMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        return {
            allowed: false,
            reason: `Monthly token limit reached for ${model}`,
            resetAt: nextMonth,
            usage: {
                daily: { used: dailyRequests, limit: limits.dailyRequestLimit },
                monthly: { used: monthlyTokens, limit: limits.monthlyTokenLimit },
            },
        };
    }

    // All checks passed
    return {
        allowed: true,
        usage: {
            daily: { used: dailyRequests, limit: limits.dailyRequestLimit },
            monthly: { used: monthlyTokens, limit: limits.monthlyTokenLimit },
        },
    };
}

// ===== Update Usage After Request =====

/**
 * Record usage after a successful request
 * Called after AI response is complete
 */
export async function recordUsage(
    userId: string,
    model: string,
    tokensUsed: number,
    costInCents: number
): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.usageStats.upsert({
        where: {
            userId_date_model: {
                userId,
                date: today,
                model,
            },
        },
        update: {
            tokensUsed: { increment: tokensUsed },
            messagesCount: { increment: 1 },
            costInCents: { increment: costInCents },
        },
        create: {
            userId,
            date: today,
            model,
            tokensUsed,
            messagesCount: 1,
            costInCents,
        },
    });
}

// ===== API Route Integration =====

/**
 * Middleware-style rate limit check for API routes
 * Returns 429 response if rate limited
 */
export async function rateLimitMiddleware(
    user: UserContext,
    model: string
): Promise<Response | null> {
    const result = await checkRateLimit(user, model);

    if (!result.allowed) {
        return new Response(
            JSON.stringify({
                error: 'Rate limit exceeded',
                reason: result.reason,
                resetAt: result.resetAt?.toISOString(),
                usage: result.usage,
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'X-RateLimit-Reset': result.resetAt?.toISOString() || '',
                },
            }
        );
    }

    return null; // Allowed, continue processing
}

// ===== Admin: Get User Usage =====

/**
 * Get usage summary for a user (admin dashboard)
 */
export async function getUserUsageSummary(userId: string) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const usage = await prisma.usageStats.groupBy({
        by: ['model'],
        where: {
            userId,
            date: { gte: startOfMonth },
        },
        _sum: {
            tokensUsed: true,
            messagesCount: true,
            costInCents: true,
        },
    });

    return usage.map((u) => ({
        model: u.model,
        tokensUsed: u._sum.tokensUsed || 0,
        messages: u._sum.messagesCount || 0,
        costCents: u._sum.costInCents || 0,
    }));
}

// ===== Admin: Set Rate Limits =====

/**
 * Configure rate limits for a model/role combination
 */
export async function setRateLimit(
    model: string,
    userRole: 'student' | 'staff' | 'admin',
    dailyRequestLimit: number,
    monthlyTokenLimit: number
): Promise<void> {
    await prisma.modelRateLimit.upsert({
        where: {
            model_userRole: { model, userRole },
        },
        update: {
            dailyRequestLimit,
            monthlyTokenLimit,
        },
        create: {
            model,
            userRole,
            dailyRequestLimit,
            monthlyTokenLimit,
        },
    });
}

// ===== Example Usage =====

/*
// In API route:
export async function POST(request: Request) {
  const session = await getServerAuthSession();
  const user = { userId: session.user.id, userRole: session.user.role };
  const model = 'gpt-5';

  // Check rate limit
  const rateLimitResponse = await rateLimitMiddleware(user, model);
  if (rateLimitResponse) {
    return rateLimitResponse; // 429 response
  }

  // Process request...
  const response = await generateAIResponse(model, message);

  // Record usage
  await recordUsage(user.userId, model, response.tokensUsed, response.costCents);

  return Response.json(response);
}
*/
