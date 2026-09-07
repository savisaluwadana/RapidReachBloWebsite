# RapidReach MCP

RapidReach MCP is the agent/IDE interface to the Engineering Intelligence platform. It uses the official `modelcontextprotocol/go-sdk` and can run over stdio or stateless Streamable HTTP.

## Run locally

```bash
cd mcp
go mod download
go run ./cmd/server
```

For remote HTTP:

```bash
go run ./cmd/server -http :8080
# MCP endpoint: http://localhost:8080/mcp
# Health:       http://localhost:8080/healthz
```

## Initial tools

- `search_engineering_knowledge`
- `explain_system`
- `diagnose_incident`
- `recommend_learning`
- `explain_release_impact`
- `review_kubernetes_manifest`
- `assess_skill_gap`
- `review_architecture`
- `compare_technologies`
- `generate_runbook`

The service also publishes `rapidreach://knowledge/*` resources.

## Architecture boundary

The current implementation deliberately uses a small deterministic seed catalog. It does **not** pretend that demo release/advisory data is live production intelligence. The tool contracts are designed so the seed implementation can be replaced by production adapters for:

- RapidReach knowledge/vector search
- GitHub releases and repository ownership
- CNCF/project release feeds
- CVE/advisory sources
- Kubernetes/cloud inventory
- Backstage/service catalogs
- incident/observability providers
- organization skills and evaluation data

Before enterprise deployment, add OAuth/OIDC authorization, tenant scoping, audit logging, tool-level policy, rate limits, data residency controls, and per-organization graph isolation.
