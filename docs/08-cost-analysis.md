# Cost Analysis

## Problem: Commercial AI Licensing

### ChatGPT Pricing (2024)

| Plan | Price | Features |
|------|-------|----------|
| **ChatGPT Pro** | €23/user/month | GPT-4, limited usage |
| **ChatGPT Enterprise** | €30-60/user/month | Unlimited, admin controls |

### Issue for Universities

- **Fixed costs**: Pay same whether user sends 5 or 500 messages
- **Budget waste**: Light users subsidize heavy users
- **No visibility**: Can't track or optimize usage
- **Scale problems**: 60 users × €23 = €1,380/month minimum

---

## Solution: Usage-Based Pricing

### OpenAI API Pricing

Pay only for tokens consumed:

| Model | Input (1M tokens) | Output (1M tokens) |
|-------|-------------------|-------------------|
| GPT-4o-mini | $0.15 | $0.60 |
| GPT-4o | $2.50 | $10.00 |
| GPT-5 | $1.25 | $10.00 |
| o1-preview | $15.00 | $60.00 |

### Token Context

- Average message: ~500 tokens input, ~1,000 tokens output
- Average conversation: ~5 exchanges
- 1 million tokens ≈ 750,000 words

---

## Usage Projections

### User Segments (60 users)

| Segment | % | Users | Usage Pattern |
|---------|---|-------|---------------|
| **Light** | 60% | 36 | 5-10 conversations/month |
| **Medium** | 30% | 18 | 20-40 conversations/month |
| **Heavy** | 10% | 6 | Daily usage |

### Estimated Token Usage

| Segment | Tokens/User/Month | Est. Cost |
|---------|-------------------|-----------|
| Light | ~5,000 | €0.50 |
| Medium | ~50,000 | €3.00 |
| Heavy | ~200,000 | €15.00 |

### Monthly Cost Projection

```
Light:  36 users × €0.50  = €18
Medium: 18 users × €3.00  = €54
Heavy:   6 users × €15.00 = €90
──────────────────────────────
Total:  60 users           = €162/month (estimated)
```

---

## Comparison

### 60-User Pilot

| Solution | Monthly Cost | Annual Cost |
|----------|--------------|-------------|
| ChatGPT Pro | €1,380 | €16,560 |
| Custom Platform | €162 (est.) | €1,944 (est.) |
| **Savings** | **€1,218** | **€14,616** |

### Percentage Reduction

**88% cost reduction** (estimated, pending pilot validation)

---

## ROI Analysis

### Year 1 Costs

| Item | Cost |
|------|------|
| Development (one-time) | €1,000 |
| API usage (12 months) | €1,944 |
| Maintenance | €500 |
| **Total** | **€3,444** |

### Year 1 Savings

| Item | Amount |
|------|--------|
| Avoided ChatGPT Pro | €16,560 |
| Platform costs | -€3,444 |
| **Net Savings** | **€13,116** |

### ROI

- **Break-even**: < 1 month
- **ROI**: 381%
- **Payback period**: ~1.5 months

---

## Scalability

### Cost at Different Scales

| Users | ChatGPT Pro | Custom Platform | Savings |
|-------|-------------|-----------------|---------|
| 60 | €1,380/mo | €162/mo | 88% |
| 200 | €4,600/mo | €540/mo | 88% |
| 500 | €11,500/mo | €1,350/mo | 88% |

### Key Insight

Usage-based pricing scales linearly with actual usage, not user count. Light users cost almost nothing.

---

## Caveats

> **Note**: All figures are projections based on estimated usage patterns. Actual costs will depend on real pilot program data.

### Factors That Could Increase Costs

- More heavy users than projected
- Extensive use of o-series/GPT-5 (higher cost)
- Heavy image generation
- Larger context windows

### Factors That Could Decrease Costs

- More light users
- Effective rate limiting
- Model selection guidance (use cheaper models when appropriate)
- Caching (future enhancement)

---

**See Also**:
- [Model Catalog](03-model-catalog.md) - Full pricing details
- [Rate Limiting](06-enterprise-features.md) - Cost control mechanisms
- [Executive Summary](01-executive-summary.md) - Business case
