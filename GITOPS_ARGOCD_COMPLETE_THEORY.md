# GitOps & ArgoCD - Complete Theory Guide

## Table of Contents
1. [Introduction to GitOps](#introduction-to-gitops)
2. [GitOps Principles and Practices](#gitops-principles-and-practices)
3. [Introduction to ArgoCD](#introduction-to-argocd)
4. [ArgoCD Architecture](#argocd-architecture)
5. [Installation & Configuration](#installation--configuration)
6. [Application Deployment](#application-deployment)
7. [Advanced Features](#advanced-features)
8. [Security & RBAC](#security--rbac)
9. [Multi-Cluster Management](#multi-cluster-management)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## 1. Introduction to GitOps

### 1.1 What is GitOps?

**GitOps** is a modern operational framework that uses Git as the single source of truth for declarative infrastructure and applications.

**Core Concept:**
```
Git Repository (Desired State)
        ↓
    Automation Tool (ArgoCD, Flux)
        ↓
    Kubernetes Cluster (Actual State)
        ↓
    Continuous Reconciliation
```

**Key Characteristics:**
- **Declarative**: System state described declaratively
- **Versioned**: All changes tracked in Git history
- **Automated**: Changes applied automatically
- **Auditable**: Complete audit trail in Git
- **Reversible**: Easy rollback via Git revert

### 1.2 Traditional vs GitOps Deployment

**Traditional CI/CD:**
```
Developer → Push Code → CI Build → CI Deploy → Cluster
                                        ↓
                              Direct cluster access
                              Manual kubectl apply
                              No single source of truth
```

**GitOps Approach:**
```
Developer → Push Code → CI Build → Update Git Repo
                                          ↓
                                    ArgoCD watches
                                          ↓
                                    Auto sync to cluster
                                          ↓
                                    Git = Source of Truth
```

### 1.3 Benefits of GitOps

**1. Increased Productivity**
- Faster deployment cycles
- Automated synchronization
- Self-service deployments

**2. Enhanced Security**
- No direct cluster access needed
- Credentials managed centrally
- Audit trail for all changes

**3. Improved Reliability**
- Easy rollback (Git revert)
- Consistent environments
- Drift detection and correction

**4. Better Compliance**
- Complete change history
- Code review for infrastructure
- Traceable deployments

**5. Disaster Recovery**
- Cluster state in Git
- Quick cluster reconstruction
- Infrastructure as Code

### 1.4 GitOps Principles (CNCF Definition)

**1. Declarative**
- System state expressed declaratively (YAML, JSON)
- Entire system described in Git

**2. Versioned and Immutable**
- Git as version control
- Complete history
- Immutable commits

**3. Pulled Automatically**
- Agents pull desired state from Git
- No push access to cluster needed

**4. Continuously Reconciled**
- Automated agents ensure actual state matches desired state
- Self-healing systems

### 1.5 GitOps Workflow

```
┌─────────────────────────────────────────────────────┐
│  1. Developer commits to Git                        │
│     (Application code + K8s manifests)              │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│  2. CI Pipeline triggers                            │
│     - Build container image                         │
│     - Run tests                                     │
│     - Push image to registry                        │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│  3. Update Git repo with new image tag              │
│     (Automatically or manually)                     │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│  4. ArgoCD detects change                           │
│     (Polls Git repo every 3 minutes)                │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│  5. ArgoCD syncs to cluster                         │
│     (Applies changes to Kubernetes)                 │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│  6. Health check and monitoring                     │
│     (Verify deployment success)                     │
└─────────────────────────────────────────────────────┘
```

---

## 2. GitOps Principles and Practices

### 2.1 Repository Structure

**Mono-Repo vs Multi-Repo:**

**Option 1: Mono-Repo (Single Repository)**
```
gitops-repo/
├── apps/
│   ├── frontend/
│   │   ├── base/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── kustomization.yaml
│   │   ├── overlays/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── production/
│   ├── backend/
│   └── database/
├── infrastructure/
│   ├── ingress/
│   ├── monitoring/
│   └── cert-manager/
└── clusters/
    ├── dev-cluster/
    ├── staging-cluster/
    └── prod-cluster/
```

**Option 2: Multi-Repo (Separate Repositories)**
```
app-repo/               # Application code
├── src/
├── Dockerfile
└── .github/

manifest-repo/          # Kubernetes manifests
├── apps/
│   └── myapp/
├── base/
└── overlays/

infrastructure-repo/    # Infrastructure config
├── ingress/
├── monitoring/
└── cert-manager/
```

**Pros & Cons:**

| Aspect | Mono-Repo | Multi-Repo |
|--------|-----------|------------|
| Simplicity | ✅ Easier to manage | ❌ More repos to track |
| Access Control | ❌ Same permissions | ✅ Fine-grained access |
| Versioning | ❌ Single version | ✅ Independent versions |
| CI/CD | ✅ Simpler pipelines | ❌ More complex |
| Scale | ❌ Gets large | ✅ Better separation |

### 2.2 Environment Management

**1. Branch-Based Environments:**
```
main → production
staging → staging environment
develop → development environment
```

**2. Directory-Based Environments:**
```
environments/
├── dev/
│   └── values.yaml
├── staging/
│   └── values.yaml
└── production/
    └── values.yaml
```

**3. Repository-Based Environments:**
```
dev-config-repo → dev cluster
staging-config-repo → staging cluster
prod-config-repo → prod cluster
```

### 2.3 Secrets Management

**Challenge**: Secrets shouldn't be stored in Git plaintext.

**Solutions:**

**1. Sealed Secrets (Bitnami)**
```bash
# Encrypt secret
kubeseal --format=yaml < secret.yaml > sealed-secret.yaml

# Commit sealed secret to Git
git add sealed-secret.yaml
git commit -m "Add encrypted secret"

# SealedSecret controller decrypts in cluster
```

**2. External Secrets Operator**
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: db-secret
  data:
    - secretKey: password
      remoteRef:
        key: prod/database
        property: password
```

**3. HashiCorp Vault Integration**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  annotations:
    vault.hashicorp.com/role: "myapp"
    vault.hashicorp.com/agent-inject: "true"
    vault.hashicorp.com/agent-inject-secret-db: "secret/data/database"
```

**4. SOPS (Mozilla)**
```bash
# Encrypt file
sops --encrypt secret.yaml > secret.enc.yaml

# Decrypt during deployment (ArgoCD plugin)
sops --decrypt secret.enc.yaml | kubectl apply -f -
```

### 2.4 Image Update Strategies

**1. Manual Update**
```bash
# Update image tag in Git
sed -i 's/image: myapp:v1.0/image: myapp:v1.1/' deployment.yaml
git commit -am "Update to v1.1"
git push
```

**2. Automated with ArgoCD Image Updater**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  annotations:
    argocd-image-updater.argoproj.io/image-list: myapp=myregistry/myapp
    argocd-image-updater.argoproj.io/myapp.update-strategy: latest
```

**3. Kustomize with Image Transformer**
```yaml
# kustomization.yaml
images:
  - name: myapp
    newName: myregistry/myapp
    newTag: v1.2.0
```

### 2.5 Progressive Delivery

**Canary Deployments:**
```yaml
# Argo Rollouts
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: myapp
spec:
  replicas: 10
  strategy:
    canary:
      steps:
        - setWeight: 10      # 10% traffic to new version
        - pause: {duration: 1m}
        - setWeight: 50      # 50% traffic
        - pause: {duration: 2m}
        - setWeight: 100     # Full rollout
```

**Blue-Green Deployments:**
```yaml
spec:
  strategy:
    blueGreen:
      activeService: myapp-active
      previewService: myapp-preview
      autoPromotionEnabled: false
```

---

## 3. Introduction to ArgoCD

### 3.1 What is ArgoCD?

**ArgoCD** is a declarative, GitOps continuous delivery tool for Kubernetes.

**Key Features:**
- ✅ Automated deployment
- ✅ GitOps workflow
- ✅ Multi-cluster management
- ✅ SSO integration
- ✅ Web UI + CLI
- ✅ Health assessment
- ✅ Rollback capabilities
- ✅ Sync hooks
- ✅ RBAC support

### 3.2 ArgoCD vs Other GitOps Tools

| Feature | ArgoCD | Flux CD | Jenkins X |
|---------|--------|---------|-----------|
| **UI** | ✅ Rich Web UI | ❌ Limited | ✅ Good UI |
| **Multi-cluster** | ✅ Native | ✅ Via config | ✅ Yes |
| **Helm Support** | ✅ Excellent | ✅ Good | ✅ Yes |
| **Kustomize** | ✅ Built-in | ✅ Built-in | ✅ Yes |
| **RBAC** | ✅ Advanced | ⚠️ Basic | ✅ Good |
| **SSO** | ✅ Multiple | ⚠️ Limited | ✅ Yes |
| **Sync Waves** | ✅ Yes | ❌ No | ⚠️ Limited |
| **Health Checks** | ✅ Advanced | ⚠️ Basic | ✅ Good |
| **Complexity** | Medium | Low | High |

### 3.3 ArgoCD Core Concepts

**1. Application**
- Kubernetes resource representing deployed app
- Links Git repo to cluster

**2. Project**
- Logical grouping of applications
- RBAC boundary

**3. Repository**
- Git repo containing manifests
- Helm chart repo

**4. Cluster**
- Kubernetes cluster managed by ArgoCD
- Can manage multiple clusters

**5. Sync**
- Process of applying Git state to cluster

**6. Health**
- Status of deployed resources

**7. Sync Status**
- Comparison between Git and cluster state

---

## 4. ArgoCD Architecture

### 4.1 Component Overview

```
┌─────────────────────────────────────────────────────┐
│              ArgoCD Architecture                    │
└─────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐
│  Git Repo    │────────▶│ ArgoCD Server│
│  (Manifests) │         │  (API + UI)  │
└──────────────┘         └───────┬──────┘
                                 │
                ┌────────────────┼────────────────┐
                ↓                ↓                ↓
        ┌───────────┐    ┌──────────┐    ┌──────────┐
        │Application│    │Repository│    │  Dex     │
        │Controller │    │ Server   │    │ (SSO)    │
        └─────┬─────┘    └──────────┘    └──────────┘
              │
              ↓
    ┌──────────────────┐
    │ Kubernetes API   │
    │    Server        │
    └──────────────────┘
              │
              ↓
    ┌──────────────────┐
    │  Target Cluster  │
    │   (Workloads)    │
    └──────────────────┘
```

### 4.2 Core Components

#### **1. API Server**

**Responsibilities:**
- REST/gRPC API for ArgoCD operations
- Serves Web UI
- Handles authentication
- Manages application lifecycle
- Proxy to Kubernetes API

**Functions:**
- Application management (CRUD)
- Sync operations
- Cluster management
- Repository management
- RBAC enforcement

#### **2. Repository Server**

**Responsibilities:**
- Clones Git repositories
- Generates Kubernetes manifests
- Handles Helm chart rendering
- Kustomize build execution
- Caches generated manifests

**Supported Tools:**
- Raw Kubernetes YAML
- Kustomize
- Helm
- Jsonnet
- Custom config management plugins

**Caching:**
```
Git Repo → Repository Server → Cache
                ↓
        Generated Manifests
```

#### **3. Application Controller**

**Responsibilities:**
- Monitors applications continuously
- Compares desired state (Git) vs actual state (cluster)
- Detects OutOfSync status
- Triggers auto-sync if enabled
- Executes sync operations
- Monitors resource health

**Reconciliation Loop:**
```
┌─────────────────────────────────────┐
│ 1. Fetch desired state from Git    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 2. Fetch actual state from cluster │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 3. Compare states                   │
└──────────────┬──────────────────────┘
               ↓
        ┌──────┴──────┐
        │  In Sync?   │
        └──────┬──────┘
          No   │   Yes
    ┌──────────┴─────────┐
    ↓                    ↓
┌────────┐         ┌──────────┐
│ Sync   │         │ Monitor  │
│ (Apply)│         │ Health   │
└────────┘         └──────────┘
```

#### **4. Dex (Optional)**

**Responsibilities:**
- SSO integration
- OIDC provider
- LDAP/SAML connector

**Supported Providers:**
- GitHub
- GitLab
- Google
- Okta
- Azure AD
- LDAP
- SAML

#### **5. Redis**

**Responsibilities:**
- Caching layer
- Session storage
- Temporary data

### 4.3 Data Flow

```
User Request (Web UI/CLI)
        ↓
   API Server (Authentication)
        ↓
   Application Controller
        ↓
   Repository Server
        ↓
   Git Repository (Clone)
        ↓
   Generate Manifests (Helm/Kustomize)
        ↓
   Compare with Cluster State
        ↓
   Apply Changes (if OutOfSync)
        ↓
   Monitor Health
        ↓
   Report Status to UI
```

### 4.4 High Availability Setup

```yaml
# Multiple replicas for HA
apiVersion: apps/v1
kind: Deployment
metadata:
  name: argocd-server
spec:
  replicas: 3  # HA setup
  
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: argocd-repo-server
spec:
  replicas: 2
  
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: argocd-application-controller
spec:
  replicas: 1  # Use sharding for multiple controllers
```

**Application Controller Sharding:**
```yaml
env:
  - name: ARGOCD_CONTROLLER_REPLICAS
    value: "3"
  - name: ARGOCD_CONTROLLER_SHARD
    value: "0"  # 0, 1, 2 for 3 shards
```

---

## 5. Installation & Configuration

### 5.1 Installation Methods

#### **Method 1: Non-HA Installation**

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access at https://localhost:8080
# Username: admin
# Password: (from above command)
```

#### **Method 2: HA Installation**

```bash
kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/ha/install.yaml
```

#### **Method 3: Helm Installation**

```bash
# Add repo
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Install with custom values
helm install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --values values.yaml
```

**Custom values.yaml:**
```yaml
server:
  replicas: 3
  ingress:
    enabled: true
    hosts:
      - argocd.example.com
    tls:
      - secretName: argocd-tls
        hosts:
          - argocd.example.com

controller:
  replicas: 1

repoServer:
  replicas: 2

redis:
  enabled: true

configs:
  cm:
    url: https://argocd.example.com
    dex.config: |
      connectors:
        - type: github
          id: github
          name: GitHub
          config:
            clientID: $github-client-id
            clientSecret: $github-client-secret
```

### 5.2 CLI Installation

```bash
# macOS
brew install argocd

# Linux
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd
sudo mv argocd /usr/local/bin/

# Login
argocd login localhost:8080 \
  --username admin \
  --password <initial-password> \
  --insecure

# Change password
argocd account update-password
```

### 5.3 Configuration

#### **ConfigMap: argocd-cm**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  namespace: argocd
data:
  # Git repository timeout
  timeout.reconciliation: 180s
  
  # Resource tracking method
  application.resourceTrackingMethod: annotation
  
  # Repository credentials
  repositories: |
    - url: https://github.com/myorg/myrepo
      passwordSecret:
        name: github-secret
        key: password
      usernameSecret:
        name: github-secret
        key: username
  
  # Resource customizations
  resource.customizations: |
    admissionregistration.k8s.io/MutatingWebhookConfiguration:
      ignoreDifferences: |
        jsonPointers:
        - /webhooks/0/clientConfig/caBundle
  
  # SSO configuration
  url: https://argocd.example.com
  dex.config: |
    connectors:
      - type: github
        id: github
        name: GitHub
        config:
          clientID: $dex.github.clientId
          clientSecret: $dex.github.clientSecret
          orgs:
            - name: myorg
```

#### **ConfigMap: argocd-rbac-cm**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.default: role:readonly
  
  policy.csv: |
    # DevOps team has full access
    g, devops-team, role:admin
    
    # Developers can manage apps in dev project
    p, role:developer, applications, *, dev/*, allow
    p, role:developer, applications, sync, dev/*, allow
    g, developers-group, role:developer
    
    # QA team read-only on staging
    p, role:qa, applications, get, staging/*, allow
    g, qa-team, role:qa
```

### 5.4 Adding Git Repositories

**Via CLI:**
```bash
# HTTPS with credentials
argocd repo add https://github.com/myorg/myrepo \
  --username myuser \
  --password mytoken

# SSH
argocd repo add git@github.com:myorg/myrepo.git \
  --ssh-private-key-path ~/.ssh/id_rsa

# Helm repo
argocd repo add https://charts.helm.sh/stable \
  --type helm \
  --name stable
```

**Via YAML:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: private-repo
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  type: git
  url: https://github.com/myorg/private-repo
  password: github-token
  username: myuser
```

### 5.5 Adding Clusters

```bash
# List contexts
kubectl config get-contexts

# Add cluster
argocd cluster add cluster-context-name

# Verify
argocd cluster list

# Add with custom name
argocd cluster add cluster-context-name \
  --name production-cluster
```

**In-cluster vs External:**
- **In-cluster**: ArgoCD manages cluster it's installed in (automatic)
- **External**: ArgoCD manages remote clusters (requires adding)

---

## 6. Application Deployment

### 6.1 Creating Applications

#### **Method 1: CLI**

```bash
argocd app create myapp \
  --repo https://github.com/myorg/myrepo \
  --path k8s/overlays/production \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace production \
  --sync-policy automated \
  --auto-prune \
  --self-heal
```

#### **Method 2: Web UI**

1. Click "New App"
2. Fill in details:
   - Application Name
   - Project
   - Sync Policy
   - Repository URL
   - Path
   - Cluster URL
   - Namespace

#### **Method 3: YAML Manifest**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  
  source:
    repoURL: https://github.com/myorg/myrepo
    targetRevision: main
    path: k8s/overlays/production
    
    # For Helm
    # chart: mychart
    # helm:
    #   releaseName: myapp
    #   values: |
    #     replicas: 3
    
    # For Kustomize
    # kustomize:
    #   namePrefix: prod-
  
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  
  syncPolicy:
    automated:
      prune: true      # Delete resources not in Git
      selfHeal: true   # Sync when cluster state changes
      allowEmpty: false
    
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas
```

### 6.2 Sync Strategies

**1. Manual Sync**
```yaml
syncPolicy: {}  # No automated sync
```

**2. Automated Sync**
```yaml
syncPolicy:
  automated:
    prune: false
    selfHeal: false
```

**3. Auto-Prune**
```yaml
syncPolicy:
  automated:
    prune: true  # Delete resources not in Git
```

**4. Self-Heal**
```yaml
syncPolicy:
  automated:
    selfHeal: true  # Revert manual changes
```

### 6.3 Sync Phases and Waves

**Sync Phases:**
1. **PreSync**: Run before sync (e.g., database backup)
2. **Sync**: Apply resources
3. **PostSync**: Run after sync (e.g., notifications)
4. **SyncFail**: Run if sync fails
5. **Skip**: Skip resource

**Sync Waves (Ordering):**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: myapp
  annotations:
    argocd.argoproj.io/sync-wave: "0"  # Deploy first
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
  annotations:
    argocd.argoproj.io/sync-wave: "1"  # Deploy second
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  annotations:
    argocd.argoproj.io/sync-wave: "2"  # Deploy third
```

**Negative waves deploy before positive:**
```
-5 → -4 → ... → 0 → 1 → 2 → 3 → ...
```

### 6.4 Resource Hooks

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: database-migration
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
        - name: migrate
          image: myapp/migrator:v1
          command: ["./migrate.sh"]
      restartPolicy: Never
```

**Hook Types:**
- `PreSync`: Before sync
- `Sync`: During sync (normal resources)
- `PostSync`: After sync
- `SyncFail`: On sync failure
- `Skip`: Skip sync

**Delete Policies:**
- `HookSucceeded`: Delete after successful execution
- `HookFailed`: Delete after failed execution
- `BeforeHookCreation`: Delete before new hook creation

### 6.5 Health Assessment

**Built-in Health Checks:**
- Deployments: All replicas available
- StatefulSets: All replicas ready
- DaemonSets: All desired pods running
- Services: Endpoints exist
- Ingress: Rules configured
- PVCs: Bound

**Custom Health Checks:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
data:
  resource.customizations.health.argoproj.io_Rollout: |
    hs = {}
    if obj.status ~= nil then
      if obj.status.phase == "Healthy" then
        hs.status = "Healthy"
        hs.message = "Rollout is healthy"
        return hs
      end
    end
    hs.status = "Progressing"
    hs.message = "Waiting for rollout"
    return hs
```

### 6.6 Kustomize Integration

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
spec:
  source:
    repoURL: https://github.com/myorg/myrepo
    targetRevision: main
    path: k8s/overlays/production
    kustomize:
      namePrefix: prod-
      nameSuffix: -v1
      commonLabels:
        environment: production
      commonAnnotations:
        managed-by: argocd
      images:
        - name: myapp
          newName: myregistry/myapp
          newTag: v2.0.0
      replicas:
        - name: myapp
          count: 5
```

### 6.7 Helm Integration

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
spec:
  source:
    repoURL: https://charts.myorg.com
    chart: myapp
    targetRevision: 1.2.3
    helm:
      releaseName: myapp-production
      
      # values.yaml override
      values: |
        replicaCount: 3
        image:
          repository: myregistry/myapp
          tag: v2.0.0
        service:
          type: LoadBalancer
      
      # values file from Git
      valueFiles:
        - values-production.yaml
      
      # Parameters
      parameters:
        - name: service.type
          value: LoadBalancer
        - name: replicaCount
          value: "5"
      
      # Skip CRDs
      skipCrds: false
      
      # Version
      version: v3  # Helm version
```

---

## 7. Advanced Features

### 7.1 App of Apps Pattern

**Concept**: One ArgoCD application manages other ArgoCD applications.

```yaml
# apps/root-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/gitops
    targetRevision: main
    path: apps
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

```yaml
# apps/frontend-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: frontend
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/gitops
    path: manifests/frontend
  destination:
    server: https://kubernetes.default.svc
    namespace: production
```

**Structure:**
```
gitops-repo/
├── apps/
│   ├── frontend-app.yaml
│   ├── backend-app.yaml
│   └── database-app.yaml
└── manifests/
    ├── frontend/
    ├── backend/
    └── database/
```

### 7.2 ApplicationSet

**Purpose**: Generate multiple Applications from templates.

**Generator Types:**
1. List
2. Cluster
3. Git
4. Matrix
5. Merge
6. SCM Provider

**Example 1: List Generator**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: multi-env-app
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - env: dev
            cluster: https://dev-cluster
          - env: staging
            cluster: https://staging-cluster
          - env: prod
            cluster: https://prod-cluster
  
  template:
    metadata:
      name: 'myapp-{{env}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/myorg/myapp
        targetRevision: main
        path: 'k8s/overlays/{{env}}'
      destination:
        server: '{{cluster}}'
        namespace: 'myapp-{{env}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

**Example 2: Git Generator**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: git-directories
spec:
  generators:
    - git:
        repoURL: https://github.com/myorg/apps
        revision: main
        directories:
          - path: apps/*
  
  template:
    metadata:
      name: '{{path.basename}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/myorg/apps
        targetRevision: main
        path: '{{path}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{path.basename}}'
```

**Example 3: Cluster Generator**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: multi-cluster-app
spec:
  generators:
    - clusters:
        selector:
          matchLabels:
            environment: production
  
  template:
    metadata:
      name: 'myapp-{{name}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/myorg/myapp
        path: k8s
      destination:
        server: '{{server}}'
        namespace: production
```

### 7.3 Projects

**Purpose**: Group applications, define RBAC boundaries.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: production
  namespace: argocd
spec:
  description: Production applications
  
  # Git repos allowed
  sourceRepos:
    - 'https://github.com/myorg/*'
    - 'https://charts.helm.sh/stable'
  
  # Destination clusters allowed
  destinations:
    - namespace: 'prod-*'
      server: https://kubernetes.default.svc
    - namespace: production
      server: https://prod-cluster
  
  # Cluster resource whitelist
  clusterResourceWhitelist:
    - group: ''
      kind: Namespace
    - group: 'rbac.authorization.k8s.io'
      kind: ClusterRole
  
  # Namespace resource blacklist
  namespaceResourceBlacklist:
    - group: ''
      kind: ResourceQuota
  
  # Allowed resource kinds
  namespaceResourceWhitelist:
    - group: 'apps'
      kind: Deployment
    - group: ''
      kind: Service
  
  # Orphaned resources warning
  orphanedResources:
    warn: true
  
  # Roles for RBAC
  roles:
    - name: developer
      description: Developers access
      policies:
        - p, proj:production:developer, applications, get, production/*, allow
        - p, proj:production:developer, applications, sync, production/*, allow
      groups:
        - dev-team
```

### 7.4 Sync Windows

**Purpose**: Control when syncs can occur.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: production
spec:
  syncWindows:
    # Allow syncs during business hours
    - kind: allow
      schedule: '0 9-17 * * 1-5'  # 9 AM - 5 PM, Mon-Fri
      duration: 8h
      applications:
        - '*'
      manualSync: true
    
    # Block syncs on weekends
    - kind: deny
      schedule: '0 0 * * 0,6'  # Weekends
      duration: 24h
      applications:
        - 'critical-*'
      manualSync: false  # Block manual syncs too
    
    # Maintenance window
    - kind: allow
      schedule: '0 2 * * 0'  # Sunday 2 AM
      duration: 4h
      applications:
        - 'maintenance-*'
```

### 7.5 Notifications

**Install Notifications Controller:**
```bash
kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

**Configuration:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
data:
  # Slack service
  service.slack: |
    token: $slack-token
  
  # Email service
  service.email.gmail: |
    username: $email-username
    password: $email-password
    host: smtp.gmail.com
    port: 587
  
  # Templates
  template.app-deployed: |
    message: |
      Application {{.app.metadata.name}} has been deployed.
      Sync Status: {{.app.status.sync.status}}
    slack:
      attachments: |
        [{
          "title": "{{.app.metadata.name}}",
          "color": "good",
          "fields": [{
            "title": "Sync Status",
            "value": "{{.app.status.sync.status}}",
            "short": true
          }]
        }]
  
  # Triggers
  trigger.on-deployed: |
    - when: app.status.operationState.phase in ['Succeeded']
      send: [app-deployed]
  
  trigger.on-health-degraded: |
    - when: app.status.health.status == 'Degraded'
      send: [app-health-degraded]
```

**Subscribe Application:**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  annotations:
    notifications.argoproj.io/subscribe.on-deployed.slack: my-channel
    notifications.argoproj.io/subscribe.on-health-degraded.email: team@example.com
```

### 7.6 Resource Tracking

**Methods:**

**1. Label (Default)**
```yaml
metadata:
  labels:
    app.kubernetes.io/instance: myapp
```

**2. Annotation**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
data:
  application.resourceTrackingMethod: annotation
```

**3. Annotation + Label**
```yaml
application.resourceTrackingMethod: annotation+label
```

### 7.7 Diff Customization

**Ignore Differences:**

```yaml
spec:
  ignoreDifferences:
    # Ignore specific field
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas
    
    # Ignore managed fields
    - group: '*'
      kind: '*'
      managedFieldsManagers:
        - kube-controller-manager
    
    # JQ path expression
    - group: apps
      kind: Deployment
      jqPathExpressions:
        - .spec.template.spec.containers[].image
```

**Resource Exclusions:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
data:
  resource.exclusions: |
    - apiGroups:
        - "*"
      kinds:
        - "PodMetrics"
      clusters:
        - "*"
```

---

## 8. Security & RBAC

### 8.1 Authentication

**Local Users:**
```bash
# Create user
argocd account update-password --account developer

# Disable admin
kubectl patch configmap argocd-cm -n argocd \
  --patch '{"data": {"admin.enabled": "false"}}'
```

**SSO with Dex:**

```yaml
# GitHub OAuth
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
data:
  url: https://argocd.example.com
  dex.config: |
    connectors:
      - type: github
        id: github
        name: GitHub
        config:
          clientID: $dex.github.clientId
          clientSecret: $dex.github.clientSecret
          orgs:
            - name: myorg
              teams:
                - devops
                - developers
```

**OIDC (Direct):**
```yaml
data:
  oidc.config: |
    name: Okta
    issuer: https://dev-123456.okta.com
    clientID: xxxxxx
    clientSecret: $oidc.okta.clientSecret
    requestedScopes: ["openid", "profile", "email", "groups"]
```

### 8.2 RBAC Configuration

**Built-in Roles:**
- `role:readonly`: Read-only access
- `role:admin`: Full access

**Custom Policy:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
data:
  # Default policy
  policy.default: role:readonly
  
  # Custom policies
  policy.csv: |
    # Format: p, subject, resource, action, object, effect
    
    # Admin role
    p, role:admin, applications, *, */*, allow
    p, role:admin, clusters, *, *, allow
    p, role:admin, repositories, *, *, allow
    p, role:admin, projects, *, *, allow
    
    # Developer role
    p, role:developer, applications, get, */*, allow
    p, role:developer, applications, create, dev/*, allow
    p, role:developer, applications, update, dev/*, allow
    p, role:developer, applications, delete, dev/*, allow
    p, role:developer, applications, sync, dev/*, allow
    p, role:developer, applications, override, dev/*, allow
    p, role:developer, applications, action/*, dev/*, allow
    
    # QA role
    p, role:qa, applications, get, staging/*, allow
    p, role:qa, applications, sync, staging/*, allow
    
    # Production operator (read + sync only)
    p, role:prod-operator, applications, get, prod/*, allow
    p, role:prod-operator, applications, sync, prod/*, allow
    
    # Group mappings
    g, devops-team, role:admin
    g, dev-team, role:developer
    g, qa-team, role:qa
    g, ops-team, role:prod-operator
    
    # User mappings
    g, john@example.com, role:admin
    g, jane@example.com, role:developer
```

**Resources:**
- `applications`
- `clusters`
- `repositories`
- `projects`
- `accounts`
- `certificates`
- `gpgkeys`

**Actions:**
- `get`
- `create`
- `update`
- `delete`
- `sync`
- `override`
- `action/*`

### 8.3 Project-Level RBAC

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: myproject
spec:
  roles:
    - name: developer
      description: Developer access to myproject
      policies:
        - p, proj:myproject:developer, applications, *, myproject/*, allow
      groups:
        - myorg:dev-team
      
    - name: viewer
      description: Read-only access
      policies:
        - p, proj:myproject:viewer, applications, get, myproject/*, allow
      groups:
        - myorg:qa-team
```

### 8.4 Secret Management

**Bitnami Sealed Secrets:**

```bash
# Install sealed secrets
kubectl apply -f \
  https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.18.0/controller.yaml

# Create sealed secret
echo -n mypassword | kubectl create secret generic mysecret \
  --dry-run=client --from-file=password=/dev/stdin -o yaml | \
  kubeseal -o yaml > sealed-secret.yaml

# Commit to Git
git add sealed-secret.yaml
```

**Vault Plugin:**

```yaml
# Install argocd-vault-plugin
# In argocd-cm ConfigMap
configManagementPlugins: |
  - name: argocd-vault-plugin
    generate:
      command: ["argocd-vault-plugin"]
      args: ["generate", "./"]

# Use in Application
spec:
  source:
    plugin:
      name: argocd-vault-plugin
```

---

## 9. Multi-Cluster Management

### 9.1 Adding Clusters

```bash
# Add cluster from kubeconfig
argocd cluster add production-cluster

# Add with service account
argocd cluster add production-cluster \
  --service-account argocd-manager

# Add with labels
argocd cluster add production-cluster \
  --label environment=production \
  --label region=us-east
```

### 9.2 Cluster Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: prod-cluster-secret
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: cluster
type: Opaque
stringData:
  name: production-cluster
  server: https://prod-k8s-api.example.com
  config: |
    {
      "bearerToken": "xxxxx",
      "tlsClientConfig": {
        "insecure": false,
        "caData": "LS0tLS..."
      }
    }
```

### 9.3 Multi-Cluster Strategies

**Strategy 1: Hub and Spoke**
```
ArgoCD (Hub Cluster)
    ↓
    ├── Dev Cluster
    ├── Staging Cluster
    └── Prod Cluster
```

**Strategy 2: Cluster per Environment**
```
Dev ArgoCD → Dev Cluster
Staging ArgoCD → Staging Cluster
Prod ArgoCD → Prod Cluster
```

**Strategy 3: Regional Deployment**
```
ArgoCD (Central)
    ↓
    ├── US-East Cluster
    ├── US-West Cluster
    ├── EU-West Cluster
    └── APAC Cluster
```

### 9.4 ApplicationSet for Multi-Cluster

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: multi-cluster-deployment
spec:
  generators:
    - clusters:
        selector:
          matchLabels:
            environment: production
  
  template:
    metadata:
      name: 'myapp-{{name}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/myorg/myapp
        path: k8s/production
      destination:
        server: '{{server}}'
        namespace: production
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

---

## 10. Best Practices

### 10.1 Repository Structure

**Recommended Structure:**
```
gitops-repo/
├── apps/                          # ArgoCD Applications
│   ├── base/
│   │   └── application.yaml
│   └── overlays/
│       ├── dev/
│       ├── staging/
│       └── production/
├── infrastructure/                # Infrastructure components
│   ├── ingress-nginx/
│   ├── cert-manager/
│   ├── prometheus/
│   └── argocd/
├── projects/                      # ArgoCD Projects
│   ├── dev-project.yaml
│   ├── staging-project.yaml
│   └── prod-project.yaml
└── clusters/                      # Cluster configs
    ├── dev/
    ├── staging/
    └── production/
```

### 10.2 Sync Best Practices

1. **Use Automated Sync with Caution**
   - Enable for non-production first
   - Test thoroughly before prod

2. **Enable Prune Carefully**
   - Risk of deleting resources
   - Use for immutable infrastructure

3. **Use Sync Waves**
   - Order critical resources
   - Databases before apps

4. **Implement Health Checks**
   - Custom health for CRDs
   - Monitor sync status

5. **Use Hooks for Migrations**
   - PreSync for backups
   - PostSync for cleanup

### 10.3 Security Best Practices

1. **Least Privilege Access**
   - Project-based RBAC
   - Restrict repository access

2. **Secrets Management**
   - Never commit plaintext secrets
   - Use Sealed Secrets or Vault

3. **SSO Integration**
   - Disable local admin in production
   - Use organization SSO

4. **Network Policies**
   - Restrict ArgoCD access
   - Limit egress traffic

5. **Regular Updates**
   - Keep ArgoCD updated
   - Monitor security advisories

### 10.4 Performance Optimization

1. **Repository Server Scaling**
```yaml
repoServer:
  replicas: 3
  resources:
    limits:
      cpu: 1000m
      memory: 2Gi
```

2. **Controller Sharding**
```yaml
controller:
  sharding:
    enabled: true
    replicas: 3
```

3. **Resource Caching**
```yaml
timeout.reconciliation: 180s  # Reduce for faster updates
```

4. **Selective Sync**
   - Use sync windows
   - Avoid unnecessary syncs

### 10.5 Monitoring and Observability

**Metrics:**
```bash
# ArgoCD exposes Prometheus metrics
kubectl port-forward svc/argocd-metrics -n argocd 8082:8082

# View metrics
curl http://localhost:8082/metrics
```

**Key Metrics:**
- `argocd_app_sync_total`: Total sync operations
- `argocd_app_health_status`: Application health
- `argocd_cluster_api_resources`: Cluster resources
- `argocd_git_request_duration_seconds`: Git operation latency

**Grafana Dashboards:**
```bash
# Install Grafana
kubectl apply -f grafana.yaml

# Import ArgoCD dashboard (ID: 14584)
```

### 10.6 Disaster Recovery

1. **Backup Strategy**
```bash
# Export all applications
argocd app list -o yaml > apps-backup.yaml

# Export all projects
kubectl get appproject -n argocd -o yaml > projects-backup.yaml

# Backup clusters
kubectl get secrets -n argocd -l argocd.argoproj.io/secret-type=cluster -o yaml > clusters-backup.yaml
```

2. **Restore Process**
```bash
# Reinstall ArgoCD
kubectl apply -n argocd -f install.yaml

# Restore applications
kubectl apply -f apps-backup.yaml

# Restore projects
kubectl apply -f projects-backup.yaml
```

3. **Git as Backup**
   - All config in Git
   - Easy to recreate clusters
   - Version control

---

## 11. Troubleshooting

### 11.1 Common Issues

#### **Issue 1: Application OutOfSync**

**Symptoms:**
- Application shows OutOfSync
- Expected changes not applied

**Diagnosis:**
```bash
# Check diff
argocd app diff myapp

# View application details
argocd app get myapp

# Check sync status
kubectl get application myapp -n argocd -o yaml
```

**Solutions:**
```bash
# Manual sync
argocd app sync myapp

# Hard refresh
argocd app get myapp --hard-refresh

# Check ignored differences
kubectl get application myapp -n argocd -o jsonpath='{.spec.ignoreDifferences}'
```

#### **Issue 2: Sync Fails**

**Symptoms:**
- Sync operation fails
- Resources not created

**Diagnosis:**
```bash
# Check sync result
argocd app get myapp

# View logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller

# Check resource status
kubectl get events -n target-namespace
```

**Solutions:**
- Fix manifest syntax errors
- Check RBAC permissions
- Verify cluster connectivity
- Review sync hooks

#### **Issue 3: Health Check Failing**

**Symptoms:**
- Application shows Degraded
- All resources deployed

**Diagnosis:**
```bash
# Check resource health
argocd app get myapp --show-operation

# Custom health check
kubectl get configmap argocd-cm -n argocd -o yaml | grep health
```

**Solutions:**
```yaml
# Add custom health check
resource.customizations.health.MyCustomResource: |
  hs = {}
  hs.status = "Healthy"
  hs.message = "Resource is healthy"
  return hs
```

#### **Issue 4: Repository Connection Issues**

**Symptoms:**
- Cannot connect to Git repo
- "repository not found" error

**Diagnosis:**
```bash
# List repositories
argocd repo list

# Test connection
argocd repo get https://github.com/myorg/myrepo
```

**Solutions:**
```bash
# Update credentials
argocd repo add https://github.com/myorg/myrepo \
  --username myuser \
  --password newtoken \
  --upsert

# For SSH
argocd repo add git@github.com:myorg/myrepo.git \
  --ssh-private-key-path ~/.ssh/new_key
```

### 11.2 Debugging Commands

```bash
# Application status
argocd app get <app-name>
argocd app history <app-name>
argocd app manifests <app-name>
argocd app diff <app-name>

# Logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-repo-server

# Events
kubectl get events -n argocd --sort-by='.lastTimestamp'

# Resource details
kubectl describe application <app-name> -n argocd

# Sync operations
argocd app sync <app-name> --dry-run
argocd app sync <app-name> --prune --force

# Refresh cache
argocd app get <app-name> --refresh
argocd app get <app-name> --hard-refresh
```

### 11.3 Performance Troubleshooting

**Slow Syncs:**
```bash
# Check repo-server performance
kubectl top pod -n argocd -l app.kubernetes.io/name=argocd-repo-server

# Increase replicas
kubectl scale deployment argocd-repo-server -n argocd --replicas=3

# Check Git fetch time
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-repo-server | grep "git fetch"
```

**High Memory Usage:**
```bash
# Check controller memory
kubectl top pod -n argocd -l app.kubernetes.io/name=argocd-application-controller

# Reduce reconciliation frequency
kubectl patch configmap argocd-cm -n argocd \
  --patch '{"data": {"timeout.reconciliation": "300s"}}'
```

---

## Summary

This comprehensive guide covers GitOps principles and ArgoCD implementation:

✅ **GitOps Fundamentals**: Principles, workflows, benefits, repository structures
✅ **ArgoCD Architecture**: Components, data flow, HA setup
✅ **Installation**: Multiple methods, CLI setup, configuration
✅ **Application Management**: Creating apps, sync strategies, hooks, health checks
✅ **Advanced Features**: App of Apps, ApplicationSet, Projects, notifications
✅ **Security**: Authentication, RBAC, SSO, secrets management
✅ **Multi-Cluster**: Cluster management, deployment strategies
✅ **Best Practices**: Repository structure, security, performance, monitoring
✅ **Troubleshooting**: Common issues, debugging, performance tuning

This guide provides the theoretical foundation and practical knowledge needed for implementing GitOps with ArgoCD in production environments.
