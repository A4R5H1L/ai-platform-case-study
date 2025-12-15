# Cost Comparison Charts

## Monthly Cost: Custom vs Commercial

```mermaid
pie title Monthly Cost Comparison (60 Users)
    "Custom Platform" : 162
    "Savings vs ChatGPT Pro" : 1218
```

## Cost Breakdown

```mermaid
xychart-beta
    title "Monthly Cost by Solution (€)"
    x-axis [ChatGPT Pro, ChatGPT Enterprise Low, ChatGPT Enterprise High, Custom Platform]
    y-axis "Cost in €" 0 --> 4000
    bar [1380, 1800, 3600, 162]
```

## Scaling Analysis

### Cost at Different User Counts

| Users | ChatGPT Pro | Custom Platform | Savings |
|-------|-------------|-----------------|---------|
| 60 | €1,380 | €162 | **88%** |
| 100 | €2,300 | €270 | **88%** |
| 200 | €4,600 | €540 | **88%** |
| 500 | €11,500 | €1,350 | **88%** |

```mermaid
xychart-beta
    title "Cost Scaling: ChatGPT Pro vs Custom"
    x-axis [60, 100, 200, 300, 400, 500]
    y-axis "Monthly Cost (€)" 0 --> 12000
    line [1380, 2300, 4600, 6900, 9200, 11500]
    line [162, 270, 540, 810, 1080, 1350]
```

## User Segment Cost Distribution

### Usage Assumptions

```mermaid
pie title User Distribution
    "Light Users (60%)" : 60
    "Medium Users (30%)" : 30
    "Heavy Users (10%)" : 10
```

### Cost Contribution by Segment

```mermaid
pie title Cost Contribution (€162 total)
    "Light (€18)" : 18
    "Medium (€54)" : 54
    "Heavy (€90)" : 90
```

## ROI Timeline

### Year 1 Financial Summary

| Category | Amount |
|----------|--------|
| Development (one-time) | €1,000 |
| API costs (12 months) | €1,944 |
| Maintenance | €500 |
| **Total Investment** | **€3,444** |
| **Avoided Costs** | **€16,560** |
| **Net Savings** | **€13,116** |

### Break-Even Analysis

```
Month 1: -€1,000 (development) + €1,218 (savings) = +€218
Month 2: +€218 + €1,218 = +€1,436
Month 3: +€2,654
...
Month 12: +€13,116 (cumulative savings)
```

**Break-even: < 1 month**

---

## Caveats

> All figures are **estimates** based on projected usage patterns.
> Actual costs depend on pilot program validation.

### Variables That Affect Cost

**Higher Cost**:
- More heavy users
- Extensive o3/GPT-5 usage
- Large image generation volume

**Lower Cost**:
- More light users
- GPT-4o-mini dominant usage
- Effective rate limiting

---

**See Also**:
- [Cost Analysis](../docs/08-cost-analysis.md) - Detailed breakdown
- [Executive Summary](../docs/01-executive-summary.md) - Business case
