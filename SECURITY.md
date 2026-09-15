# Security Policy — Sathyamithra

## Reporting a Vulnerability

If you discover a security vulnerability within **Sathyamithra**, please notify the security team directly at **security@sathyamithra.gov.in**.

Please do NOT publicly report security vulnerabilities until they have been reviewed and mitigated.

## Security Architecture Highlights

1. **Authentication**: JWT Bearer Tokens with `bcrypt` password hashing.
2. **Role-Based Access Control**: Strict server-side RBAC for `ADMIN`, `CONTENT_EDITOR`, `COMMUNITY_MODERATOR`, and `CITIZEN`.
3. **Object-Level Authorization**: Direct resource ownership checks (`resource.user_id == current_user.id`) prevent BOLA/IDOR attacks.
4. **AI Safety**: RAG prompt injection defense and grounding source transparency.
5. **File Storage**: Vault uploads are restricted to `.pdf`, `.jpg`, `.jpeg`, and `.png` with 10MB limit and filename path traversal sanitization.
6. **Headers**: HSTS, `X-Content-Type-Options`, `X-Frame-Options`, and `X-Request-ID` correlation logging.
