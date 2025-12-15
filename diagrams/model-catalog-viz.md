# Model Catalog Visualization

## Complete Model Overview

```mermaid
graph TB
    subgraph GPT4["GPT-4 Family"]
        4om[GPT-4o-mini<br/>$0.15/$0.60]
        4o[GPT-4o<br/>$2.50/$10.00]
        41[GPT-4.1<br/>$2.50/$10.00]
    end

    subgraph OSeries["o-Series Reasoning"]
        o1m[o1-mini<br/>$3/$12 +$12 reasoning]
        o1p[o1-preview<br/>$15/$60 +$60 reasoning]
        o3[o3<br/>$20/$80 +$80 reasoning]
        o3m[o3-mini<br/>$3.50/$14 +$14 reasoning]
    end

    subgraph GPT5["GPT-5 Flagship"]
        g5[GPT-5<br/>$1.25/$10 +$10 reasoning]
        g5m[GPT-5-mini<br/>$0.25/$2 +$2 reasoning]
        g5n[GPT-5-nano<br/>$0.05/$0.40]
    end

    subgraph Image["Image Generation"]
        d2[DALL-E 2<br/>$2/image]
        d3[DALL-E 3<br/>$4-8/image]
        gi[gpt-image-1<br/>$5/$40]
    end

    GPT4 --> ChatAPI[Chat Completions API]
    OSeries --> ChatAPI
    GPT5 --> RespAPI[Responses API]
    Image --> ImgAPI[Images API]
```

## Model Selection Guide

```mermaid
graph TD
    Start[User Query] --> Type{Query Type?}
    
    Type -->|Simple Q&A| Simple[GPT-4o-mini]
    Type -->|Complex Analysis| Complex{Budget?}
    Type -->|Reasoning Problem| Reason{Speed vs Quality?}
    Type -->|Image Generation| Image{Quality?}
    
    Complex -->|Low| 4om[GPT-4o-mini<br/>Instant mode]
    Complex -->|Medium| 4o[GPT-4o<br/>Auto mode]
    Complex -->|High| g5[GPT-5<br/>Thinking mode]
    
    Reason -->|Fast| o1m[o1-mini]
    Reason -->|Best| o3[o3]
    
    Image -->|Fast/Cheap| d2[DALL-E 2]
    Image -->|High Quality| d3[DALL-E 3 HD]
```

## Pricing Comparison

### Cost per 1M Tokens

| Model | Input | Output | Reasoning | Total (avg) |
|-------|-------|--------|-----------|-------------|
| GPT-4o-mini | $0.15 | $0.60 | - | ~$0.38 |
| GPT-4o | $2.50 | $10.00 | - | ~$6.25 |
| o1-mini | $3.00 | $12.00 | $12.00 | ~$9.00 |
| o3 | $20.00 | $80.00 | $80.00 | ~$60.00 |
| GPT-5 | $1.25 | $10.00 | $10.00 | ~$7.08 |
| GPT-5-nano | $0.05 | $0.40 | $0.40 | ~$0.28 |

### Relative Cost (GPT-4o-mini = 1x)

```
GPT-4o-mini  ████ 1x (baseline)
GPT-5-nano   ████ 0.7x (cheapest overall!)
GPT-4o       ████████████████ 16x
GPT-5-mini   ██████ 5x
GPT-5        ███████████████████ 19x
o1-mini      █████████████████████████ 24x
o3-mini      ██████████████████████████████ 37x
o1-preview   █████████████████████████████████████████████████████████████████████████ 158x
o3           ███████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████ 158x
```

## Mode Comparison

### Token Limits by Mode

| Mode | GPT-4o-mini | GPT-4o | GPT-5 |
|------|-------------|--------|-------|
| Instant | 1,024 | 2,048 | 16,384 |
| Auto | 2,048 | 4,096 | 32,768 |
| Thinking | 4,096 | 6,144 | 65,536 |
| Pro | 4,096 | 6,144 | 128,000 |

### Temperature by Mode

| Mode | Temperature | Use Case |
|------|-------------|----------|
| Instant | 0.35-0.4 | Quick, deterministic |
| Auto | 0.6-0.7 | Balanced |
| Thinking | 0.5-0.6 | Thorough |
| Pro | 0.2-0.3 | Precise |

---

**See Also**:
- [Model Catalog](../docs/03-model-catalog.md) - Full documentation
- [API Architecture](../docs/04-api-architecture.md) - API routing
