import type { Post, UserProfile } from '@/lib/types/database'

const SYSTEM_AUTHOR: UserProfile = {
  id: 'rapidreach-editorial',
  email: 'editorial@rapidreach.local',
  full_name: 'RapidReach Engineering',
  username: 'rapidreach-engineering',
  role: 'editor',
  bio: 'Production-focused engineering notes from the RapidReach knowledge graph.',
  is_active: true,
  is_verified: true,
  email_notifications: false,
  comment_notifications: false,
  newsletter_subscribed: false,
  posts_written: 48,
  comments_posted: 0,
  total_views_received: 0,
  total_likes_received: 0,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-09-01T00:00:00.000Z',
}

type ArticleSeed = {
  slug: string
  title: string
  excerpt: string
  category: string
  categories?: string[]
  tags: string[]
  difficulty: Post['difficulty']
  readTime: number
  principles: string[]
  practice: string
  featured?: boolean
  trending?: boolean
}

const ARTICLE_SEEDS: ArticleSeed[] = [
  {
    slug: 'linux-processes-signals-and-systemd',
    title: 'Linux Processes, Signals, and systemd for Production Engineers',
    excerpt: 'A practical mental model for processes, PIDs, signals, services, and the failure modes you actually debug on servers.',
    category: 'Linux', categories: ['Linux', 'SRE'], tags: ['linux', 'systemd', 'processes', 'signals'], difficulty: 'beginner', readTime: 10,
    principles: ['A process is an executing program with its own PID, memory space, file descriptors, credentials, and environment.', 'Signals are asynchronous control messages; SIGTERM enables graceful shutdown while SIGKILL does not.', 'systemd supervises long-running services and captures restart policy, dependencies, environment, and logs.', 'When a service fails, inspect exit status, recent journal entries, resource pressure, permissions, and dependency readiness before restarting blindly.'],
    practice: 'Create a small long-running process, stop it with SIGTERM, compare the result with SIGKILL, then inspect it through systemctl and journalctl.'
  },
  {
    slug: 'networking-foundations-for-cloud-native-engineers',
    title: 'Networking Foundations for Cloud-Native Engineers',
    excerpt: 'Understand packets, IPs, routes, ports, DNS, NAT, and load balancers without memorizing isolated commands.',
    category: 'Networking', categories: ['Networking', 'Cloud Native'], tags: ['networking', 'dns', 'tcp', 'routing'], difficulty: 'beginner', readTime: 12,
    principles: ['IP answers where a host is; ports identify the destination process or service on that host.', 'Routing decides the next hop; DNS only maps names to addresses and does not guarantee reachability.', 'TCP adds ordered reliable delivery and connection state; UDP trades those guarantees for lower protocol overhead.', 'Debug from the client outward: name resolution, route, transport connection, TLS, HTTP, then application behavior.'],
    practice: 'Trace a request to a public HTTPS endpoint using dig, ip route, curl -v, and ss. Write down what each layer proves.'
  },
  {
    slug: 'docker-images-containers-layers',
    title: 'Docker Images, Containers, and Layers Explained Properly',
    excerpt: 'Build a durable container mental model: immutable image layers, writable container state, registries, and runtime isolation.',
    category: 'Docker', categories: ['Docker', 'Containers'], tags: ['docker', 'containers', 'images', 'oci'], difficulty: 'beginner', readTime: 9,
    principles: ['An image is an immutable filesystem plus metadata; a container adds a writable runtime layer.', 'Layer ordering affects cache reuse and therefore build speed and registry transfer size.', 'Container isolation comes primarily from Linux namespaces and cgroups, not from a miniature virtual machine.', 'Production images should be minimal, reproducible, non-root, and should not contain secrets or build-only tooling.'],
    practice: 'Write a multi-stage Dockerfile for a small app, compare image sizes before and after, then inspect its layers and effective user.'
  },
  {
    slug: 'container-runtime-containerd-cri-oci',
    title: 'containerd, CRI, and OCI: What Actually Runs a Kubernetes Container?',
    excerpt: 'Follow a container from Kubernetes API intent to kubelet, CRI, containerd, runc, namespaces, and cgroups.',
    category: 'Kubernetes', categories: ['Kubernetes', 'Containers'], tags: ['containerd', 'cri', 'oci', 'kubernetes'], difficulty: 'intermediate', readTime: 11,
    principles: ['Kubernetes does not require Docker Engine; kubelet talks to a CRI-compatible runtime.', 'containerd manages images, snapshots, lifecycle, and delegates low-level process creation to an OCI runtime such as runc.', 'OCI defines portable image and runtime specifications, which lets tooling interoperate without sharing one implementation.', 'Runtime debugging starts by separating Kubernetes desired state from node-level container runtime state.'],
    practice: 'On a test node, compare kubectl, crictl, and ctr views of the same workload and identify which layer each command interrogates.'
  },
  {
    slug: 'kubernetes-pods-deployments-replicasets',
    title: 'Kubernetes Pods, Deployments, and ReplicaSets as a Control Loop',
    excerpt: 'Stop treating Kubernetes objects as YAML files and start seeing them as desired state reconciled by controllers.',
    category: 'Kubernetes', categories: ['Kubernetes', 'Cloud Native'], tags: ['kubernetes', 'pods', 'deployments', 'controllers'], difficulty: 'beginner', readTime: 10,
    principles: ['A Pod is the smallest schedulable unit and usually contains one application container plus tightly coupled helpers.', 'A Deployment manages rollout intent while ReplicaSets maintain the requested replica count.', 'Controllers repeatedly compare desired and observed state; reconciliation is the core Kubernetes behavior.', 'Deleting a managed Pod is not a fix because the controller will recreate it from higher-level desired state.'],
    practice: 'Deploy three replicas, delete one Pod, scale the Deployment, and watch ReplicaSet ownership and reconciliation events.'
  },
  {
    slug: 'kubernetes-scheduling-taints-affinity-topology',
    title: 'Kubernetes Scheduling: Requests, Taints, Affinity, and Topology',
    excerpt: 'Understand why a Pod is Pending and how the scheduler combines resource feasibility with placement policy.',
    category: 'Kubernetes', categories: ['Kubernetes', 'Scheduling'], tags: ['scheduler', 'taints', 'affinity', 'topology'], difficulty: 'intermediate', readTime: 13,
    principles: ['Resource requests participate in scheduling; limits primarily constrain runtime consumption.', 'Taints repel Pods unless a matching toleration exists, while affinity and anti-affinity express placement preferences or requirements.', 'Topology spread constraints distribute replicas across failure domains such as zones and nodes.', 'A Pending Pod should be investigated through scheduler events before changing random resource values.'],
    practice: 'Create a workload that cannot schedule because of a taint, then fix it with a toleration and add topology spreading across nodes.'
  },
  {
    slug: 'kubernetes-services-dns-ingress-gateway-api',
    title: 'Kubernetes Services, DNS, Ingress, and Gateway API',
    excerpt: 'Trace north-south and east-west traffic through service discovery, virtual IPs, proxies, and modern gateway resources.',
    category: 'Kubernetes', categories: ['Kubernetes', 'Networking'], tags: ['services', 'dns', 'ingress', 'gateway-api'], difficulty: 'intermediate', readTime: 14,
    principles: ['Services provide stable discovery and load-balancing semantics over changing Pod endpoints.', 'CoreDNS resolves service names, but data-plane forwarding is handled separately by kube-proxy or an eBPF-based implementation.', 'Ingress defines HTTP routing through an ingress controller; Gateway API provides a richer role-oriented routing model.', 'Debug traffic by proving endpoint readiness, service selection, DNS, data-plane forwarding, then gateway policy.'],
    practice: 'Expose one app internally with a ClusterIP Service and externally through Gateway API or Ingress, then trace a request end to end.'
  },
  {
    slug: 'kubernetes-configmaps-secrets-configuration',
    title: 'Kubernetes Configuration: ConfigMaps, Secrets, and Safer Delivery Patterns',
    excerpt: 'Separate application configuration from images while understanding the security limits of native Kubernetes Secrets.',
    category: 'Kubernetes', categories: ['Kubernetes', 'Security'], tags: ['configmaps', 'secrets', 'configuration', 'security'], difficulty: 'beginner', readTime: 9,
    principles: ['ConfigMaps and Secrets decouple runtime configuration from immutable container images.', 'Base64 encoding is not encryption; secret protection depends on access control, encryption at rest, and delivery discipline.', 'Environment variables are convenient but can increase secret exposure in process metadata and debugging workflows.', 'External secret managers are useful when rotation, centralized policy, or cross-platform secret lifecycle is required.'],
    practice: 'Mount a ConfigMap as files and a Secret through a test secret provider. Compare rotation behavior and what appears in Pod specifications.'
  },
  {
    slug: 'kubernetes-storage-pv-pvc-csi',
    title: 'Kubernetes Storage: PVs, PVCs, StorageClasses, and CSI',
    excerpt: 'Build a practical model for persistent storage lifecycle, dynamic provisioning, access modes, and failure recovery.',
    category: 'Kubernetes', categories: ['Kubernetes', 'Storage'], tags: ['pvc', 'pv', 'csi', 'storage'], difficulty: 'intermediate', readTime: 12,
    principles: ['PVCs express application storage claims; PVs represent provisioned storage resources.', 'StorageClasses define provisioning behavior and often map to a cloud or data-center storage capability.', 'CSI standardizes storage plugins without baking every vendor implementation into Kubernetes.', 'Stateful recovery depends on reclaim policy, zone topology, attachment rules, backups, and the application consistency model.'],
    practice: 'Provision a PVC dynamically, restart the consuming Pod, inspect the bound PV, then document what would happen if the namespace were deleted.'
  },
  {
    slug: 'kubernetes-probes-resources-production-readiness',
    title: 'Production-Ready Kubernetes Workloads: Probes, Resources, and Disruption',
    excerpt: 'The practical controls that distinguish a demo Deployment from a workload that survives real production conditions.',
    category: 'Kubernetes', categories: ['Kubernetes', 'SRE'], tags: ['probes', 'resources', 'pdb', 'reliability'], difficulty: 'intermediate', readTime: 12,
    principles: ['Readiness controls whether a Pod receives traffic; liveness decides when Kubernetes should restart it.', 'Resource requests make scheduling predictable while limits bound noisy-neighbor impact, with tradeoffs for CPU throttling and OOM behavior.', 'PodDisruptionBudgets protect availability during voluntary disruptions but do not replace replica or topology design.', 'Graceful termination requires application signal handling, sufficient termination grace, and traffic draining.'],
    practice: 'Take a basic Deployment and add startup/readiness/liveness probes, requests, limits, a PDB, topology spread, and graceful termination.'
  },
  {
    slug: 'helm-vs-kustomize',
    title: 'Helm vs Kustomize: Choosing a Kubernetes Configuration Strategy',
    excerpt: 'Understand templating, overlays, package lifecycle, drift, and where each tool becomes difficult at scale.',
    category: 'Kubernetes', categories: ['Kubernetes', 'GitOps'], tags: ['helm', 'kustomize', 'configuration'], difficulty: 'intermediate', readTime: 10,
    principles: ['Helm is a packaging and templating system; Kustomize transforms native YAML through overlays.', 'Template flexibility can create hidden complexity when charts become mini programming languages.', 'Overlays work well when environments mostly share a base and differ through controlled patches.', 'The right choice depends on ownership, reuse boundaries, upgrade lifecycle, and how easily reviewers can understand rendered output.'],
    practice: 'Model the same dev/staging/prod Deployment with Helm and Kustomize, render both, and compare reviewability of the final manifests.'
  },
  {
    slug: 'terraform-state-plan-apply',
    title: 'Terraform State, Plan, and Apply: The Mental Model That Prevents Incidents',
    excerpt: 'Understand desired configuration, provider refresh, state, plans, and why state is critical infrastructure data.',
    category: 'Terraform', categories: ['Terraform', 'Infrastructure as Code'], tags: ['terraform', 'state', 'iac', 'providers'], difficulty: 'beginner', readTime: 12,
    principles: ['Terraform compares configuration, provider-observed reality, and state to calculate changes.', 'State is a mapping between Terraform resource addresses and real infrastructure objects, not merely a cache.', 'Remote state locking and encryption reduce concurrency and confidentiality risks.', 'A plan is a proposed transition, not a guarantee that nothing changes between planning and applying.'],
    practice: 'Create a small remote-state project, inspect state addresses, import one existing resource, and intentionally produce drift to observe the next plan.'
  },
  {
    slug: 'terraform-modules-production-design',
    title: 'Designing Terraform Modules That Teams Can Actually Reuse',
    excerpt: 'Treat modules as stable platform APIs with ownership, sensible defaults, validation, versioning, and escape hatches.',
    category: 'Terraform', categories: ['Terraform', 'Platform Engineering'], tags: ['terraform', 'modules', 'iac', 'platform-engineering'], difficulty: 'intermediate', readTime: 13,
    principles: ['A reusable module is an API boundary and should hide irrelevant provider complexity without hiding important operational decisions.', 'Inputs should represent user intent rather than expose every provider argument one-for-one.', 'Version modules and document breaking changes because infrastructure consumers need controlled upgrades.', 'Outputs should enable composition while avoiding unnecessary coupling to implementation details.'],
    practice: 'Refactor repeated infrastructure into a module with validation, defaults, outputs, examples, and a versioned upgrade note.'
  },
  {
    slug: 'terraform-drift-import-moved-blocks',
    title: 'Terraform Drift, Import, and Refactoring Without Destroying Infrastructure',
    excerpt: 'Handle brownfield infrastructure and code refactors without accidental replacement or ownership confusion.',
    category: 'Terraform', categories: ['Terraform', 'Infrastructure as Code'], tags: ['drift', 'import', 'moved-blocks', 'terraform'], difficulty: 'advanced', readTime: 14,
    principles: ['Drift exists when real infrastructure changes outside the configuration-to-apply workflow.', 'Import assigns existing objects to Terraform addresses but does not automatically create ideal configuration.', 'Moved blocks preserve resource identity through address refactors and reduce destructive recreation risk.', 'Brownfield adoption should proceed in small, reviewable ownership slices with backups and explicit blast-radius control.'],
    practice: 'Import a manually created test resource, reconcile its configuration, then refactor its address with a moved block and verify a no-destroy plan.'
  },
  {
    slug: 'github-actions-production-cicd',
    title: 'GitHub Actions for Production CI/CD: Beyond the Basic Workflow',
    excerpt: 'Build pipelines with deterministic dependencies, concurrency control, artifacts, environments, security, and promotion.',
    category: 'CI/CD', categories: ['CI/CD', 'GitHub Actions'], tags: ['github-actions', 'cicd', 'pipelines', 'deployment'], difficulty: 'intermediate', readTime: 13,
    principles: ['CI should produce immutable evidence and artifacts; CD should promote known artifacts rather than rebuild them per environment.', 'Concurrency groups prevent overlapping deployments to the same target.', 'Pin third-party actions and constrain token permissions because CI is part of the software supply chain.', 'Environment protection and approval should correspond to real risk boundaries rather than adding ceremony everywhere.'],
    practice: 'Build a workflow that tests once, produces a versioned artifact, scans it, and promotes the exact artifact through staging to production.'
  },
  {
    slug: 'deployment-strategies-rolling-blue-green-canary',
    title: 'Rolling, Blue-Green, and Canary Deployments: Failure-Domain Thinking',
    excerpt: 'Choose rollout strategies based on blast radius, observability, rollback semantics, capacity, and state compatibility.',
    category: 'CI/CD', categories: ['CI/CD', 'SRE'], tags: ['canary', 'blue-green', 'rollouts', 'reliability'], difficulty: 'intermediate', readTime: 11,
    principles: ['Rolling updates optimize infrastructure efficiency but expose old and new versions simultaneously.', 'Blue-green creates a clean traffic switch at the cost of duplicate capacity and database compatibility concerns.', 'Canaries reduce blast radius only when metrics, abort criteria, and traffic segmentation are trustworthy.', 'Rollback is not always safe when schemas, queues, or irreversible side effects changed.'],
    practice: 'Define success metrics and rollback criteria for the same service under rolling, blue-green, and canary strategies, then compare operational tradeoffs.'
  },
  {
    slug: 'gitops-reconciliation-argocd',
    title: 'GitOps Reconciliation with Argo CD',
    excerpt: 'Understand desired state, reconciliation, drift correction, promotion, and the operational boundaries of GitOps.',
    category: 'GitOps', categories: ['GitOps', 'Argo CD', 'Kubernetes'], tags: ['gitops', 'argocd', 'reconciliation'], difficulty: 'intermediate', readTime: 12,
    principles: ['GitOps makes a versioned repository the declarative source of desired deployment state.', 'A controller continuously reconciles cluster state toward Git state rather than relying on imperative deployment scripts.', 'Automated sync is powerful only when change review, health checks, secrets, and rollback semantics are well designed.', 'Not every operational action belongs in Git; ephemeral incident actions and secret material need separate controls.'],
    practice: 'Deploy an app through Argo CD, mutate it manually in the cluster, observe drift, then test self-healing and a Git-based rollback.'
  },
  {
    slug: 'flux-vs-argocd-gitops',
    title: 'Flux vs Argo CD: Choosing a GitOps Control Plane',
    excerpt: 'Compare reconciliation models, UX, multi-tenancy, extensibility, promotion patterns, and operational ownership.',
    category: 'GitOps', categories: ['GitOps', 'Kubernetes'], tags: ['flux', 'argocd', 'gitops'], difficulty: 'intermediate', readTime: 10,
    principles: ['Both projects implement controller-driven reconciliation, so the decision is more about workflow and operating model than the GitOps definition itself.', 'Argo CD emphasizes an application-centric API and rich UI, while Flux composes Kubernetes-native controllers and toolkit APIs.', 'Multi-tenancy design should consider repository access, cluster credentials, namespace boundaries, and controller permissions.', 'Choose based on your platform workflow and team ownership model, not feature-count comparisons alone.'],
    practice: 'Model one multi-environment deployment workflow in both tools and compare promotion, tenancy, rollback, and day-two debugging.'
  },
  {
    slug: 'platform-engineering-internal-developer-platforms',
    title: 'Platform Engineering and Internal Developer Platforms Without the Hype',
    excerpt: 'A concrete model for platform capabilities, paved roads, self-service, product thinking, and reducing cognitive load.',
    category: 'Platform Engineering', categories: ['Platform Engineering', 'Developer Experience'], tags: ['platform-engineering', 'idp', 'developer-experience'], difficulty: 'beginner', readTime: 13,
    principles: ['A platform is a product that provides reusable capabilities to internal engineering customers.', 'The goal is not to hide infrastructure completely; it is to reduce unnecessary cognitive load while preserving useful control.', 'Golden paths should make the safe common case easy without becoming a rigid one-size-fits-all framework.', 'Platform success should be measured through adoption, lead time, reliability, support burden, and developer outcomes.'],
    practice: 'Interview three application teams, identify their repeated delivery friction, and define one self-service capability with a measurable adoption target.'
  },
  {
    slug: 'backstage-software-catalog',
    title: 'Backstage Software Catalog: Modeling Ownership, Systems, and Components',
    excerpt: 'Use a developer portal as an ownership and discovery layer instead of turning it into another static service directory.',
    category: 'Platform Engineering', categories: ['Platform Engineering', 'Backstage'], tags: ['backstage', 'catalog', 'ownership', 'idp'], difficulty: 'intermediate', readTime: 12,
    principles: ['A catalog is most valuable when entities map to real ownership, lifecycle, dependencies, documentation, and operational links.', 'Metadata should be automated from systems of record where possible instead of maintained manually forever.', 'Entity relationships let teams reason about systems rather than isolated repositories.', 'A portal should aggregate workflows and context; it should not duplicate every underlying tool.'],
    practice: 'Model one business system with components, APIs, resources, owners, and documentation, then identify which metadata can be synchronized automatically.'
  },
  {
    slug: 'golden-paths-self-service-apis',
    title: 'Golden Paths and Self-Service APIs That Developers Will Use',
    excerpt: 'Turn platform standards into opinionated workflows while preserving escape hatches, observability, and ownership.',
    category: 'Platform Engineering', categories: ['Platform Engineering', 'Developer Experience'], tags: ['golden-paths', 'self-service', 'platform-api'], difficulty: 'advanced', readTime: 12,
    principles: ['A golden path encodes the organization’s recommended way to solve a common problem.', 'Self-service should create real infrastructure or workflows through governed APIs, not just generate boilerplate.', 'Escape hatches are necessary for legitimate edge cases but should preserve security and ownership boundaries.', 'Every abstraction should expose enough observability for users to understand what happened when it fails.'],
    practice: 'Design a create-service workflow that provisions repository, CI, deployment, observability, ownership metadata, and policy with one explicit escape hatch.'
  },
  {
    slug: 'platform-engineering-scorecards',
    title: 'Engineering Scorecards Without Turning Them Into Vanity Metrics',
    excerpt: 'Use service standards and scorecards to drive concrete reliability and security improvements rather than dashboard theater.',
    category: 'Platform Engineering', categories: ['Platform Engineering', 'SRE'], tags: ['scorecards', 'standards', 'developer-experience'], difficulty: 'advanced', readTime: 10,
    principles: ['A scorecard should represent actionable engineering standards that teams can improve.', 'Measurements work best when evidence is automated from source systems instead of self-reported.', 'Scores should be contextual: a customer-facing payment service and an internal batch job have different risk profiles.', 'The platform should offer remediation paths, not merely red indicators.'],
    practice: 'Define five automated standards for one service class and pair every failed check with a concrete self-service remediation.'
  },
  {
    slug: 'prometheus-metrics-data-model',
    title: 'Prometheus Metrics: Data Model, Cardinality, and PromQL Thinking',
    excerpt: 'Use labels intentionally, avoid cardinality explosions, and reason about counters, gauges, histograms, and rates.',
    category: 'Observability', categories: ['Observability', 'Prometheus'], tags: ['prometheus', 'metrics', 'promql', 'cardinality'], difficulty: 'intermediate', readTime: 14,
    principles: ['Prometheus stores time series identified by a metric name plus label set.', 'High-cardinality labels such as user IDs or request IDs can make a metrics system expensive and unstable.', 'Counters are interpreted through rates or increases; gauges represent values that can move in either direction.', 'Histograms enable latency distribution analysis and SLO calculations when bucket design matches the use case.'],
    practice: 'Instrument request count and latency for a small service, write rate and percentile queries, then estimate the series count created by your labels.'
  },
  {
    slug: 'logs-metrics-traces-debugging',
    title: 'Logs, Metrics, and Traces: Choosing the Right Signal During an Incident',
    excerpt: 'Use telemetry as complementary evidence instead of collecting everything and hoping dashboards reveal the answer.',
    category: 'Observability', categories: ['Observability', 'SRE'], tags: ['logs', 'metrics', 'traces', 'debugging'], difficulty: 'beginner', readTime: 11,
    principles: ['Metrics are efficient for trends, rates, saturation, and alerting over many instances.', 'Logs preserve discrete events and rich context but become expensive when used as an unbounded metrics database.', 'Traces connect work across distributed service boundaries and expose where latency and errors accumulate.', 'Incident investigation should move between signals according to a hypothesis rather than opening every dashboard at once.'],
    practice: 'Given a synthetic latency spike, start with a service-level metric, identify the affected path with a trace, then use logs only at the narrowed component.'
  },
  {
    slug: 'opentelemetry-collector-pipelines',
    title: 'OpenTelemetry Collector Pipelines in Production',
    excerpt: 'Understand receivers, processors, exporters, batching, sampling, backpressure, and collector deployment topologies.',
    category: 'Observability', categories: ['Observability', 'OpenTelemetry'], tags: ['opentelemetry', 'otel', 'collector', 'tracing'], difficulty: 'intermediate', readTime: 13,
    principles: ['The Collector decouples application instrumentation from telemetry backends.', 'Receivers ingest, processors transform or control data, and exporters send it onward.', 'Batching and memory controls protect applications and backends during bursts, but dropped telemetry must be observable.', 'Agent, gateway, and hybrid topologies trade local context, cost, operational complexity, and failure isolation.'],
    practice: 'Run a Collector with OTLP input, batch and memory processors, and two exporters. Induce backend failure and observe queue/backpressure behavior.'
  },
  {
    slug: 'slo-sli-error-budgets',
    title: 'SLIs, SLOs, and Error Budgets for Engineers Who Operate Systems',
    excerpt: 'Turn reliability from a vague goal into measurable user-facing objectives that guide engineering tradeoffs.',
    category: 'SRE', categories: ['SRE', 'Observability'], tags: ['slo', 'sli', 'error-budget', 'reliability'], difficulty: 'intermediate', readTime: 12,
    principles: ['An SLI measures a user-relevant dimension such as successful request ratio or latency.', 'An SLO sets a target over a defined window; 100% is usually an expensive and misleading target.', 'The error budget is the allowed unreliability implied by the SLO.', 'Burn-rate alerting detects when the budget is being consumed too quickly while avoiding noisy alerts for harmless fluctuations.'],
    practice: 'Define availability and latency SLIs for one service, pick an SLO, calculate its monthly error budget, and design fast/slow burn alerts.'
  },
  {
    slug: 'incident-response-hypothesis-driven-debugging',
    title: 'Incident Response with Hypothesis-Driven Debugging',
    excerpt: 'Investigate production failures through evidence, bounded experiments, safe remediation, and explicit verification.',
    category: 'SRE', categories: ['SRE', 'Incident Response'], tags: ['incidents', 'debugging', 'reliability', 'operations'], difficulty: 'intermediate', readTime: 13,
    principles: ['Start with user impact and a timeline before diving into a favorite subsystem.', 'A useful hypothesis predicts observable evidence; gather the smallest evidence that can falsify it.', 'During an incident, prefer reversible actions with bounded blast radius.', 'Recovery is not complete until user-facing behavior is verified and temporary mitigations are documented.'],
    practice: 'Take a past outage and reconstruct the investigation as hypotheses, evidence, decisions, mitigations, and verification steps.'
  },
  {
    slug: 'capacity-planning-queues-backpressure',
    title: 'Capacity Planning, Queues, and Backpressure',
    excerpt: 'Reason about saturation, burst absorption, queue growth, autoscaling limits, and why retries can amplify outages.',
    category: 'SRE', categories: ['SRE', 'Distributed Systems'], tags: ['capacity', 'queues', 'backpressure', 'autoscaling'], difficulty: 'advanced', readTime: 14,
    principles: ['Capacity is about sustainable service rate under realistic workload, not peak CPU alone.', 'Queues absorb short bursts but hide overload if arrival rate remains above processing rate.', 'Backpressure propagates overload signals upstream instead of allowing unbounded work accumulation.', 'Retries require budgets, jitter, and limits because synchronized retry storms can make partial failures worse.'],
    practice: 'Model a worker queue under rising arrival rate, add bounded retries and backpressure, then identify the threshold where the queue stops recovering.'
  },
  {
    slug: 'cilium-ebpf-kubernetes-networking',
    title: 'Cilium and eBPF for Kubernetes Networking',
    excerpt: 'Understand how eBPF changes packet processing, policy, visibility, and service load balancing in Kubernetes.',
    category: 'Networking', categories: ['Networking', 'Kubernetes', 'Cilium'], tags: ['cilium', 'ebpf', 'network-policy', 'kubernetes'], difficulty: 'advanced', readTime: 14,
    principles: ['eBPF allows verified programs to run at controlled kernel hook points without adding traditional kernel modules.', 'Cilium uses eBPF for networking, policy enforcement, service load balancing, and observability.', 'Identity-aware policy can express workload relationships without relying only on changing IP addresses.', 'Hubble adds network-flow visibility that helps connect policy intent with actual traffic behavior.'],
    practice: 'Install Cilium in a lab cluster, apply a default-deny policy, allow one service path, and inspect accepted and denied flows through Hubble.'
  },
  {
    slug: 'kubernetes-network-policies-zero-trust',
    title: 'Kubernetes Network Policies and Practical Zero Trust',
    excerpt: 'Move from flat cluster networking to explicit allowed communication while avoiding accidental outages.',
    category: 'Security', categories: ['Security', 'Kubernetes', 'Networking'], tags: ['network-policy', 'zero-trust', 'kubernetes-security'], difficulty: 'intermediate', readTime: 12,
    principles: ['A zero-trust network posture starts by denying implicit trust and allowing required communication explicitly.', 'NetworkPolicy behavior depends on the CNI implementation actually enforcing it.', 'DNS, telemetry, health checks, and control-plane dependencies are common omissions during policy rollout.', 'Policy adoption should be observed and staged, not switched globally without traffic evidence.'],
    practice: 'Capture expected flows for one namespace, apply default deny, then add the minimum ingress and egress rules needed for healthy operation.'
  },
  {
    slug: 'kubernetes-rbac-service-accounts',
    title: 'Kubernetes RBAC and Service Accounts: Least Privilege That Works',
    excerpt: 'Design identities and permissions around workload and human responsibilities instead of defaulting to cluster-admin.',
    category: 'Security', categories: ['Security', 'Kubernetes'], tags: ['rbac', 'service-accounts', 'least-privilege'], difficulty: 'intermediate', readTime: 11,
    principles: ['RBAC binds subjects to permissions expressed through Roles or ClusterRoles.', 'Namespaced Roles reduce blast radius when cluster-wide permissions are unnecessary.', 'Workloads should use dedicated ServiceAccounts rather than sharing broad default identities.', 'Permission reviews should inspect effective verbs and resources, not only role names that sound safe.'],
    practice: 'Create a ServiceAccount that can read ConfigMaps in one namespace but cannot read Secrets or resources elsewhere, then verify with auth can-i.'
  },
  {
    slug: 'software-supply-chain-sbom-signing',
    title: 'Software Supply Chain Security: SBOMs, Signing, Provenance, and Policy',
    excerpt: 'Connect build integrity, artifact identity, dependency visibility, and admission policy into one practical control chain.',
    category: 'Security', categories: ['Security', 'CI/CD'], tags: ['sbom', 'signing', 'provenance', 'supply-chain'], difficulty: 'advanced', readTime: 14,
    principles: ['An SBOM inventories components but does not prove that an artifact was built by a trusted process.', 'Signing establishes artifact identity while provenance records how and where the artifact was produced.', 'Policy enforcement is strongest when deployment verifies immutable artifact identity rather than mutable tags.', 'Supply-chain controls should preserve developer velocity by being automated in build and deployment workflows.'],
    practice: 'Generate an SBOM for a container, sign the image, attach provenance, and enforce a test policy that rejects an unsigned image.'
  },
  {
    slug: 'secrets-management-vault-kubernetes',
    title: 'Secrets Management with Vault and Kubernetes',
    excerpt: 'Understand workload identity, dynamic credentials, rotation, delivery mechanisms, and the operational cost of secret systems.',
    category: 'Security', categories: ['Security', 'Vault', 'Kubernetes'], tags: ['vault', 'secrets', 'rotation', 'identity'], difficulty: 'advanced', readTime: 13,
    principles: ['The strongest secret workflow authenticates the workload rather than distributing long-lived bootstrap credentials.', 'Dynamic credentials reduce lifetime and improve revocation but require applications to tolerate rotation.', 'Secret delivery can use files, sidecars, CSI, or direct API access; each changes lifecycle and failure behavior.', 'A secret manager is critical infrastructure and needs availability, backup, audit, and recovery design.'],
    practice: 'Configure a test workload to authenticate using Kubernetes identity and receive a short-lived credential, then rotate it without rebuilding the image.'
  },
  {
    slug: 'aws-vpc-subnets-nat-routing',
    title: 'AWS VPCs, Subnets, Route Tables, NAT, and Internet Gateways',
    excerpt: 'Build a packet-level mental model for common AWS network layouts and the causes of unreachable workloads.',
    category: 'AWS', categories: ['AWS', 'Cloud'], tags: ['aws', 'vpc', 'subnets', 'routing'], difficulty: 'intermediate', readTime: 13,
    principles: ['A subnet is associated with a route table that determines how destination prefixes are forwarded.', 'An Internet Gateway enables internet routing for resources with appropriate public addressing and routes.', 'NAT Gateways provide outbound internet connectivity for private IPv4 resources without accepting unsolicited inbound connections.', 'Security Groups and network ACLs filter traffic separately from routing; a correct route does not imply allowed traffic.'],
    practice: 'Draw and deploy a two-AZ VPC with public and private subnets, then trace outbound traffic from a private instance to the internet.'
  },
  {
    slug: 'aws-eks-production-architecture',
    title: 'Amazon EKS Production Architecture: Nodes, Networking, IAM, and Upgrades',
    excerpt: 'The operational decisions that matter after the cluster creates successfully.',
    category: 'AWS', categories: ['AWS', 'Kubernetes'], tags: ['eks', 'aws', 'kubernetes', 'iam'], difficulty: 'advanced', readTime: 15,
    principles: ['Managed control plane does not eliminate responsibility for node lifecycle, networking, add-ons, workload policy, and observability.', 'IAM roles for service accounts or pod identity reduce the need for node-wide cloud permissions.', 'Cluster and node upgrades need compatibility planning across APIs, add-ons, CNI, ingress, and workload disruption budgets.', 'Multi-AZ design improves resilience only if workloads, storage, and dependencies are also distributed appropriately.'],
    practice: 'Produce an EKS upgrade runbook that covers API deprecations, managed add-ons, node replacement, PDBs, validation, and rollback boundaries.'
  },
  {
    slug: 'cloud-cost-engineering-finops',
    title: 'Cloud Cost Engineering for Platform Teams',
    excerpt: 'Treat cost as an engineering signal using allocation, unit economics, idle-resource detection, and architecture tradeoffs.',
    category: 'Cloud', categories: ['Cloud', 'Platform Engineering'], tags: ['finops', 'cost', 'cloud', 'platform-engineering'], difficulty: 'intermediate', readTime: 11,
    principles: ['Cost allocation needs trustworthy ownership metadata before dashboards can drive behavior.', 'Total monthly spend is less actionable than unit costs such as cost per request, tenant, build, or environment.', 'Idle resources, overprovisioned requests, data transfer, and managed-service minimums are common hidden drivers.', 'Optimization should preserve reliability goals rather than treating the cheapest architecture as automatically best.'],
    practice: 'Choose one service, calculate a simple unit cost, identify its top three cost drivers, and propose optimizations with reliability constraints.'
  },
  {
    slug: 'distributed-systems-timeouts-retries-idempotency',
    title: 'Timeouts, Retries, and Idempotency in Distributed Systems',
    excerpt: 'The reliability primitives behind safe network calls, duplicate handling, and bounded failure propagation.',
    category: 'Distributed Systems', categories: ['Distributed Systems', 'SRE'], tags: ['timeouts', 'retries', 'idempotency', 'reliability'], difficulty: 'advanced', readTime: 14,
    principles: ['Every remote call should have a timeout derived from an end-to-end latency budget.', 'Retries are appropriate for some transient failures but must be bounded, jittered, and aware of operation safety.', 'Idempotency lets repeated requests converge on one logical outcome, which is essential when response loss makes execution ambiguous.', 'Retry behavior across multiple service layers can multiply traffic dramatically during an outage.'],
    practice: 'Design a payment-like API with idempotency keys, bounded retries, deadlines, and a clear response for ambiguous downstream completion.'
  },
  {
    slug: 'distributed-systems-consistency-availability',
    title: 'Consistency, Availability, and Failure in Distributed Systems',
    excerpt: 'Reason about replicas, stale reads, partitions, quorums, and application-level tradeoffs without slogan-level CAP explanations.',
    category: 'Distributed Systems', categories: ['Distributed Systems', 'SRE'], tags: ['consistency', 'availability', 'replication', 'cap'], difficulty: 'advanced', readTime: 15,
    principles: ['Replication improves availability and read scale but creates coordination and freshness tradeoffs.', 'During a network partition, a system must define which operations remain possible and what consistency guarantees they preserve.', 'Quorums are one coordination technique, not a universal answer; topology and failure assumptions matter.', 'Application invariants determine where strong coordination is necessary and where eventual convergence is acceptable.'],
    practice: 'Take an inventory system and classify which operations can tolerate stale data and which require coordination to preserve a business invariant.'
  },
  {
    slug: 'go-concurrency-goroutines-channels-context',
    title: 'Go Concurrency for Infrastructure Engineers: Goroutines, Channels, and Context',
    excerpt: 'Use Go concurrency as structured coordination rather than launching goroutines everywhere.',
    category: 'Go', categories: ['Go', 'Distributed Systems'], tags: ['golang', 'goroutines', 'channels', 'context'], difficulty: 'intermediate', readTime: 13,
    principles: ['Goroutines are lightweight concurrent functions but still consume resources and need lifecycle ownership.', 'Channels are coordination primitives; they are not mandatory for every shared-state problem.', 'context.Context carries cancellation and deadlines across API boundaries and should be honored by blocking work.', 'Production concurrency requires bounded parallelism, error propagation, cancellation, and protection against goroutine leaks.'],
    practice: 'Build a bounded concurrent worker that processes URLs, propagates cancellation through context, and shuts down without leaking goroutines.'
  },
  {
    slug: 'go-http-services-production',
    title: 'Production Go HTTP Services: Timeouts, Shutdown, Middleware, and Observability',
    excerpt: 'Build Go APIs that behave predictably under slow clients, deploys, overload, and partial dependency failure.',
    category: 'Go', categories: ['Go', 'SRE'], tags: ['golang', 'http', 'timeouts', 'observability'], difficulty: 'intermediate', readTime: 14,
    principles: ['Server read, write, idle, and header timeouts protect resources from pathological or slow connections.', 'Outbound HTTP clients also need timeouts and connection-pool configuration.', 'Graceful shutdown stops new work, drains in-flight requests within a deadline, then exits.', 'Request IDs, structured logs, metrics, and traces should be designed into the service boundary rather than bolted on after an incident.'],
    practice: 'Create a Go HTTP service with explicit server/client timeouts, request logging, readiness, Prometheus metrics, and graceful SIGTERM handling.'
  },
  {
    slug: 'kubernetes-operators-reconciliation-go',
    title: 'Kubernetes Operators in Go: Reconciliation, Idempotency, and Status',
    excerpt: 'Build controllers that converge safely instead of embedding imperative scripts inside reconcile loops.',
    category: 'Go', categories: ['Go', 'Kubernetes'], tags: ['operators', 'controllers', 'golang', 'kubernetes'], difficulty: 'advanced', readTime: 15,
    principles: ['A reconcile loop should be idempotent: repeated execution against the same observed state should remain safe.', 'Spec expresses desired state while status reports observed state and conditions.', 'Controllers should rely on level-triggered reconciliation rather than assuming they receive every event exactly once.', 'External API calls need timeouts, retries, ownership semantics, and cleanup/finalizer design.'],
    practice: 'Design a small custom resource that creates a dependent ConfigMap and reports Ready conditions, then reason through deletion and duplicate reconciliation.'
  },
  {
    slug: 'api-design-pagination-idempotency-errors',
    title: 'Practical API Design: Pagination, Idempotency, Errors, and Evolution',
    excerpt: 'Design service interfaces that remain operable as clients, data volumes, and failure modes grow.',
    category: 'Distributed Systems', categories: ['Distributed Systems', 'Go'], tags: ['api-design', 'pagination', 'idempotency', 'versioning'], difficulty: 'intermediate', readTime: 12,
    principles: ['Cursor pagination is often more stable than offsets for changing large datasets.', 'Error responses should provide machine-readable classification without exposing sensitive internals.', 'Idempotency is essential for mutation APIs where clients may retry after timeouts.', 'Backward-compatible additive evolution is usually cheaper than frequent version forks.'],
    practice: 'Design a create-job and list-jobs API with cursor pagination, idempotency keys, structured errors, request IDs, and a compatibility policy.'
  },
  {
    slug: 'mcp-servers-production-engineering',
    title: 'Building MCP Servers for Production Engineering Workflows',
    excerpt: 'Treat MCP as an authenticated interface to domain capabilities, not as a thin wrapper over random internal functions.',
    category: 'AI Infrastructure', categories: ['AI Infrastructure', 'Platform Engineering'], tags: ['mcp', 'agents', 'platform-engineering', 'api'], difficulty: 'advanced', readTime: 13,
    principles: ['MCP tools should expose stable domain actions or queries with clear schemas and bounded behavior.', 'Remote MCP needs authentication, authorization, tenant isolation, rate limits, and auditable tool calls.', 'Read-only advisory tools are a safer starting point than unrestricted infrastructure mutation.', 'The best MCP layer reuses the same domain services as web and API clients instead of implementing a parallel backend.'],
    practice: 'Define an MCP tool for release-impact analysis with input validation, tenant scope, read-only behavior, audit metadata, and a predictable error model.'
  },
  {
    slug: 'ai-agents-infrastructure-safety',
    title: 'AI Agents for Infrastructure: Safety, Evaluation, and Blast Radius',
    excerpt: 'Design agentic operations around evidence, constrained permissions, reversible actions, and measurable outcomes.',
    category: 'AI Infrastructure', categories: ['AI Infrastructure', 'SRE'], tags: ['agents', 'safety', 'evaluation', 'operations'], difficulty: 'advanced', readTime: 14,
    principles: ['Infrastructure agents should begin with evidence gathering and explicit hypotheses before taking action.', 'Permissions should be scoped to the minimum environment, resource, and verbs needed for the task.', 'Safe actions are bounded and reversible, with verification after every state-changing step.', 'Evaluation should score observable action quality, diagnostic correctness, blast radius, reversibility, and final system outcome.'],
    practice: 'Create a sandbox incident and score two agent action traces: one evidence-first and one that immediately restarts or mutates infrastructure.'
  },
  {
    slug: 'rag-for-engineering-knowledge',
    title: 'RAG for Engineering Knowledge: Retrieval Quality Before Bigger Models',
    excerpt: 'Build useful engineering assistants with source quality, chunking, metadata, hybrid retrieval, and evaluation.',
    category: 'AI Infrastructure', categories: ['AI Infrastructure', 'Platform Engineering'], tags: ['rag', 'retrieval', 'embeddings', 'knowledge-graph'], difficulty: 'intermediate', readTime: 13,
    principles: ['Retrieval quality is constrained by source quality and document structure before model capability becomes the bottleneck.', 'Metadata such as technology, version, team, service, and recency improves filtering and ranking.', 'Hybrid lexical and semantic retrieval often handles exact technical terms better than embeddings alone.', 'Evaluate retrieval and answer grounding separately so you know whether failure came from search or generation.'],
    practice: 'Index a small set of runbooks and release notes, compare lexical, vector, and hybrid retrieval on ten engineering questions, and record miss reasons.'
  },
  {
    slug: 'vector-search-pgvector-engineering',
    title: 'pgvector for Engineering Search: Embeddings, HNSW, and Hybrid Retrieval',
    excerpt: 'Use Postgres as a practical semantic-search layer while understanding distance metrics, indexes, filtering, and evaluation.',
    category: 'AI Infrastructure', categories: ['AI Infrastructure', 'Databases'], tags: ['pgvector', 'embeddings', 'hnsw', 'search'], difficulty: 'advanced', readTime: 12,
    principles: ['Embeddings map content into a vector space where distance approximates semantic similarity.', 'Approximate indexes such as HNSW trade memory and exactness for much faster nearest-neighbor retrieval.', 'Metadata filtering should narrow the candidate set by tenant, technology, version, or access policy before semantic ranking.', 'Semantic retrieval should be benchmarked on real queries because intuitive similarity is not the same as task usefulness.'],
    practice: 'Store embeddings for a small technical corpus in pgvector, add an HNSW index, then compare semantic and hybrid results with explicit relevance labels.'
  },
  {
    slug: 'database-connection-pools-production',
    title: 'Database Connection Pools: The Hidden Reliability Boundary',
    excerpt: 'Understand pool sizing, queueing, timeouts, transaction scope, and why adding more connections can make databases slower.',
    category: 'SRE', categories: ['SRE', 'Databases'], tags: ['database', 'connection-pool', 'latency', 'reliability'], difficulty: 'intermediate', readTime: 12,
    principles: ['A connection pool bounds concurrent database sessions and queues callers when capacity is exhausted.', 'Oversized pools can overwhelm the database with context switching, memory usage, and competing work.', 'Long transactions and slow queries hold scarce connections and cause latency far away from the real bottleneck.', 'Pool metrics should include active, idle, wait duration, timeouts, and transaction/query latency.'],
    practice: 'Load-test a service with a deliberately small pool, observe wait time, then tune pool size and query latency while tracking database saturation.'
  },
  {
    slug: 'caching-redis-production-patterns',
    title: 'Redis and Caching Patterns Without Creating a Consistency Nightmare',
    excerpt: 'Use caches for explicit latency or load goals while reasoning about invalidation, stampedes, TTLs, and failure behavior.',
    category: 'Distributed Systems', categories: ['Distributed Systems', 'Databases'], tags: ['redis', 'caching', 'ttl', 'consistency'], difficulty: 'intermediate', readTime: 12,
    principles: ['A cache is a derived copy of data and should have a clear source of truth.', 'Cache-aside is simple but creates stale windows and stampede risk when many requests miss together.', 'TTL is a correctness and load-control parameter, not just a memory cleanup setting.', 'The system must define behavior when Redis is slow or unavailable; a cache should not automatically become a new single point of failure.'],
    practice: 'Implement cache-aside for one read-heavy endpoint with TTL jitter, miss coalescing, metrics, and a graceful fallback when Redis is unavailable.'
  },
  {
    slug: 'message-queues-delivery-semantics',
    title: 'Message Queues: At-Least-Once Delivery, Ordering, and Dead Letters',
    excerpt: 'Design consumers that remain correct when messages are duplicated, delayed, reordered, or poison the processing path.',
    category: 'Distributed Systems', categories: ['Distributed Systems', 'SRE'], tags: ['queues', 'messaging', 'idempotency', 'dlq'], difficulty: 'advanced', readTime: 13,
    principles: ['At-least-once delivery means consumers must expect duplicate processing attempts.', 'Ordering guarantees are usually scoped to a partition, key, or queue configuration rather than the whole system.', 'Dead-letter queues isolate repeatedly failing messages but require ownership and replay procedures.', 'Consumer lag is a workload and capacity signal; autoscaling should consider processing rate and recovery time.'],
    practice: 'Design an idempotent order-processing consumer with retry limits, a dead-letter path, replay tooling, and lag-based scaling.'
  },
  {
    slug: 'oauth-oidc-sso-platforms',
    title: 'OAuth 2.0, OIDC, and SSO for Engineering Platforms',
    excerpt: 'Separate delegated authorization, identity, sessions, scopes, and enterprise tenant access in your mental model.',
    category: 'Security', categories: ['Security', 'Platform Engineering'], tags: ['oauth', 'oidc', 'sso', 'authentication'], difficulty: 'intermediate', readTime: 13,
    principles: ['OAuth is an authorization framework while OpenID Connect adds an identity layer on top.', 'Access tokens are for APIs; ID tokens communicate authentication claims to the client and should not be reused as arbitrary API credentials.', 'Scopes express delegated capabilities but still need server-side authorization against tenant and resource boundaries.', 'Enterprise SSO design must account for domain routing, account linking, session expiry, offboarding, audit, and role mapping.'],
    practice: 'Diagram an enterprise login from browser to IdP to callback to session creation, then mark where tenant membership and API authorization are enforced.'
  },
  {
    slug: 'multi-tenant-saas-rls',
    title: 'Multi-Tenant SaaS Isolation with PostgreSQL Row-Level Security',
    excerpt: 'Use tenant-scoped data models and database-enforced policies as defense in depth for B2B platforms.',
    category: 'Security', categories: ['Security', 'Platform Engineering', 'Databases'], tags: ['multi-tenancy', 'rls', 'postgres', 'saas'], difficulty: 'advanced', readTime: 14,
    principles: ['Tenant ownership should be explicit in the schema rather than inferred through fragile joins wherever possible.', 'Row-Level Security constrains which rows a session may read or mutate even when application queries are imperfect.', 'Service-role credentials bypass many user-facing controls and must be tightly isolated to trusted backend paths.', 'Isolation tests should attempt cross-tenant reads and writes, not merely test the happy path.'],
    practice: 'Create two test organizations and users, add RLS policies to one tenant table, then write tests proving cross-tenant SELECT, UPDATE, and DELETE fail.'
  },
  {
    slug: 'production-readiness-review',
    title: 'A Production Readiness Review That Catches Real Failure Modes',
    excerpt: 'A practical review framework spanning ownership, dependencies, capacity, rollout, observability, security, and recovery.',
    category: 'SRE', categories: ['SRE', 'Platform Engineering'], tags: ['production-readiness', 'reliability', 'review'], difficulty: 'intermediate', readTime: 14,
    principles: ['Production readiness is about understanding how the system fails and how humans will detect and recover it.', 'Dependencies need explicit timeout, retry, capacity, ownership, and degradation behavior.', 'Rollout and rollback must account for schemas, queues, caches, and irreversible side effects.', 'Runbooks and dashboards are useful only when they answer likely incident questions and are tested before the outage.'],
    practice: 'Run a review on one existing service and produce five concrete changes ranked by user impact and failure probability.'
  },
  {
    slug: 'architecture-diagrams-that-help-debugging',
    title: 'Architecture Diagrams That Actually Help During Debugging',
    excerpt: 'Model request flow, ownership, dependencies, data boundaries, and failure domains instead of drawing decorative boxes.',
    category: 'Platform Engineering', categories: ['Platform Engineering', 'SRE'], tags: ['architecture', 'debugging', 'systems-thinking'], difficulty: 'beginner', readTime: 9,
    principles: ['A useful diagram has a question: request flow, deployment topology, data ownership, trust boundary, or failure propagation.', 'Show externally observable interfaces and dependencies instead of every internal class or function.', 'Annotate protocols, data stores, queues, ownership, and important failure domains.', 'Keep diagrams close to the system and update them through engineering workflows rather than annual documentation projects.'],
    practice: 'Redraw one service architecture as a request-flow diagram including external dependencies, data stores, queues, and ownership, then use it to trace one failure scenario.'
  },
]

