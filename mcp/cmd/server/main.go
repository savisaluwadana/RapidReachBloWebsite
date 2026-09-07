package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

type KnowledgeEntry struct {
	ID      string   `json:"id"`
	Title   string   `json:"title"`
	Domain  string   `json:"domain"`
	Summary string   `json:"summary"`
	Tags    []string `json:"tags"`
}

type AuthResult struct {
	Active         bool     `json:"active"`
	OrganizationID string   `json:"organizationId"`
	Scopes         []string `json:"scopes"`
	Plan           string   `json:"plan"`
}

var knowledge = []KnowledgeEntry{
	{ID: "kubernetes-scheduling", Title: "Kubernetes scheduling", Domain: "Runtime", Summary: "How requests, limits, affinity, taints, topology and scheduler decisions interact.", Tags: []string{"kubernetes", "scheduler", "pods", "resources"}},
	{ID: "cilium-networking", Title: "Cilium networking", Domain: "Networking", Summary: "eBPF-based networking, policy enforcement, observability and common traffic failure modes.", Tags: []string{"cilium", "ebpf", "network-policy", "hubble"}},
	{ID: "gitops-reconciliation", Title: "GitOps reconciliation", Domain: "Delivery", Summary: "Desired state, drift, reconciliation loops, promotion safety and rollback trade-offs.", Tags: []string{"gitops", "argocd", "flux", "delivery"}},
	{ID: "observability-debugging", Title: "Observability-driven debugging", Domain: "Reliability", Summary: "Use metrics, logs, traces and events to build and falsify production hypotheses.", Tags: []string{"observability", "sre", "metrics", "tracing"}},
	{ID: "incident-reasoning", Title: "Incident reasoning", Domain: "Reliability", Summary: "Evidence-first diagnosis, blast-radius control, safe remediation and post-incident learning.", Tags: []string{"incident", "sre", "runbook", "debugging"}},
	{ID: "supply-chain-security", Title: "Software supply-chain security", Domain: "Security", Summary: "Artifact provenance, image scanning, policy, secrets and deployment controls.", Tags: []string{"security", "supply-chain", "policy", "containers"}},
}

func textResult(text string) (*mcp.CallToolResult, any, error) {
	return &mcp.CallToolResult{Content: []mcp.Content{&mcp.TextContent{Text: text}}}, nil, nil
}

func searchKnowledge(_ context.Context, _ *mcp.CallToolRequest, in struct {
	Query string `json:"query" jsonschema:"engineering topic, symptom, technology, or failure mode"`
}) (*mcp.CallToolResult, any, error) {
	q := strings.ToLower(strings.TrimSpace(in.Query))
	if q == "" {
		return textResult("query is required")
	}
	type scored struct {
		entry KnowledgeEntry
		score int
	}
	matches := []scored{}
	for _, entry := range knowledge {
		haystack := strings.ToLower(entry.Title + " " + entry.Domain + " " + entry.Summary + " " + strings.Join(entry.Tags, " "))
		score := 0
		for _, token := range strings.Fields(q) {
			if strings.Contains(haystack, token) {
				score++
			}
		}
		if score > 0 {
			matches = append(matches, scored{entry: entry, score: score})
		}
	}
	sort.Slice(matches, func(i, j int) bool { return matches[i].score > matches[j].score })
	if len(matches) == 0 {
		return textResult("No seeded RapidReach knowledge matched. Connect the production knowledge index adapter for broader retrieval.")
	}
	var b strings.Builder
	b.WriteString("RapidReach matches:\n")
	for i, match := range matches {
		if i >= 5 {
			break
		}
		fmt.Fprintf(&b, "- %s [%s]: %s\n", match.entry.Title, match.entry.Domain, match.entry.Summary)
	}
	return textResult(b.String())
}

func explainSystem(_ context.Context, _ *mcp.CallToolRequest, in struct {
	Topic string `json:"topic" jsonschema:"system or technology to explain"`
}) (*mcp.CallToolResult, any, error) {
	topic := strings.TrimSpace(in.Topic)
	if topic == "" {
		return textResult("topic is required")
	}
	return textResult(fmt.Sprintf("System explanation for %s:\n1. Identify the control plane and data plane.\n2. Map state ownership and reconciliation loops.\n3. Trace dependencies and trust boundaries.\n4. Identify saturation, timeout, retry, consistency and failure-domain risks.\n5. Define the minimum metrics, logs, traces and events needed to prove or falsify hypotheses.\n\nRapidReach seed mode provides the reasoning frame; the production graph adapter should enrich this with specific docs and dependency evidence.", topic))
}

