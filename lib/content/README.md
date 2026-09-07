# RapidReach built-in content

RapidReach ships with a built-in engineering knowledge catalog so a fresh deployment is useful before Supabase contains any editorial rows.

The catalog currently provides:

- production-focused engineering articles across cloud-native, platform, SRE, security, Go, distributed systems, and AI infrastructure topics
- structured learning paths whose modules reference catalog article IDs
- deterministic metadata for search, category filters, blog detail routes, and learning-path curriculum links

`content-service.ts` merges database content with this catalog. Database rows win when a slug overlaps, while built-in content remains available as a deployment-safe baseline.

This content is not presented as live telemetry or user-generated engagement data. Enrollment, likes, views, and completion metrics for built-in content default to zero rather than fabricated numbers.