function buildContent(seed: ArticleSeed): string {
  return `# ${seed.title}

${seed.excerpt}

## Why this matters

Production engineering gets difficult when a concept is learned as an isolated command or configuration fragment. The useful goal is a mental model that explains **what the system is trying to do, what state it keeps, and how it fails**. This article focuses on that operational model rather than a tool-demo checklist.

## Core mental model

${seed.principles.map((principle) => `- ${principle}`).join('\n')}

## How to reason about it in production

Start from observable behavior and move toward the component that owns the decision. Separate desired state from observed state, configuration from runtime state, and symptoms from causes. Prefer evidence that can disprove a hypothesis quickly. When a change is required, use the smallest reversible action that can test the hypothesis without expanding blast radius.

A useful debugging sequence is:

1. Define the user-visible failure or engineering objective precisely.
2. Identify the component that owns the relevant decision or state.
3. Inspect the narrowest high-signal evidence available: events, status, metrics, traces, logs, or provider state.
4. Form a hypothesis that predicts what you should observe next.
5. Test it with a bounded read or reversible action.
6. Verify recovery from the user's point of view, not only from an internal dashboard.

## Production checklist

- Make ownership and dependencies explicit.
- Add timeouts, limits, and bounded retry behavior where remote work is involved.
- Expose health and failure state through useful telemetry.
- Prefer immutable, reviewable configuration over one-off manual changes.
- Document the safe rollback or recovery boundary.
- Test the failure mode in a non-production environment before relying on the runbook.

## Practice exercise

${seed.practice}

## What good looks like

You should be able to explain the system without referring to a memorized command, predict at least three likely failure modes, identify the evidence that distinguishes them, and describe a safe recovery path. That level of understanding transfers across vendors and is the standard RapidReach learning paths are designed around.
`
}

