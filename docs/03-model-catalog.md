# Model Catalog - 8 Core Integrated AI Models

## Overview

The platform perfectly integrates **8 distinct OpenAI models** spread across different capability families, each strictly optimized via a unified API gateway (encompassing `Responses API`, `Chat Completions`, and `Images API` natively).

## Model Families

### 1. GPT-4 Family - Reliable Workhorses

**Characteristics**:
- Vision-capable (analyze images via multi-part forms)
- Fast response times
- Cost-effective streaming via Server-Sent Events

#### GPT-4o-mini
**Best for**: High-volume, cost-sensitive applications

| Property | Value |
|----------|-------|
| **Pricing** | $0.15 input / $0.60 output per 1M tokens |
| **Vision** | ✅ Supported |
| **Max Tokens** | 2,048 (auto) -> up to 4,096 (pro) |
| **API Backend** | Responses API |

#### GPT-4o
**Best for**: High-intelligence tasks requiring strong conversational accuracy

| Property | Value |
|----------|-------|
| **Pricing** | $2.50 input / $10.00 output per 1M tokens |
| **Vision** | ✅ Supported |
| **Max Tokens** | 4,096 (auto) -> up to 6,144 (thinking) |
| **API Backend** | Responses API |

---

### 2. GPT-5 Reasoning Series - Flagship Logic

**Characteristics**:
- Strict structured reasoning configurations
- Mode-picker integration (adjusts reasoning effort parameters algorithmically)
- Extremely high token contexts designed for complex institutional workloads

#### GPT-5
**Best for**: Standard Flagship Reasoning

| Property | Value |
|----------|-------|
| **Pricing** | $1.25 input / $10.00 output (+ $10 reasoning) |
| **Max Tokens** | 32,768 (auto) -> up to 128,000 (pro) |
| **Reasoning Effort** | low / medium / high |
| **API Backend** | Responses API |

#### GPT-5.2
**Best for**: Advanced Flagship Reasoning

| Property | Value |
|----------|-------|
| **Pricing** | $1.75 input / $14.00 output (+ $14 reasoning) |
| **Max Tokens** | 32,768 (auto) -> up to 128,000 (pro) |
| **Reasoning Effort** | low / medium / high / xhigh |
| **API Backend** | Responses API |

#### GPT-5 Pro
**Best for**: Elite Flagship with maximized logic parameters

| Property | Value |
|----------|-------|
| **Pricing** | $15.00 input / $120.00 output (+ $120 reasoning) |
| **Max Tokens** | 4,096 tracking (locked auto-mode) |
| **Reasoning Effort** | locked to high |
| **API Backend** | Responses API |

---

### 3. Dedicated Researchers

#### o3-deep-research
**Best for**: Autonomous multi-step deep web exploration

| Property | Value |
|----------|-------|
| **Pricing** | $10.00 input / $40.00 output (+ $40 reasoning) |
| **Capabilities** | ✅ Live web access (`web_search_preview` tools) |
| **Max Tokens** | Up to 100k generated content |
| **API Backend** | Responses API |

---

### 4. Image Generation - Creative AI

#### DALL-E 3
**Best for**: High-quality, robust image generation

| Property | Value |
|----------|-------|
| **Pricing** | $4.00 input / $8.00 output per image generated |
| **Output** | Strict base64/URL payloads routed back through frontend |
| **API Backend** | Images API |

#### GPT Image 1
**Best for**: Bleeding-edge experimental generation pipelines

| Property | Value |
|----------|-------|
| **Pricing** | $10.00 input / $40.00 output per execution |
| **Output** | Advanced generation formats |
| **API Backend** | Images API |

---

## Mode Tuning System

Models that support mode selection (`supportsModePicker: true` like GPT-5 and GPT-5.2) adjust their hyperparameters dynamically:

- **Auto**: Balanced verbosity and reasoning
- **Instant**: Low verbosity/reasoning to severely constrain token ceilings
- **Thinking**: High verbosity and high reasoning effort
- **Pro**: Extreme capabilities (`xhigh` reasoning) and massive context expansions (up to 128k output)