func diagnoseIncident(_ context.Context, _ *mcp.CallToolRequest, in struct {
	Symptoms []string `json:"symptoms" jsonschema:"observed production symptoms and evidence"`
}) (*mcp.CallToolResult, any, error) {
	joined := strings.ToLower(strings.Join(in.Symptoms, " "))
	if len(in.Symptoms) == 0 {
		return textResult("Provide at least one symptom.")
	}
	if strings.Contains(joined, "database") || strings.Contains(joined, "db") || strings.Contains(joined, "connection pool") {
		return textResult("Likely investigation path: correlate application latency with database wait time, pool saturation, slow queries and connection acquisition. Avoid restarting healthy pods before preserving evidence. Validate query latency, pool occupancy, timeout budgets and dependency saturation before remediation.")
	}
	if strings.Contains(joined, "network") || strings.Contains(joined, "timeout") || strings.Contains(joined, "denied") {
		return textResult("Likely investigation path: separate DNS, routing, policy, service discovery and upstream timeout failures. Check denied-flow evidence, endpoint health, name resolution and trace spans before changing policy or restarting workloads.")
	}
	return textResult("Start with a timeline, blast radius and the four evidence planes: metrics, traces, logs and events. Form one falsifiable hypothesis at a time and choose the least-destructive next action that can distinguish between competing causes.")
}

func recommendLearning(_ context.Context, _ *mcp.CallToolRequest, in struct {
	Role  string   `json:"role" jsonschema:"target engineering role"`
	Known []string `json:"known" jsonschema:"skills the learner already feels confident in"`
}) (*mcp.CallToolResult, any, error) {
	role := strings.ToLower(in.Role)
	var path []string
	switch {
	case strings.Contains(role, "sre") || strings.Contains(role, "reliability"):
		path = []string{"Linux & networking", "Observability", "SLOs and error budgets", "Incident reasoning", "Capacity and resilience"}
	case strings.Contains(role, "cloud"):
		path = []string{"Cloud primitives", "Networking & IAM", "Infrastructure as Code", "Kubernetes", "Cost & reliability operations"}
	default:
		path = []string{"Containers", "Kubernetes", "GitOps", "Platform APIs", "Developer portals", "Reliability & policy"}
	}
	known := map[string]bool{}
	for _, item := range in.Known {
		known[strings.ToLower(item)] = true
	}
	remaining := []string{}
	for _, item := range path {
		if !known[strings.ToLower(item)] {
			remaining = append(remaining, item)
		}
	}
	return textResult("Recommended dependency-aware path for " + in.Role + ":\n- " + strings.Join(remaining, "\n- "))
}

func explainReleaseImpact(_ context.Context, _ *mcp.CallToolRequest, in struct {
	Technology string   `json:"technology" jsonschema:"technology with an upstream release or advisory"`
	Stack      []string `json:"stack" jsonschema:"technologies used by the target environment"`
}) (*mcp.CallToolResult, any, error) {
	tech := strings.ToLower(strings.TrimSpace(in.Technology))
	stack := strings.ToLower(strings.Join(in.Stack, " "))
	if tech == "" {
		return textResult("technology is required")
	}
	impact := "No direct seed relationship found. Review compatibility, transitive dependencies and managed-service support before upgrading."
	if strings.Contains(tech, "kubernetes") && (strings.Contains(stack, "eks") || strings.Contains(stack, "cilium") || strings.Contains(stack, "argo")) {
		impact = "Medium-to-high review priority: Kubernetes changes can affect EKS version support, CNI behavior and GitOps API compatibility. Validate API removals, add-on support, networking behavior and staged rollout order."
	}
	if strings.Contains(tech, "cilium") && strings.Contains(stack, "cilium") {
		impact = "High relevance: the technology is directly present. Validate deployed version, policy behavior, kernel/eBPF requirements and observable traffic before remediation or upgrade."
	}
	return textResult("RapidReach release-impact analysis:\n" + impact)
}