export const BUILT_IN_POSTS: Post[] = ARTICLE_SEEDS.map((seed, index) => {
  const created = new Date(Date.UTC(2026, 8, 1) - index * 86400000).toISOString()
  const content = buildContent(seed)
  const words = content.trim().split(/\s+/).length
  return {
    id: `rr-${seed.slug}`,
    title: seed.title,
    slug: seed.slug,
    excerpt: seed.excerpt,
    content,
    author_id: SYSTEM_AUTHOR.id,
    author: SYSTEM_AUTHOR,
    category: seed.category,
    categories: seed.categories?.length ? seed.categories : [seed.category],
    tags: seed.tags,
    difficulty: seed.difficulty,
    status: 'published',
    featured: Boolean(seed.featured ?? index < 4),
    trending: Boolean(seed.trending ?? index % 9 === 0),
    view_count: 0,
    unique_view_count: 0,
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    bookmark_count: 0,
    estimated_read_time: seed.readTime,
    word_count: words,
    character_count: content.length,
    published_at: created,
    created_at: created,
    updated_at: created,
  }
})

export type BuiltInLearningPath = {
  id: string
  title: string
  slug: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration: number
  category: string
  modules: Array<{ title: string; description: string; post_ids: string[]; order: number }>
  prerequisites: string[]
  learning_outcomes: string[]
  enrollment_count: number
  completion_rate: number
  average_rating: number
  is_published: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

const ids = (...slugs: string[]) => slugs.map((slug) => `rr-${slug}`)
const path = (
  id: number,
  title: string,
  slug: string,
  description: string,
  difficulty: BuiltInLearningPath['difficulty'],
  category: string,
  prerequisites: string[],
  outcomes: string[],
  modules: BuiltInLearningPath['modules'],
  featured = false,
): BuiltInLearningPath => ({
  id: `rr-path-${id}`,
  title, slug, description, difficulty, category, prerequisites,
  learning_outcomes: outcomes,
  modules,
  estimated_duration: modules.length * 80,
  enrollment_count: 0,
  completion_rate: 0,
  average_rating: 0,
  is_published: true,
  featured,
  created_at: '2026-09-01T00:00:00.000Z',
  updated_at: '2026-09-01T00:00:00.000Z',
})

export const BUILT_IN_LEARNING_PATHS: BuiltInLearningPath[] = [
  path(1, 'Linux & Networking Foundations', 'linux-networking-foundations', 'Build the operating-system and networking mental models every cloud-native engineer needs before touching orchestration.', 'beginner', 'Foundations', [], ['Debug Linux services and processes', 'Trace network failures across DNS, routing, TCP and HTTP', 'Understand the runtime primitives containers build on'], [
    { title: 'Linux runtime fundamentals', description: 'Processes, signals, services, logs, and resource boundaries.', post_ids: ids('linux-processes-signals-and-systemd'), order: 1 },
    { title: 'Network request lifecycle', description: 'IP, routing, ports, DNS, TCP, TLS, and HTTP.', post_ids: ids('networking-foundations-for-cloud-native-engineers'), order: 2 },
    { title: 'Containers from first principles', description: 'Images, layers, namespaces, cgroups, CRI, and OCI.', post_ids: ids('docker-images-containers-layers', 'container-runtime-containerd-cri-oci'), order: 3 },
  ], true),
  path(2, 'Containers to Kubernetes', 'containers-to-kubernetes', 'Move from container fundamentals to Kubernetes workloads, configuration, networking, storage, and production readiness.', 'beginner', 'Kubernetes', ['Basic Linux and networking'], ['Explain Kubernetes reconciliation', 'Deploy and expose applications', 'Configure persistent and production-ready workloads'], [
    { title: 'Container runtime', description: 'Understand what Kubernetes eventually asks the node to run.', post_ids: ids('docker-images-containers-layers', 'container-runtime-containerd-cri-oci'), order: 1 },
    { title: 'Workload controllers', description: 'Pods, ReplicaSets, Deployments, and reconciliation.', post_ids: ids('kubernetes-pods-deployments-replicasets'), order: 2 },
    { title: 'Service discovery and config', description: 'Services, DNS, Gateway API, ConfigMaps, and Secrets.', post_ids: ids('kubernetes-services-dns-ingress-gateway-api', 'kubernetes-configmaps-secrets-configuration'), order: 3 },
    { title: 'State and resilience', description: 'Storage, probes, resources, disruption, and graceful shutdown.', post_ids: ids('kubernetes-storage-pv-pvc-csi', 'kubernetes-probes-resources-production-readiness'), order: 4 },
  ], true),
  path(3, 'Kubernetes Production Engineering', 'kubernetes-production-engineering', 'Go beyond kubectl and learn scheduling, networking, policy, rollout safety, and the failure modes of production clusters.', 'advanced', 'Kubernetes', ['Kubernetes fundamentals', 'Linux and networking'], ['Diagnose Pending and unhealthy workloads', 'Design resilient workload placement', 'Implement safer network and access policy'], [
    { title: 'Scheduling and topology', description: 'Resource requests, taints, affinity, and topology spread.', post_ids: ids('kubernetes-scheduling-taints-affinity-topology'), order: 1 },
    { title: 'Production workload contracts', description: 'Health, resources, disruption, configuration, and storage.', post_ids: ids('kubernetes-probes-resources-production-readiness', 'kubernetes-storage-pv-pvc-csi'), order: 2 },
    { title: 'Networking and policy', description: 'Services, eBPF, Cilium, and zero-trust network policy.', post_ids: ids('kubernetes-services-dns-ingress-gateway-api', 'cilium-ebpf-kubernetes-networking', 'kubernetes-network-policies-zero-trust'), order: 3 },
    { title: 'Identity and delivery', description: 'RBAC, configuration packaging, and controlled rollout.', post_ids: ids('kubernetes-rbac-service-accounts', 'helm-vs-kustomize', 'deployment-strategies-rolling-blue-green-canary'), order: 4 },
  ], true),
  path(4, 'Terraform & Infrastructure as Code', 'terraform-infrastructure-as-code', 'Learn state, modules, brownfield adoption, drift, and safe refactoring as an infrastructure engineering discipline.', 'intermediate', 'Infrastructure as Code', ['Cloud fundamentals', 'Git basics'], ['Reason safely about Terraform state', 'Design reusable module APIs', 'Import and refactor infrastructure without destructive changes'], [
    { title: 'Terraform execution model', description: 'Configuration, state, provider refresh, plan, and apply.', post_ids: ids('terraform-state-plan-apply'), order: 1 },
    { title: 'Reusable platform modules', description: 'Inputs, outputs, defaults, validation, and versioning.', post_ids: ids('terraform-modules-production-design'), order: 2 },
    { title: 'Brownfield and drift', description: 'Import, drift reconciliation, and moved blocks.', post_ids: ids('terraform-drift-import-moved-blocks'), order: 3 },
  ], true),
  path(5, 'CI/CD & GitOps Delivery', 'cicd-gitops-delivery', 'Build a delivery model based on immutable artifacts, progressive rollout, Git reconciliation, and safe promotion.', 'intermediate', 'CI/CD', ['Git fundamentals', 'Containers'], ['Build deterministic pipelines', 'Choose rollout strategies by risk', 'Operate Argo CD or Flux with a clear reconciliation model'], [
    { title: 'Production CI', description: 'Artifacts, security, concurrency, environments, and promotion.', post_ids: ids('github-actions-production-cicd'), order: 1 },
    { title: 'Deployment safety', description: 'Rolling, blue-green, canary, and rollback boundaries.', post_ids: ids('deployment-strategies-rolling-blue-green-canary'), order: 2 },
    { title: 'GitOps reconciliation', description: 'Argo CD, Flux, desired state, and drift correction.', post_ids: ids('gitops-reconciliation-argocd', 'flux-vs-argocd-gitops'), order: 3 },
    { title: 'Configuration delivery', description: 'Helm and Kustomize tradeoffs in reviewable GitOps workflows.', post_ids: ids('helm-vs-kustomize'), order: 4 },
  ], true),
  path(6, 'Platform Engineering', 'platform-engineering', 'Design an internal platform as a product: capabilities, paved roads, self-service APIs, portals, ownership, and scorecards.', 'advanced', 'Platform Engineering', ['Kubernetes or cloud operations', 'CI/CD fundamentals'], ['Design platform capabilities around developer pain', 'Build usable self-service workflows', 'Model ownership and standards through a portal'], [
    { title: 'Platform as a product', description: 'Capabilities, cognitive load, paved roads, and outcome metrics.', post_ids: ids('platform-engineering-internal-developer-platforms'), order: 1 },
    { title: 'Golden paths', description: 'Self-service APIs, governance, escape hatches, and observability.', post_ids: ids('golden-paths-self-service-apis'), order: 2 },
    { title: 'Developer portal and ownership', description: 'Backstage entities, systems, components, and automated metadata.', post_ids: ids('backstage-software-catalog'), order: 3 },
    { title: 'Standards and architecture context', description: 'Scorecards, readiness, and useful architecture models.', post_ids: ids('platform-engineering-scorecards', 'production-readiness-review', 'architecture-diagrams-that-help-debugging'), order: 4 },
  ], true),
  path(7, 'Observability & SRE', 'observability-sre', 'Build a coherent reliability practice from telemetry signals through SLOs, incident reasoning, and capacity planning.', 'intermediate', 'SRE', ['Basic distributed systems'], ['Choose the right telemetry signal', 'Define useful SLOs and burn alerts', 'Investigate incidents using evidence and bounded actions'], [
    { title: 'Telemetry signals', description: 'Metrics, logs, traces, Prometheus, and OpenTelemetry pipelines.', post_ids: ids('logs-metrics-traces-debugging', 'prometheus-metrics-data-model', 'opentelemetry-collector-pipelines'), order: 1 },
    { title: 'Reliability objectives', description: 'SLIs, SLOs, error budgets, and alerting.', post_ids: ids('slo-sli-error-budgets'), order: 2 },
    { title: 'Incident operations', description: 'Hypothesis-driven debugging and production readiness.', post_ids: ids('incident-response-hypothesis-driven-debugging', 'production-readiness-review'), order: 3 },
    { title: 'Capacity and bottlenecks', description: 'Queues, backpressure, connection pools, retries, and saturation.', post_ids: ids('capacity-planning-queues-backpressure', 'database-connection-pools-production'), order: 4 },
  ], true),
  path(8, 'Cloud-Native Security', 'cloud-native-security', 'Build practical identity, network, secret, supply-chain, and tenant isolation controls for modern platforms.', 'advanced', 'Security', ['Kubernetes fundamentals', 'CI/CD fundamentals'], ['Apply least privilege in Kubernetes', 'Secure software supply chains', 'Design tenant and identity boundaries'], [
    { title: 'Workload identity', description: 'RBAC, ServiceAccounts, OAuth/OIDC, and enterprise access.', post_ids: ids('kubernetes-rbac-service-accounts', 'oauth-oidc-sso-platforms'), order: 1 },
    { title: 'Network trust boundaries', description: 'Default deny, Cilium, and explicit service communication.', post_ids: ids('kubernetes-network-policies-zero-trust', 'cilium-ebpf-kubernetes-networking'), order: 2 },
    { title: 'Secrets and supply chain', description: 'Vault, short-lived credentials, SBOMs, signing, and provenance.', post_ids: ids('secrets-management-vault-kubernetes', 'software-supply-chain-sbom-signing'), order: 3 },
    { title: 'SaaS tenant isolation', description: 'Postgres RLS and server-side authorization boundaries.', post_ids: ids('multi-tenant-saas-rls'), order: 4 },
  ]),
  path(9, 'Cloud Networking & AWS', 'cloud-networking-aws', 'Connect networking fundamentals to AWS VPCs and production EKS architecture.', 'intermediate', 'AWS', ['Networking fundamentals', 'Containers'], ['Design common VPC layouts', 'Trace cloud network failures', 'Reason about EKS networking and identity'], [
    { title: 'Network fundamentals', description: 'Routing, DNS, transport, and request tracing.', post_ids: ids('networking-foundations-for-cloud-native-engineers'), order: 1 },
    { title: 'AWS VPC networking', description: 'Subnets, routes, NAT, Internet Gateways, and filtering.', post_ids: ids('aws-vpc-subnets-nat-routing'), order: 2 },
    { title: 'Production EKS', description: 'Nodes, networking, IAM, availability, and upgrades.', post_ids: ids('aws-eks-production-architecture'), order: 3 },
    { title: 'Cost as an engineering signal', description: 'Allocation, unit cost, and architecture tradeoffs.', post_ids: ids('cloud-cost-engineering-finops'), order: 4 },
  ]),
  path(10, 'Distributed Systems Reliability', 'distributed-systems-reliability', 'Understand the failure semantics behind APIs, queues, caches, databases, retries, and replicated systems.', 'advanced', 'Distributed Systems', ['Networking fundamentals', 'Backend development'], ['Design safe retry and idempotency behavior', 'Reason about consistency and replication', 'Operate queues, caches, and connection pools under failure'], [
    { title: 'Remote calls and APIs', description: 'Timeouts, retries, idempotency, pagination, and error contracts.', post_ids: ids('distributed-systems-timeouts-retries-idempotency', 'api-design-pagination-idempotency-errors'), order: 1 },
    { title: 'Consistency and state', description: 'Replication, partitions, application invariants, and database pools.', post_ids: ids('distributed-systems-consistency-availability', 'database-connection-pools-production'), order: 2 },
    { title: 'Asynchronous work', description: 'Queues, delivery semantics, dead letters, lag, and backpressure.', post_ids: ids('message-queues-delivery-semantics', 'capacity-planning-queues-backpressure'), order: 3 },
    { title: 'Caching safely', description: 'Redis, cache-aside, stampedes, TTLs, and failure modes.', post_ids: ids('caching-redis-production-patterns'), order: 4 },
  ]),
  path(11, 'Go for Platform Engineers', 'go-for-platform-engineers', 'Use Go to build reliable infrastructure APIs, concurrent workers, and Kubernetes controllers.', 'intermediate', 'Go', ['Programming fundamentals'], ['Write bounded concurrent Go services', 'Operate HTTP services safely', 'Understand Kubernetes controller reconciliation'], [
    { title: 'Structured concurrency', description: 'Goroutines, channels, context, cancellation, and bounded parallelism.', post_ids: ids('go-concurrency-goroutines-channels-context'), order: 1 },
    { title: 'Production HTTP', description: 'Timeouts, graceful shutdown, middleware, and observability.', post_ids: ids('go-http-services-production'), order: 2 },
    { title: 'Infrastructure APIs', description: 'Pagination, idempotency, errors, and compatibility.', post_ids: ids('api-design-pagination-idempotency-errors'), order: 3 },
    { title: 'Kubernetes controllers', description: 'Reconciliation, status, finalizers, and external side effects.', post_ids: ids('kubernetes-operators-reconciliation-go'), order: 4 },
  ]),
  path(12, 'AI Infrastructure & Engineering Agents', 'ai-infrastructure-engineering-agents', 'Build the retrieval, MCP, evaluation, and safety layers behind AI systems that interact with engineering workflows.', 'advanced', 'AI Infrastructure', ['Backend APIs', 'Platform or SRE fundamentals'], ['Design production MCP interfaces', 'Evaluate infrastructure agents by observable behavior', 'Build hybrid engineering retrieval with pgvector'], [
    { title: 'Engineering knowledge retrieval', description: 'RAG, source quality, metadata, evaluation, and hybrid retrieval.', post_ids: ids('rag-for-engineering-knowledge', 'vector-search-pgvector-engineering'), order: 1 },
    { title: 'MCP interface layer', description: 'Stable tools, auth, tenancy, rate limits, and domain APIs.', post_ids: ids('mcp-servers-production-engineering'), order: 2 },
    { title: 'Agent operations safety', description: 'Evidence, permissions, blast radius, reversibility, and scoring.', post_ids: ids('ai-agents-infrastructure-safety'), order: 3 },
    { title: 'SRE foundations for agents', description: 'Incident reasoning, production readiness, and safe recovery.', post_ids: ids('incident-response-hypothesis-driven-debugging', 'production-readiness-review'), order: 4 },
  ], true),
]

export function getBuiltInPostBySlug(slug: string) {
  return BUILT_IN_POSTS.find((post) => post.slug === slug) ?? null
}

export function getBuiltInPostById(id: string) {
  return BUILT_IN_POSTS.find((post) => post.id === id) ?? null
}

export function getBuiltInPostsByIds(postIds: string[]) {
  const index = new Map(BUILT_IN_POSTS.map((post) => [post.id, post]))
  return postIds.map((id) => index.get(id)).filter((post): post is Post => Boolean(post))
}
