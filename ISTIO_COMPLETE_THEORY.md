# Istio Service Mesh - Complete Theory Guide

## Table of Contents
1. [Introduction to Service Mesh](#introduction-to-service-mesh)
2. [Istio Architecture](#istio-architecture)
3. [Installation & Configuration](#installation--configuration)
4. [Traffic Management](#traffic-management)
5. [Security](#security)
6. [Observability](#observability)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 1. Introduction to Service Mesh

### 1.1 What is a Service Mesh?

A **service mesh** is a dedicated infrastructure layer for managing service-to-service communication in microservices architectures. It provides:

- **Traffic management**: Intelligent routing, load balancing, traffic splitting
- **Security**: mTLS encryption, authentication, authorization
- **Observability**: Metrics, logs, distributed tracing
- **Resilience**: Circuit breakers, retries, timeouts, fault injection

### 1.2 Why Do We Need a Service Mesh?

**Traditional Challenges in Microservices:**
- Each service must implement retry logic, circuit breakers, timeouts
- Security policies scattered across applications
- No unified observability
- Language-specific libraries create inconsistency
- Difficult to enforce policies across all services

**Service Mesh Benefits:**
- **Separation of Concerns**: Network logic separated from business logic
- **Polyglot Support**: Works with any language/framework
- **Centralized Policy Management**: Apply policies uniformly
- **Zero Code Changes**: Adds capabilities without modifying applications
- **Enhanced Security**: Automatic encryption and authentication

### 1.3 The Sidecar Pattern

**Concept:**
- A sidecar proxy is deployed alongside each application container in the same pod
- All network traffic flows through this proxy
- The proxy handles networking concerns transparently

**How It Works:**
```
Pod
├── Application Container (your service)
└── Sidecar Proxy Container (Envoy)
```

**Traffic Flow:**
1. Application makes outbound request
2. Sidecar intercepts the request
3. Sidecar applies policies (routing, security, telemetry)
4. Sidecar forwards to destination sidecar
5. Destination sidecar applies policies
6. Request reaches destination application

**Advantages:**
- No application code changes required
- Independent scaling and updates
- Language-agnostic solution
- Consistent policy enforcement

**Disadvantages:**
- Increased resource consumption (CPU, memory)
- Additional latency (minimal, typically <1ms)
- Operational complexity

### 1.4 Ambient Mesh (Sidecar-less Architecture)

**New Approach (Istio 1.15+):**
- Removes per-pod sidecar proxies
- Uses shared node-level proxies
- Reduces resource overhead

**Two-Layer Architecture:**

1. **ztunnel (Zero Trust Tunnel) - Layer 4**
   - Runs as DaemonSet on each node
   - Handles mTLS, basic authentication
   - Minimal resource footprint
   - TCP-level traffic management

2. **waypoint proxy - Layer 7**
   - Optional, deployed per namespace/service
   - Advanced HTTP routing, policies
   - Only deployed when L7 features needed

**Benefits:**
- 90% reduction in resource consumption
- Faster pod startup times
- Simpler troubleshooting
- Gradual adoption path

**When to Use:**
- Resource-constrained environments
- Cost optimization priority
- Simple traffic management needs
- Large-scale deployments

---

## 2. Istio Architecture

### 2.1 Overview

Istio architecture consists of two main planes:

```
┌─────────────────────────────────────────┐
│          CONTROL PLANE                  │
│           (istiod)                      │
│  ┌──────────┬──────────┬──────────┐    │
│  │  Pilot   │ Citadel  │ Galley   │    │
│  └──────────┴──────────┴──────────┘    │
└─────────────────┬───────────────────────┘
                  │ Configuration
                  │ Certificates
                  ▼
┌─────────────────────────────────────────┐
│           DATA PLANE                    │
│    ┌─────┐  ┌─────┐  ┌─────┐          │
│    │Envoy│  │Envoy│  │Envoy│          │
│    │Proxy│  │Proxy│  │Proxy│          │
│    └─────┘  └─────┘  └─────┘          │
└─────────────────────────────────────────┘
```

### 2.2 Control Plane - Istiod

**Istiod** is the unified control plane component (since Istio 1.5) combining:

#### **Pilot**
- **Service Discovery**: Discovers services and endpoints
- **Traffic Management**: Converts high-level routing rules to Envoy configs
- **Configuration Distribution**: Pushes config to all proxies
- **Health Checking**: Monitors proxy health

Functions:
```
┌──────────────┐
│ VirtualService│──┐
│DestinationRule│  │
│   Gateway     │  │  Pilot converts to
│ ServiceEntry  │──┼─► Envoy config (xDS API)
│   Sidecar     │  │
└──────────────┘  │
                  ▼
            ┌─────────┐
            │  Envoy  │
            │  Proxy  │
            └─────────┘
```

#### **Citadel (Security)**
- **Certificate Authority**: Issues and rotates X.509 certificates
- **Identity Management**: Provides SPIFFE IDs to workloads
- **Key Management**: Manages private keys securely
- **Certificate Rotation**: Automatic rotation before expiry

Certificate Lifecycle:
```
1. Workload starts
2. Requests certificate from Citadel
3. Citadel validates identity (ServiceAccount)
4. Issues certificate (default 24h validity)
5. Auto-rotates before expiry
```

#### **Galley (Configuration)**
- **Validation**: Validates Istio configuration before applying
- **Processing**: Transforms Kubernetes resources
- **Distribution**: Distributes validated config to Istiod components
- **Isolation**: Isolates Istio from Kubernetes API changes

### 2.3 Data Plane - Envoy Proxy

**Envoy** is a high-performance C++ proxy deployed as sidecar:

**Key Features:**
- **Dynamic Configuration**: Config updated without restarts
- **HTTP/2 and gRPC Support**: First-class support
- **Advanced Load Balancing**: Round robin, least request, ring hash, etc.
- **Health Checking**: Active and passive health checks
- **Circuit Breaking**: Prevent cascade failures
- **Rich Metrics**: Detailed telemetry collection
- **Observability**: Logs, traces, metrics

**Envoy Configuration (xDS APIs):**
- **LDS (Listener Discovery)**: Defines listeners (ports)
- **RDS (Route Discovery)**: HTTP routing rules
- **CDS (Cluster Discovery)**: Upstream clusters
- **EDS (Endpoint Discovery)**: Cluster members
- **SDS (Secret Discovery)**: TLS certificates

**Traffic Interception:**
```
1. iptables rules redirect traffic to Envoy
2. Envoy listens on specific ports (15001, 15006)
3. Envoy applies policies
4. Envoy forwards to destination
```

### 2.4 Component Communication

```
┌────────────────────────────────────────┐
│  Kubernetes API Server                 │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Istiod                                │
│  - Watches K8s resources               │
│  - Converts to Envoy config            │
│  - Manages certificates                │
└────────┬───────────────────────────────┘
         │ xDS Protocol (gRPC)
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
  Envoy    Envoy    Envoy    Envoy
  (Sidecar)(Sidecar)(Sidecar)(Gateway)
```

---

## 3. Installation & Configuration

### 3.1 Installation Methods

#### **Method 1: istioctl CLI**

```bash
# Download Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.x.x
export PATH=$PWD/bin:$PATH

# Install with default profile
istioctl install --set profile=default -y

# Verify installation
istioctl verify-install
```

**Profiles:**
- **default**: Production-ready configuration
- **demo**: Testing, showcases features (high resources)
- **minimal**: Minimal components for testing
- **production**: Production optimized, HA setup
- **preview**: Experimental features
- **empty**: Base for custom configuration

#### **Method 2: Helm**

```bash
# Add Helm repository
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo update

# Install Istio base (CRDs)
helm install istio-base istio/base -n istio-system --create-namespace

# Install Istiod (control plane)
helm install istiod istio/istiod -n istio-system --wait

# Install Ingress Gateway
helm install istio-ingress istio/gateway -n istio-ingress --create-namespace
```

**Helm Advantages:**
- GitOps friendly
- Version control for config
- Easy rollback
- Standard K8s tool

#### **Method 3: Ambient Mode**

```bash
# Install with ambient profile
istioctl install --set profile=ambient -y

# Label namespace for ambient
kubectl label namespace default istio.io/dataplane-mode=ambient
```

### 3.2 Namespace Injection

**Automatic Sidecar Injection:**

```bash
# Label namespace for injection
kubectl label namespace default istio-injection=enabled

# Verify label
kubectl get namespace -L istio-injection

# Deploy app (sidecar auto-injected)
kubectl apply -f app.yaml
```

**Manual Injection:**

```bash
# Inject sidecar into deployment
istioctl kube-inject -f app.yaml | kubectl apply -f -
```

**Disable Injection for Specific Pods:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    sidecar.istio.io/inject: "false"
```

### 3.3 Custom Installation

**Using IstioOperator:**

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: custom-istio
spec:
  profile: default
  
  # Custom values
  meshConfig:
    accessLogFile: /dev/stdout
    enableTracing: true
    defaultConfig:
      tracing:
        sampling: 100.0
  
  # Component customization
  components:
    pilot:
      k8s:
        resources:
          requests:
            cpu: 500m
            memory: 2Gi
        hpaSpec:
          minReplicas: 2
          maxReplicas: 5
    
    ingressGateways:
      - name: istio-ingressgateway
        enabled: true
        k8s:
          service:
            type: LoadBalancer
          resources:
            requests:
              cpu: 200m
              memory: 256Mi
```

Apply:
```bash
istioctl install -f custom-istio.yaml
```

### 3.4 Canary Upgrades

**Zero-Downtime Upgrade Strategy:**

```bash
# Current version: 1.20.0
# Target version: 1.21.0

# Step 1: Install new control plane
istioctl install --set revision=1-21 -y

# Step 2: Verify both control planes running
kubectl get pods -n istio-system

# Step 3: Migrate workloads gradually
kubectl label namespace default istio-injection- istio.io/rev=1-21

# Step 4: Restart pods to get new sidecar
kubectl rollout restart deployment -n default

# Step 5: Verify traffic flow
istioctl proxy-status

# Step 6: Remove old control plane
istioctl uninstall --revision=1-20 -y
```

**Canary Flow:**
```
┌─────────────┐      ┌─────────────┐
│ Control     │      │ Control     │
│ Plane 1.20  │      │ Plane 1.21  │
└──────┬──────┘      └──────┬──────┘
       │                    │
   ┌───┴───┐            ┌───┴───┐
   │ Old   │            │ New   │
   │Proxies│            │Proxies│
   └───────┘            └───────┘
```

### 3.5 Configuration Validation

```bash
# Validate Istio configuration
istioctl analyze

# Validate specific resource
istioctl analyze -f virtualservice.yaml

# Analyze namespace
istioctl analyze -n production

# Check proxy sync status
istioctl proxy-status
```

---

## 4. Traffic Management

### 4.1 Virtual Services

**Purpose:** Define routing rules for how requests are routed to services.

**Basic Structure:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: reviews-route
spec:
  hosts:
    - reviews.default.svc.cluster.local
  http:
    - match:
        - headers:
            end-user:
              exact: "jason"
      route:
        - destination:
            host: reviews
            subset: v2
    - route:
        - destination:
            host: reviews
            subset: v1
```

**Key Concepts:**

1. **Host Matching:**
   - DNS names that VirtualService applies to
   - Can be K8s service names or external hosts

2. **HTTP Match Conditions:**
```yaml
match:
  - uri:
      prefix: "/api/v1"
  - uri:
      exact: "/login"
  - uri:
      regex: "^/products/.*"
  - headers:
      cookie:
        regex: "^(.*?;)?(user=jason)(;.*)?$"
  - queryParams:
      version:
        exact: "v2"
  - method:
      exact: "GET"
  - sourceLabels:
      app: "frontend"
```

3. **Traffic Splitting (Canary/Blue-Green):**
```yaml
http:
  - route:
      - destination:
          host: reviews
          subset: v1
        weight: 90
      - destination:
          host: reviews
          subset: v2
        weight: 10
```

4. **URL Rewriting:**
```yaml
http:
  - match:
      - uri:
          prefix: "/api/old"
    rewrite:
      uri: "/api/new"
    route:
      - destination:
          host: api-service
```

5. **Request Redirects:**
```yaml
http:
  - match:
      - uri:
          exact: "/old-page"
    redirect:
      uri: "/new-page"
      authority: "newsite.com"
```

6. **Header Manipulation:**
```yaml
http:
  - route:
      - destination:
          host: service
    headers:
      request:
        add:
          x-custom-header: "value"
        remove:
          - x-legacy-header
      response:
        add:
          x-response-header: "response-value"
```

### 4.2 Destination Rules

**Purpose:** Define policies that apply after routing (load balancing, connection pooling, outlier detection).

**Basic Structure:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: reviews-destination
spec:
  host: reviews.default.svc.cluster.local
  trafficPolicy:
    loadBalancer:
      simple: LEAST_REQUEST
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
        maxRequestsPerConnection: 2
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
      trafficPolicy:
        loadBalancer:
          simple: ROUND_ROBIN
```

**Load Balancing Algorithms:**

1. **ROUND_ROBIN**: Distribute equally (default)
2. **LEAST_REQUEST**: Send to endpoint with fewest active requests
3. **RANDOM**: Random selection
4. **PASSTHROUGH**: Forward to original destination
5. **CONSISTENT_HASH**: Hash-based (session affinity)

```yaml
loadBalancer:
  consistentHash:
    httpHeaderName: "x-user-id"
    # OR
    httpCookie:
      name: "user-session"
      ttl: 3600s
    # OR
    useSourceIp: true
```

**Connection Pool Settings:**

```yaml
connectionPool:
  tcp:
    maxConnections: 100        # Max connections to backend
    connectTimeout: 30s        # TCP connection timeout
    tcpKeepalive:
      time: 7200s
      interval: 75s
  http:
    http1MaxPendingRequests: 50    # Max pending HTTP/1.1 requests
    http2MaxRequests: 100          # Max HTTP/2 requests
    maxRequestsPerConnection: 2    # Max requests per connection
    maxRetries: 3                  # Max retry attempts
    idleTimeout: 3600s             # Idle connection timeout
```

**Outlier Detection (Circuit Breaking):**

```yaml
outlierDetection:
  consecutiveErrors: 5           # Errors before ejection
  interval: 30s                  # Analysis interval
  baseEjectionTime: 30s          # Minimum ejection duration
  maxEjectionPercent: 50         # Max % of hosts that can be ejected
  minHealthPercent: 30           # Min healthy hosts required
  consecutiveGatewayErrors: 5    # Gateway errors trigger
  consecutive5xxErrors: 5        # 5xx errors trigger
```

### 4.3 Gateways

**Purpose:** Manage inbound/outbound traffic at the edge of the mesh.

**Ingress Gateway:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: my-gateway
spec:
  selector:
    istio: ingressgateway  # Use default ingress gateway
  servers:
    - port:
        number: 80
        name: http
        protocol: HTTP
      hosts:
        - "example.com"
        - "api.example.com"
    - port:
        number: 443
        name: https
        protocol: HTTPS
      tls:
        mode: SIMPLE
        credentialName: example-cert  # K8s secret name
      hosts:
        - "secure.example.com"
```

**Link Gateway to VirtualService:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: external-service
spec:
  hosts:
    - "example.com"
  gateways:
    - my-gateway              # Reference gateway
  http:
    - match:
        - uri:
            prefix: "/api"
      route:
        - destination:
            host: api-service
            port:
              number: 8080
```

**Egress Gateway:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: egress-gateway
spec:
  selector:
    istio: egressgateway
  servers:
    - port:
        number: 443
        name: tls
        protocol: TLS
      hosts:
        - "external-api.com"
      tls:
        mode: PASSTHROUGH
```

**TLS Modes:**
- **SIMPLE**: Standard TLS (server cert only)
- **MUTUAL**: mTLS (client + server certs)
- **PASSTHROUGH**: TLS without termination
- **AUTO_PASSTHROUGH**: SNI-based routing

### 4.4 Service Entries

**Purpose:** Add external services to the mesh registry.

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: external-database
spec:
  hosts:
    - "database.external.com"
  ports:
    - number: 5432
      name: postgres
      protocol: TCP
  location: MESH_EXTERNAL
  resolution: DNS
```

**Resolution Types:**

1. **DNS**: Use DNS to resolve (external services)
2. **STATIC**: Use explicitly specified endpoints
3. **NONE**: Inherit from platform (K8s services)

**With Static IPs:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: legacy-vm
spec:
  hosts:
    - "legacy-app.corp.local"
  addresses:
    - "10.20.30.40"
  ports:
    - number: 8080
      name: http
      protocol: HTTP
  location: MESH_EXTERNAL
  resolution: STATIC
  endpoints:
    - address: "10.20.30.40"
      ports:
        http: 8080
      labels:
        region: "us-west"
```

**TCP Services:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: mongodb
spec:
  hosts:
    - "mongo.external.com"
  ports:
    - number: 27017
      name: mongo
      protocol: MONGO
  location: MESH_EXTERNAL
  resolution: DNS
```

### 4.5 Sidecars

**Purpose:** Configure sidecar proxy to optimize resource usage and security.

**Limit Egress Traffic:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Sidecar
metadata:
  name: default
  namespace: prod
spec:
  egress:
    - hosts:
        - "./*"                    # Same namespace
        - "istio-system/*"         # Istio system namespace
        - "prod/*"                 # Prod namespace
```

**Optimize for Specific Service:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Sidecar
metadata:
  name: database-client
  namespace: app
spec:
  workloadSelector:
    labels:
      app: backend
  egress:
    - hosts:
        - "./database.app.svc.cluster.local"
        - "external/api.external.com"
  outboundTrafficPolicy:
    mode: REGISTRY_ONLY  # Only access registered services
```

**Custom Ports:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Sidecar
metadata:
  name: custom-ports
spec:
  ingress:
    - port:
        number: 9080
        protocol: HTTP
        name: custom-http
      defaultEndpoint: "127.0.0.1:8080"
```

### 4.6 Traffic Mirroring (Shadowing)

**Purpose:** Send copy of live traffic to test version.

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: mirror-traffic
spec:
  hosts:
    - api-service
  http:
    - route:
        - destination:
            host: api-service
            subset: v1
          weight: 100
      mirror:
        host: api-service
        subset: v2
      mirrorPercentage:
        value: 50.0  # Mirror 50% of traffic
```

**Use Cases:**
- Test new versions with production traffic
- Performance testing
- Debugging issues
- Data collection

### 4.7 Circuit Breakers

**Purpose:** Prevent cascade failures by limiting connections/requests.

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: circuit-breaker
spec:
  host: api-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 10
        maxRequestsPerConnection: 2
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```

**How It Works:**

```
Request → Envoy → Check Circuit State
                 ↓
         ┌──────┴──────┐
         │             │
      CLOSED        OPEN
     (Normal)    (Blocking)
         │             │
    Forward to    Return
    Backend       503 Error
         │             │
    Track         Wait for
    Errors    baseEjectionTime
         │             │
    Too Many      Try Again
    Errors?    (Half-Open)
         │             │
         └─────┬───────┘
               ↓
         Update State
```

### 4.8 Fault Injection

**Purpose:** Test application resilience by injecting failures.

**Delay Injection:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: delay-test
spec:
  hosts:
    - api-service
  http:
    - fault:
        delay:
          percentage:
            value: 50.0  # 50% of requests
          fixedDelay: 5s
      route:
        - destination:
            host: api-service
```

**Abort Injection:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: abort-test
spec:
  hosts:
    - api-service
  http:
    - fault:
        abort:
          percentage:
            value: 10.0  # 10% of requests
          httpStatus: 503
      route:
        - destination:
            host: api-service
```

**Combined (Delay + Abort):**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: chaos-test
spec:
  hosts:
    - api-service
  http:
    - match:
        - headers:
            x-chaos-test:
              exact: "true"
      fault:
        delay:
          percentage:
            value: 30.0
          fixedDelay: 3s
        abort:
          percentage:
            value: 10.0
          httpStatus: 500
      route:
        - destination:
            host: api-service
```

### 4.9 Timeouts and Retries

**Request Timeout:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: timeout-config
spec:
  hosts:
    - api-service
  http:
    - route:
        - destination:
            host: api-service
      timeout: 10s  # Total request timeout
```

**Retry Policy:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: retry-config
spec:
  hosts:
    - api-service
  http:
    - route:
        - destination:
            host: api-service
      retries:
        attempts: 3
        perTryTimeout: 2s
        retryOn: "5xx,reset,connect-failure,refused-stream"
```

**Retry Conditions:**
- **5xx**: HTTP 5xx errors
- **gateway-error**: 502, 503, 504 errors
- **reset**: Connection reset
- **connect-failure**: Connection failed
- **refused-stream**: Stream refused
- **retriable-4xx**: 409 errors
- **retriable-status-codes**: Custom status codes

### 4.10 Workload Entry

**Purpose:** Add VMs or external workloads to the mesh.

```yaml
apiVersion: networking.istio.io/v1beta1
kind: WorkloadEntry
metadata:
  name: legacy-vm-1
  namespace: prod
spec:
  address: "10.20.30.40"
  labels:
    app: legacy-app
    version: v1
    region: us-west
  serviceAccount: legacy-sa
```

**Associated ServiceEntry:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: legacy-app
  namespace: prod
spec:
  hosts:
    - legacy-app.prod.svc.cluster.local
  ports:
    - number: 8080
      name: http
      protocol: HTTP
  location: MESH_INTERNAL
  resolution: STATIC
  workloadSelector:
    labels:
      app: legacy-app
```

---

## 5. Security

### 5.1 mTLS (Mutual TLS)

**Purpose:** Encrypt service-to-service communication automatically.

**How mTLS Works:**

```
Service A → Envoy A → mTLS → Envoy B → Service B
            ↓                  ↑
        Certificate        Certificate
        from Citadel      Verification
```

**PeerAuthentication - Mesh-Wide:**

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT  # Enforce mTLS
```

**mTLS Modes:**

1. **STRICT**: Only accept mTLS traffic (recommended for production)
2. **PERMISSIVE**: Accept both plaintext and mTLS (migration mode)
3. **DISABLE**: Disable mTLS completely

**Namespace-Specific:**

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: namespace-policy
  namespace: production
spec:
  mtls:
    mode: STRICT
```

**Workload-Specific:**

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: workload-policy
  namespace: production
spec:
  selector:
    matchLabels:
      app: payments
  mtls:
    mode: STRICT
  portLevelMtls:
    8080:
      mode: DISABLE  # Disable mTLS for specific port
```

**DestinationRule for mTLS:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: mtls-destination
spec:
  host: "*.production.svc.cluster.local"
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL  # Use Istio-issued certificates
```

### 5.2 Authentication

**Types of Authentication:**

1. **Peer Authentication** (service-to-service)
2. **Request Authentication** (end-user/JWT)

#### Request Authentication (JWT)

```yaml
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: jwt-auth
  namespace: production
spec:
  selector:
    matchLabels:
      app: api-gateway
  jwtRules:
    - issuer: "https://auth.example.com"
      jwksUri: "https://auth.example.com/.well-known/jwks.json"
      audiences:
        - "api.example.com"
      forwardOriginalToken: true
      fromHeaders:
        - name: "Authorization"
          prefix: "Bearer "
      fromParams:
        - "access_token"
```

**Multiple JWT Providers:**

```yaml
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: multi-jwt
spec:
  selector:
    matchLabels:
      app: api
  jwtRules:
    - issuer: "https://provider1.com"
      jwksUri: "https://provider1.com/jwks.json"
    - issuer: "https://provider2.com"
      jwksUri: "https://provider2.com/jwks.json"
```

### 5.3 Authorization

**Purpose:** Control access to services based on identity, roles, conditions.

**Basic Authorization Policy:**

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-frontend
  namespace: production
spec:
  selector:
    matchLabels:
      app: backend
  action: ALLOW
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/production/sa/frontend"]
      to:
        - operation:
            methods: ["GET", "POST"]
            paths: ["/api/*"]
```

**Actions:**
- **ALLOW**: Allow requests that match
- **DENY**: Deny requests that match (takes precedence)
- **AUDIT**: Log requests (doesn't affect traffic)
- **CUSTOM**: Use external authorizer

**Deny Policy (Higher Priority):**

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: deny-all
  namespace: production
spec:
  selector:
    matchLabels:
      app: database
  action: DENY
  rules:
    - from:
        - source:
            namespaces: ["public"]
```

**Complex Conditions:**

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: complex-auth
spec:
  selector:
    matchLabels:
      app: api
  action: ALLOW
  rules:
    # Rule 1: Allow admins full access
    - from:
        - source:
            principals: ["cluster.local/ns/prod/sa/admin"]
      to:
        - operation:
            methods: ["*"]
    
    # Rule 2: Allow specific IPs to read
    - from:
        - source:
            ipBlocks: ["10.0.0.0/8", "192.168.1.0/24"]
      to:
        - operation:
            methods: ["GET"]
            paths: ["/api/public/*"]
    
    # Rule 3: JWT claims-based
    - from:
        - source:
            requestPrincipals: ["*"]
      when:
        - key: request.auth.claims[role]
          values: ["admin", "editor"]
      to:
        - operation:
            methods: ["POST", "PUT", "DELETE"]
```

**Field Selectors:**

**From (Source):**
- `principals`: ServiceAccount identity
- `requestPrincipals`: JWT subject
- `namespaces`: Source namespace
- `ipBlocks`: Source IP addresses
- `remoteIpBlocks`: Original client IP (via X-Forwarded-For)

**To (Operation):**
- `hosts`: Destination hosts
- `ports`: Destination ports
- `methods`: HTTP methods
- `paths`: URL paths

**When (Conditions):**
```yaml
when:
  - key: request.headers[x-custom-header]
    values: ["value1", "value2"]
  - key: source.namespace
    notValues: ["untrusted"]
  - key: destination.port
    values: ["8080"]
  - key: request.auth.claims[group]
    values: ["dev-team"]
```

**Common Patterns:**

**1. Deny All by Default:**
```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: deny-all
  namespace: production
spec:
  {}  # Empty spec = deny all
```

**2. Allow Specific Namespace:**
```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-namespace
spec:
  action: ALLOW
  rules:
    - from:
        - source:
            namespaces: ["trusted-ns"]
```

**3. Rate Limiting by IP:**
```yaml
when:
  - key: source.ip
    values: ["10.0.0.0/8"]
  - key: request.headers[x-rate-limit]
    notValues: ["exceeded"]
```

**4. Time-Based Access:**
```yaml
when:
  - key: request.time
    values: ["09:00:00", "17:00:00"]  # Business hours
```

### 5.4 Certificate Management

**Automatic Certificate Rotation:**

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  meshConfig:
    certificates:
      - secretName: dns.example-cert
        dnsNames:
          - example.com
          - "*.example.com"
    defaultConfig:
      proxyMetadata:
        CERT_ROTATION_CHECK_INTERVAL: 1h
```

**Custom CA Integration:**

```bash
# Create namespace
kubectl create namespace istio-system

# Create CA secret
kubectl create secret generic cacerts -n istio-system \
  --from-file=ca-cert.pem \
  --from-file=ca-key.pem \
  --from-file=root-cert.pem \
  --from-file=cert-chain.pem

# Install Istio with custom CA
istioctl install --set values.global.pilotCertProvider=istiod
```

**Certificate Inspection:**

```bash
# View certificate details
istioctl proxy-config secret <pod-name> -o json

# Check certificate expiry
openssl s_client -showcerts -connect service:443 < /dev/null 2>/dev/null | \
  openssl x509 -noout -dates
```

---

## 6. Observability

### 6.1 Metrics

**Built-in Metrics:**

Istio automatically collects:
- **Request count**: Total requests
- **Request duration**: Latency percentiles
- **Request size**: Bytes sent/received
- **Response size**: Response payload size
- **gRPC metrics**: gRPC-specific metrics

**Prometheus Integration:**

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  meshConfig:
    enablePrometheusMerge: true
  components:
    pilot:
      k8s:
        env:
          - name: PILOT_ENABLE_TELEMETRY_V2
            value: "true"
```

**Query Examples:**

```promql
# Request rate
rate(istio_requests_total[5m])

# P95 latency
histogram_quantile(0.95, 
  rate(istio_request_duration_milliseconds_bucket[5m])
)

# Error rate
sum(rate(istio_requests_total{response_code=~"5.."}[5m])) 
/ 
sum(rate(istio_requests_total[5m]))

# Success rate
sum(rate(istio_requests_total{response_code=~"2.."}[5m])) 
/ 
sum(rate(istio_requests_total[5m]))
```

**Custom Metrics:**

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: custom-metrics
  namespace: istio-system
spec:
  metrics:
    - providers:
        - name: prometheus
      dimensions:
        custom_label: request.headers["x-custom-header"]
```

### 6.2 Distributed Tracing

**Trace Propagation Headers:**
- `x-request-id`
- `x-b3-traceid`
- `x-b3-spanid`
- `x-b3-parentspanid`
- `x-b3-sampled`
- `x-b3-flags`

**Jaeger Integration:**

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  meshConfig:
    enableTracing: true
    defaultConfig:
      tracing:
        sampling: 100.0  # 100% sampling (reduce in production)
        zipkin:
          address: "jaeger-collector.istio-system:9411"
```

**Application Code (Propagate Headers):**

```python
# Python example
import requests

def make_request(url, incoming_headers):
    # Propagate trace headers
    trace_headers = {
        'x-request-id': incoming_headers.get('x-request-id'),
        'x-b3-traceid': incoming_headers.get('x-b3-traceid'),
        'x-b3-spanid': incoming_headers.get('x-b3-spanid'),
        'x-b3-parentspanid': incoming_headers.get('x-b3-parentspanid'),
        'x-b3-sampled': incoming_headers.get('x-b3-sampled'),
        'x-b3-flags': incoming_headers.get('x-b3-flags'),
    }
    
    response = requests.get(url, headers=trace_headers)
    return response
```

**Sampling Configuration:**

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: tracing-config
  namespace: istio-system
spec:
  tracing:
    - providers:
        - name: jaeger
      randomSamplingPercentage: 1.0  # 1% sampling for production
      customTags:
        environment:
          literal:
            value: "production"
        version:
          environment:
            name: APP_VERSION
```

### 6.3 Logging

**Access Logs:**

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  meshConfig:
    accessLogFile: "/dev/stdout"
    accessLogFormat: |
      [%START_TIME%] "%REQ(:METHOD)% %REQ(X-ENVOY-ORIGINAL-PATH?:PATH)% %PROTOCOL%"
      %RESPONSE_CODE% %RESPONSE_FLAGS% %BYTES_RECEIVED% %BYTES_SENT%
      %DURATION% %RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%
      "%REQ(X-FORWARDED-FOR)%" "%REQ(USER-AGENT)%"
      "%REQ(X-REQUEST-ID)%" "%REQ(:AUTHORITY)%"
      "%UPSTREAM_HOST%" "%UPSTREAM_CLUSTER%"
    accessLogEncoding: JSON
```

**Telemetry API for Logging:**

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: access-logging
  namespace: production
spec:
  accessLogging:
    - providers:
        - name: envoy
      filter:
        expression: "response.code >= 400"  # Only log errors
```

**Log Levels:**

```bash
# Change log level dynamically
istioctl proxy-config log <pod-name> --level debug

# Specific component
istioctl proxy-config log <pod-name> --level rbac:debug,jwt:debug
```

### 6.4 Kiali (Service Mesh Visualization)

**Install Kiali:**

```bash
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.21/samples/addons/kiali.yaml

# Access Kiali dashboard
istioctl dashboard kiali
```

**Features:**
- **Topology Graph**: Visual service mesh map
- **Traffic Metrics**: Request rates, latencies, errors
- **Configuration Validation**: Detect config issues
- **Distributed Tracing**: Integrated with Jaeger
- **Workload Health**: Health indicators

### 6.5 Grafana Dashboards

**Install Grafana:**

```bash
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.21/samples/addons/grafana.yaml

# Access Grafana
istioctl dashboard grafana
```

**Built-in Dashboards:**
- **Mesh Dashboard**: Overall mesh health
- **Service Dashboard**: Per-service metrics
- **Workload Dashboard**: Per-workload metrics
- **Performance Dashboard**: Control plane performance
- **Wasm Extension Dashboard**: WebAssembly metrics

---

## 7. Troubleshooting

### 7.1 Common Issues

#### **Issue 1: Sidecar Not Injected**

**Symptoms:**
- Pod has only 1 container
- Service not in mesh

**Diagnosis:**
```bash
# Check namespace label
kubectl get namespace <namespace> -o yaml | grep istio-injection

# Check pod annotations
kubectl get pod <pod-name> -o yaml | grep sidecar.istio.io/inject

# Manual injection test
istioctl kube-inject -f deployment.yaml | kubectl apply -f -
```

**Solutions:**
```bash
# Label namespace
kubectl label namespace <namespace> istio-injection=enabled

# Restart deployment
kubectl rollout restart deployment/<deployment-name>

# Verify injection
kubectl get pods -o jsonpath='{.items[*].spec.containers[*].name}'
```

#### **Issue 2: mTLS Configuration Conflicts**

**Symptoms:**
- 503 errors between services
- "upstream connect error or disconnect/reset before headers"

**Diagnosis:**
```bash
# Check mTLS status
istioctl authn tls-check <pod-name>.<namespace>

# Check PeerAuthentication
kubectl get peerauthentication -A

# Check DestinationRule
kubectl get destinationrule -A
```

**Solutions:**

```yaml
# Ensure consistent mTLS mode
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: PERMISSIVE  # Allow both during migration
```

```yaml
# Match DestinationRule
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: default
spec:
  host: "*.local"
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL
```

#### **Issue 3: Gateway Not Working**

**Symptoms:**
- Cannot access service through ingress
- 404 or connection refused

**Diagnosis:**
```bash
# Check gateway status
kubectl get gateway -A

# Check gateway pod
kubectl get pods -n istio-system -l istio=ingressgateway

# Check gateway service
kubectl get svc -n istio-system istio-ingressgateway

# Verify VirtualService binding
kubectl get virtualservice -A -o yaml | grep -A 5 gateways
```

**Solutions:**
```bash
# Restart gateway
kubectl rollout restart deployment/istio-ingressgateway -n istio-system

# Check gateway logs
kubectl logs -n istio-system -l istio=ingressgateway

# Verify port forwarding
kubectl port-forward -n istio-system svc/istio-ingressgateway 8080:80
```

#### **Issue 4: Configuration Not Applied**

**Symptoms:**
- Changes not taking effect
- Old behavior persists

**Diagnosis:**
```bash
# Validate configuration
istioctl analyze

# Check proxy sync status
istioctl proxy-status

# Get applied config
istioctl proxy-config routes <pod-name>
istioctl proxy-config clusters <pod-name>
istioctl proxy-config listeners <pod-name>
```

**Solutions:**
```bash
# Force proxy resync
kubectl delete pod <pod-name>

# Check for validation errors
kubectl describe <resource-type> <resource-name>

# Verify istiod logs
kubectl logs -n istio-system -l app=istiod
```

### 7.2 Debugging Tools

#### **istioctl Commands**

```bash
# Analyze mesh configuration
istioctl analyze

# Analyze specific namespace
istioctl analyze -n production

# Analyze file before applying
istioctl analyze -f virtualservice.yaml

# Get proxy configuration
istioctl proxy-config all <pod-name>
istioctl proxy-config bootstrap <pod-name>
istioctl proxy-config cluster <pod-name>
istioctl proxy-config endpoint <pod-name>
istioctl proxy-config listener <pod-name>
istioctl proxy-config route <pod-name>
istioctl proxy-config secret <pod-name>

# Proxy status (sync status)
istioctl proxy-status

# Describe pod with Istio details
istioctl x describe pod <pod-name>

# Check authorization policies
istioctl x authz check <pod-name>

# Dashboard access
istioctl dashboard kiali
istioctl dashboard grafana
istioctl dashboard jaeger
istioctl dashboard prometheus
istioctl dashboard envoy <pod-name>

# Version info
istioctl version

# Experimental commands
istioctl experimental wait --for=condition=ready --timeout=600s gateway <gateway-name>
```

#### **Envoy Admin Interface**

```bash
# Port forward to Envoy admin
kubectl port-forward <pod-name> 15000:15000

# Endpoints:
# http://localhost:15000/help
# http://localhost:15000/config_dump
# http://localhost:15000/clusters
# http://localhost:15000/listeners
# http://localhost:15000/stats
# http://localhost:15000/logging
```

#### **Debug Logging**

```bash
# Enable debug logging for specific component
istioctl proxy-config log <pod-name> --level rbac:debug

# Multiple components
istioctl proxy-config log <pod-name> --level rbac:debug,jwt:debug,filter:debug

# Reset to default
istioctl proxy-config log <pod-name> --level warning
```

### 7.3 Performance Tuning

**Resource Limits:**

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  components:
    pilot:
      k8s:
        resources:
          requests:
            cpu: 500m
            memory: 2Gi
          limits:
            cpu: 2000m
            memory: 4Gi
    ingressGateways:
      - name: istio-ingressgateway
        enabled: true
        k8s:
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 2000m
              memory: 1Gi
          hpaSpec:
            minReplicas: 2
            maxReplicas: 5
            metrics:
              - type: Resource
                resource:
                  name: cpu
                  targetAverageUtilization: 80
```

**Sidecar Resource Optimization:**

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  values:
    global:
      proxy:
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 2000m
            memory: 1Gi
```

**Concurrency Settings:**

```yaml
spec:
  meshConfig:
    defaultConfig:
      concurrency: 2  # Number of worker threads
```

### 7.4 Health Checks

**Liveness and Readiness:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    sidecar.istio.io/rewriteAppHTTPProbers: "true"
spec:
  containers:
    - name: app
      livenessProbe:
        httpGet:
          path: /healthz
          port: 8080
        initialDelaySeconds: 30
        periodSeconds: 10
      readinessProbe:
        httpGet:
          path: /ready
          port: 8080
        initialDelaySeconds: 5
        periodSeconds: 5
```

**Startup Probe for Slow Starting Apps:**

```yaml
startupProbe:
  httpGet:
    path: /healthz
    port: 8080
  failureThreshold: 30
  periodSeconds: 10
```

---

## 8. Best Practices

### 8.1 Security Best Practices

1. **Enable STRICT mTLS in Production**
```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
```

2. **Use Namespace-Scoped Policies**
   - Avoid mesh-wide policies unless necessary
   - Apply policies at namespace/workload level

3. **Implement Least Privilege Authorization**
```yaml
# Deny all by default
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: deny-all
spec:
  {}
---
# Explicitly allow needed access
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-specific
spec:
  action: ALLOW
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/prod/sa/frontend"]
```

4. **Regular Certificate Rotation**
   - Use default 24h certificate lifetime
   - Monitor certificate expiry

5. **Egress Control**
```yaml
spec:
  meshConfig:
    outboundTrafficPolicy:
      mode: REGISTRY_ONLY  # Block unknown external services
```

### 8.2 Traffic Management Best Practices

1. **Use Canary Deployments for Safety**
```yaml
# Start with 5% traffic
http:
  - route:
      - destination:
          host: app
          subset: v1
        weight: 95
      - destination:
          host: app
          subset: v2
        weight: 5
```

2. **Implement Circuit Breakers**
   - Prevent cascade failures
   - Set reasonable connection limits

3. **Configure Timeouts Appropriately**
```yaml
timeout: 10s
retries:
  attempts: 3
  perTryTimeout: 2s
```

4. **Use Traffic Mirroring for Testing**
   - Test new versions with real traffic
   - No impact on production

5. **Optimize Sidecar Configuration**
```yaml
# Limit egress to needed services
apiVersion: networking.istio.io/v1beta1
kind: Sidecar
spec:
  egress:
    - hosts:
        - "./*"
        - "istio-system/*"
```

### 8.3 Observability Best Practices

1. **Reduce Sampling in Production**
```yaml
tracing:
  sampling: 1.0  # 1% sampling
```

2. **Enable Access Logs Selectively**
```yaml
# Only log errors
filter:
  expression: "response.code >= 400"
```

3. **Set Up Alerts**
```yaml
# Prometheus alert example
- alert: HighErrorRate
  expr: |
    sum(rate(istio_requests_total{response_code=~"5.."}[5m])) 
    / 
    sum(rate(istio_requests_total[5m])) > 0.05
  for: 5m
  annotations:
    summary: "High error rate detected"
```

4. **Use Custom Labels for Better Insights**
```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
spec:
  metrics:
    - dimensions:
        team: request.headers["x-team"]
        version: destination.workload.name
```

### 8.4 Operational Best Practices

1. **Use GitOps for Configuration**
   - Version control all Istio configs
   - Use ArgoCD/Flux for deployment

2. **Implement Progressive Rollouts**
   - Use canary upgrades for Istio itself
   - Test in staging first

3. **Monitor Control Plane Health**
```bash
# Check istiod metrics
kubectl top pods -n istio-system
kubectl get pods -n istio-system -w
```

4. **Regular Configuration Validation**
```bash
# Run before applying
istioctl analyze -f config/

# CI/CD integration
istioctl validate -f *.yaml
```

5. **Capacity Planning**
   - Monitor resource usage
   - Scale control plane for large meshes
   - Use HPA for gateways

6. **Disaster Recovery**
   - Backup Istio configurations
   - Document rollback procedures
   - Test recovery scenarios

### 8.5 Migration Best Practices

1. **Gradual Adoption**
   - Start with non-critical services
   - Use PERMISSIVE mTLS during migration
   - Migrate namespace by namespace

2. **Testing Strategy**
```yaml
# Test with subset of traffic
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: migration-test
spec:
  http:
    - match:
        - headers:
            x-istio-test:
              exact: "true"
      route:
        - destination:
            host: new-service
    - route:
        - destination:
            host: old-service
```

3. **Monitoring During Migration**
   - Compare metrics between old/new
   - Watch for error spikes
   - Monitor latency changes

4. **Rollback Plan**
   - Keep old configuration
   - Document rollback steps
   - Practice rollback procedures

---

## Summary

This guide covers the complete theory for Istio service mesh:

✅ **Core Concepts**: Service mesh fundamentals, sidecar pattern, ambient mesh
✅ **Architecture**: Control plane (Istiod), data plane (Envoy), component interactions
✅ **Installation**: Multiple methods (CLI, Helm, Ambient), canary upgrades
✅ **Traffic Management**: VirtualServices, DestinationRules, Gateways, advanced patterns
✅ **Security**: mTLS, authentication, authorization, certificate management
✅ **Observability**: Metrics, tracing, logging, visualization
✅ **Troubleshooting**: Common issues, debugging tools, performance tuning
✅ **Best Practices**: Security, traffic management, operations, migration

This comprehensive guide provides the theoretical foundation needed for the Istio Certified Associate (ICA) certification and practical Istio implementations.