func reviewManifest(_ context.Context, _ *mcp.CallToolRequest, in struct {
	Manifest string `json:"manifest" jsonschema:"Kubernetes YAML manifest to review"`
}) (*mcp.CallToolResult, any, error) {
	m := strings.ToLower(in.Manifest)
	if strings.TrimSpace(m) == "" {
		return textResult("manifest is required")
	}
	findings := []string{}
	if !strings.Contains(m, "resources:") {
		findings = append(findings, "Add CPU/memory requests and limits appropriate to the workload.")
	}
	if !strings.Contains(m, "readinessprobe") {
		findings = append(findings, "Add a readinessProbe so traffic follows application readiness.")
	}
	if !strings.Contains(m, "livenessprobe") {
		findings = append(findings, "Consider a livenessProbe only if the application has a safe self-recovery condition.")
	}
	if strings.Contains(m, ":latest") {
		findings = append(findings, "Avoid mutable :latest image tags; pin an immutable version or digest.")
	}
	if !strings.Contains(m, "securitycontext") {
		findings = append(findings, "Review pod/container securityContext: non-root execution, privilege, capabilities and filesystem policy.")
	}
	if len(findings) == 0 {
		findings = append(findings, "No obvious seed-rule issues found. Production review should also validate RBAC, network policy, PDBs, topology, autoscaling, rollout strategy and workload-specific SLOs.")
	}
	return textResult("RapidReach manifest review:\n- " + strings.Join(findings, "\n- "))
}

func assessSkillGap(_ context.Context, _ *mcp.CallToolRequest, in struct {
	Role   string         `json:"role"`
	Skills map[string]int `json:"skills" jsonschema:"skill names mapped to confidence scores from 0 to 100"`
}) (*mcp.CallToolResult, any, error) {
	target := map[string]int{"linux": 80, "networking": 80, "kubernetes": 85, "observability": 80, "security": 70}
	type gap struct {
		name  string
		delta int
	}
	gaps := []gap{}
	for name, wanted := range target {
		current := in.Skills[name]
		if current < wanted {
			gaps = append(gaps, gap{name, wanted - current})
		}
	}
	sort.Slice(gaps, func(i, j int) bool { return gaps[i].delta > gaps[j].delta })
	var b strings.Builder
	fmt.Fprintf(&b, "Skill gaps for %s:\n", in.Role)
	for _, item := range gaps {
		fmt.Fprintf(&b, "- %s: %d-point gap\n", item.name, item.delta)
	}
	return textResult(b.String())
}

func reviewArchitecture(_ context.Context, _ *mcp.CallToolRequest, in struct {
	Description string `json:"description" jsonschema:"architecture description, components, constraints and traffic flow"`
}) (*mcp.CallToolResult, any, error) {
	if strings.TrimSpace(in.Description) == "" {
		return textResult("description is required")
	}
	return textResult("RapidReach architecture review frame:\n- Identify single points of failure and hidden shared dependencies.\n- Verify timeout, retry and backpressure behavior across every network hop.\n- Check state ownership, consistency requirements and recovery objectives.\n- Separate control-plane failure from data-plane availability.\n- Validate observability, security boundaries, upgrade paths and cost failure modes.\n- Define which failures must degrade gracefully instead of cascading.")
}

func compareTechnologies(_ context.Context, _ *mcp.CallToolRequest, in struct {
	Options      []string `json:"options"`
	Requirements []string `json:"requirements"`
}) (*mcp.CallToolResult, any, error) {
	if len(in.Options) < 2 {
		return textResult("Provide at least two technology options.")
	}
	return textResult(fmt.Sprintf("Compare %s against requirements [%s]. Score architecture fit, operational complexity, failure modes, ecosystem maturity, lock-in, security, observability and migration cost. RapidReach should prefer requirement-fit over popularity or vendor claims.", strings.Join(in.Options, " vs "), strings.Join(in.Requirements, ", ")))
}

func generateRunbook(_ context.Context, _ *mcp.CallToolRequest, in struct {
	Incident string `json:"incident" jsonschema:"incident type or failure mode"`
}) (*mcp.CallToolResult, any, error) {
	if strings.TrimSpace(in.Incident) == "" {
		return textResult("incident is required")
	}
	return textResult(fmt.Sprintf("Runbook: %s\n1. Confirm user impact and blast radius.\n2. Freeze risky changes and preserve evidence.\n3. Check golden signals plus recent deploy/config events.\n4. Form and test the safest falsifiable hypothesis.\n5. Apply reversible mitigation before permanent repair.\n6. Verify recovery against SLO/user signals.\n7. Record root cause, contributing conditions, detection gaps and follow-up owners.", in.Incident))
}

func addResources(server *mcp.Server) {
	for _, entry := range knowledge {
		entry := entry
		uri := "rapidreach://knowledge/" + entry.ID
		server.AddResource(&mcp.Resource{URI: uri, Name: entry.Title, Description: entry.Summary, MIMEType: "text/plain"}, func(_ context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
			text := fmt.Sprintf("%s\nDomain: %s\n%s\nTags: %s", entry.Title, entry.Domain, entry.Summary, strings.Join(entry.Tags, ", "))
			return &mcp.ReadResourceResult{Contents: []*mcp.ResourceContents{{URI: req.Params.URI, MIMEType: "text/plain", Text: text}}}, nil
		})
	}
}

