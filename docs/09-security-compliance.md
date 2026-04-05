# Security & Compliance

## Security Analysis

### Critical Issues (Remediated in Pilot Production)

| Issue | Risk | Remediation | Status |
|-------|------|-------------|--------|
| **SQLite in Production** | Data loss, concurrency issues | Migrate to PostgreSQL | ✅ Done |
| **No HTTPS** | Credential exposure | Configure SSL/TLS | ✅ Done (via Reverse Proxy) |
| **Database Administration** | Credential exposure via GUI | Secure Adminer Interface | ✅ Done |

### Medium Priority

| Issue | Risk | Remediation |
|-------|------|-------------|
| Input validation | Injection attacks | Enhanced sanitization |
| File upload limits | Storage exhaustion | Enforce size limits (currently 10MB) |
| Rate limiting gaps | Abuse potential | IP-based limiting |
| Session duration | Token theft | Reduce to 8 hours |

### Low Priority

| Issue | Risk | Remediation |
|-------|------|-------------|
| Verbose errors | Info disclosure | Generic error messages |
| Outdated deps | Vulnerabilities | Regular dependency updates |
| CORS policy | XSS potential | Restrict origins |

---

## GDPR Compliance

### Current Status: Production Scale Ready (High Compliance)

### Requirements Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Lawful basis | ⏳ | Need explicit institutional consent policy finalized |
| Privacy policy | ⏳ | Legal text pending HR validation |
| Data minimization | ✅ | Only essential data collected |
| Right to access | ⏳ | Export endpoints mapping structured |
| Right to erasure | ✅ | User Deletion Endpoints functional w/ Cascades |
| Data portability | ❌ | JSON export needed |
| Consent records | ⏳ | Session banners configured |
| Encryption at rest | ✅ | Robust `iv` and `reasoningIv` schema integration complete |
| Audit logging | ✅ | Adminer logic secured & system access traces enabled |

### Priority Actions

1. **Privacy Policy** (Pending Institutional Approval)
   - Clear explanation of AI data processing
   - Third-party disclosure (OpenAI)
   - User rights documentation

2. **Data Export** (Est. 8 hours)
   - Export all user data as JSON
   - Include messages, attachments, usage stats

3. **Right to Erasure** (✅ Competed)
   - Delete endpoint with cascade operational
   - Verify complete removal
   - Confirmation to user

4. **Message Encryption** (✅ Completed)
   - Encrypted message content at rest
   - Split IV structures for generic vs deep-reasoning text schemas
   - Performance validated on DB level

---

## Production Deployment Status

Platform is currently successfully deployed utilizing SAMK's on-premise infrastructure under an actively managed Pilot Program. Future actions revolve around scaling access from staff to student bodies and hardening minor application-layer limits.

---

**See Also**:
- [Enterprise Features](06-enterprise-features.md) - Rate limiting, admin
- [Future Roadmap](10-future-roadmap.md) - Enhanced security plans