func newServer() *mcp.Server {
	server := mcp.NewServer(&mcp.Implementation{Name: "rapidreach", Version: "0.2.0", Title: "RapidReach Engineering Intelligence"}, nil)
	mcp.AddTool(server, &mcp.Tool{Name: "search_engineering_knowledge", Description: "Search RapidReach engineering concepts and failure-mode knowledge."}, searchKnowledge)
	mcp.AddTool(server, &mcp.Tool{Name: "explain_system", Description: "Explain a system using control-plane, data-plane, dependency and failure-mode reasoning."}, explainSystem)
	mcp.AddTool(server, &mcp.Tool{Name: "diagnose_incident", Description: "Suggest an evidence-driven incident investigation path from observed symptoms."}, diagnoseIncident)
	mcp.AddTool(server, &mcp.Tool{Name: "recommend_learning", Description: "Build a dependency-aware engineering learning path for a target role."}, recommendLearning)
	mcp.AddTool(server, &mcp.Tool{Name: "explain_release_impact", Description: "Translate a technology release/advisory into stack-aware engineering impact."}, explainReleaseImpact)
	mcp.AddTool(server, &mcp.Tool{Name: "review_kubernetes_manifest", Description: "Review Kubernetes YAML for common production-readiness and safety gaps."}, reviewManifest)
	mcp.AddTool(server, &mcp.Tool{Name: "assess_skill_gap", Description: "Compare engineering skill scores with role-oriented target competencies."}, assessSkillGap)
	mcp.AddTool(server, &mcp.Tool{Name: "review_architecture", Description: "Review an architecture description for reliability and operational risks."}, reviewArchitecture)
	mcp.AddTool(server, &mcp.Tool{Name: "compare_technologies", Description: "Compare technologies against explicit architecture and operational requirements."}, compareTechnologies)
	mcp.AddTool(server, &mcp.Tool{Name: "generate_runbook", Description: "Generate a safe incident-response runbook skeleton."}, generateRunbook)
	addResources(server)
	return server
}

func authenticateRemoteRequest(r *http.Request) (*AuthResult, error) {
	platformURL := strings.TrimRight(strings.TrimSpace(os.Getenv("RAPIDREACH_PLATFORM_URL")), "/")
	if platformURL == "" {
		if os.Getenv("RAPIDREACH_MCP_ALLOW_UNAUTHENTICATED") == "true" {
			return &AuthResult{Active: true, OrganizationID: "local", Scopes: []string{"mcp:read", "mcp:tools"}, Plan: "local"}, nil
		}
		return nil, fmt.Errorf("RAPIDREACH_PLATFORM_URL is required for remote MCP authentication")
	}
	authorization := r.Header.Get("Authorization")
	if !strings.HasPrefix(authorization, "Bearer rr_live_") {
		return nil, fmt.Errorf("missing or invalid RapidReach API key")
	}
	req, err := http.NewRequestWithContext(r.Context(), http.MethodPost, platformURL+"/api/mcp/auth", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", authorization)
	req.Header.Set("User-Agent", "RapidReach-MCP/0.2.0")
	client := &http.Client{Timeout: 8 * time.Second}
	response, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("platform auth unavailable: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("platform auth rejected request with status %d", response.StatusCode)
	}
	var result AuthResult
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("invalid platform auth response: %w", err)
	}
	if !result.Active {
		return nil, fmt.Errorf("API key is not active")
	}
	return &result, nil
}

func authenticated(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, err := authenticateRemoteRequest(r); err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		handler.ServeHTTP(w, r)
	})
}

func main() {
	httpAddr := flag.String("http", "", "listen address for stateless Streamable HTTP, e.g. :8080; omit for stdio")
	flag.Parse()
	server := newServer()
	if *httpAddr == "" {
		if err := server.Run(context.Background(), &mcp.StdioTransport{}); err != nil {
			log.Fatal(err)
		}
		return
	}
	handler := mcp.NewStreamableHTTPHandler(func(*http.Request) *mcp.Server { return server }, &mcp.StreamableHTTPOptions{Stateless: true})
	mux := http.NewServeMux()
	mux.Handle("/mcp", authenticated(handler))
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte("ok")) })
	log.Printf("RapidReach MCP listening on %s", *httpAddr)
	if err := http.ListenAndServe(*httpAddr, mux); err != nil {
		log.Fatal(err)
	}
}

func init() {
	log.SetOutput(os.Stderr)
}
