import { randomBytes } from 'crypto'

const LAB_LABEL = 'rapidreach.dev/lab'
const EXPIRES_ANNOTATION = 'rapidreach.dev/expires-at'

type KubeObject = Record<string, unknown>

type NamespaceList = { items?: Array<{ metadata?: { name?: string; annotations?: Record<string, string> } }> }

function kubeConfig() {
  const apiUrl = process.env.RAPIDREACH_LAB_KUBERNETES_API?.replace(/\/$/, '')
  const token = process.env.RAPIDREACH_LAB_KUBERNETES_TOKEN
  const image = process.env.RAPIDREACH_LAB_IMAGE
  if (!apiUrl || !token || !image) throw new Error('Lab Kubernetes provider is not configured')
  return { apiUrl, token, image }
}

async function kubeRequest(path: string, init: RequestInit = {}) {
  const { apiUrl, token } = kubeConfig()
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Kubernetes API ${response.status}: ${detail.slice(0, 400)}`)
  }
  if (response.status === 204) return null
  return response.json() as Promise<KubeObject>
}

export async function createLabEnvironment(input: { scenarioKey: string; ttlMinutes?: number }) {
  const { image } = kubeConfig()
  const ttl = Math.max(15, Math.min(180, input.ttlMinutes ?? 60))
  const suffix = randomBytes(5).toString('hex')
  const namespace = `rr-lab-${suffix}`
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000).toISOString()

  await kubeRequest('/api/v1/namespaces', {
    method: 'POST',
    body: JSON.stringify({
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: namespace,
        labels: { [LAB_LABEL]: 'true' },
        annotations: { [EXPIRES_ANNOTATION]: expiresAt, 'rapidreach.dev/scenario': input.scenarioKey },
      },
    }),
  })

  try {
    await kubeRequest(`/api/v1/namespaces/${namespace}/resourcequotas`, {
      method: 'POST',
      body: JSON.stringify({
        apiVersion: 'v1',
        kind: 'ResourceQuota',
        metadata: { name: 'rapidreach-lab-quota' },
        spec: { hard: { pods: '4', 'requests.cpu': '1', 'requests.memory': '1Gi', 'limits.cpu': '2', 'limits.memory': '2Gi' } },
      }),
    })
    await kubeRequest(`/api/v1/namespaces/${namespace}/limitranges`, {
      method: 'POST',
      body: JSON.stringify({
        apiVersion: 'v1',
        kind: 'LimitRange',
        metadata: { name: 'rapidreach-lab-defaults' },
        spec: { limits: [{ type: 'Container', defaultRequest: { cpu: '100m', memory: '128Mi' }, default: { cpu: '500m', memory: '512Mi' } }] },
      }),
    })
    await kubeRequest(`/apis/networking.k8s.io/v1/namespaces/${namespace}/networkpolicies`, {
      method: 'POST',
      body: JSON.stringify({
        apiVersion: 'networking.k8s.io/v1',
        kind: 'NetworkPolicy',
        metadata: { name: 'default-deny-ingress' },
        spec: { podSelector: {}, policyTypes: ['Ingress'] },
      }),
    })
    await kubeRequest(`/api/v1/namespaces/${namespace}/pods`, {
      method: 'POST',
      body: JSON.stringify({
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'workbench', labels: { app: 'rapidreach-lab' } },
        spec: {
          automountServiceAccountToken: false,
          restartPolicy: 'Never',
          securityContext: { runAsNonRoot: true, seccompProfile: { type: 'RuntimeDefault' } },
          containers: [{
            name: 'workbench',
            image,
            command: ['/bin/sh', '-c', 'sleep 10800'],
            securityContext: { allowPrivilegeEscalation: false, readOnlyRootFilesystem: true, capabilities: { drop: ['ALL'] } },
            resources: { requests: { cpu: '100m', memory: '128Mi' }, limits: { cpu: '500m', memory: '512Mi' } },
            volumeMounts: [{ name: 'tmp', mountPath: '/tmp' }],
          }],
          volumes: [{ name: 'tmp', emptyDir: { sizeLimit: '128Mi' } }],
        },
      }),
    })
  } catch (error) {
    await deleteLabEnvironment(namespace).catch(() => undefined)
    throw error
  }

  return { namespace, expiresAt, scenarioKey: input.scenarioKey }
}

export async function deleteLabEnvironment(namespace: string) {
  if (!/^rr-lab-[a-f0-9]{10}$/.test(namespace)) throw new Error('Invalid RapidReach lab namespace')
  await kubeRequest(`/api/v1/namespaces/${namespace}`, { method: 'DELETE', body: JSON.stringify({ propagationPolicy: 'Background' }) })
}

export async function cleanupExpiredLabs() {
  const payload = await kubeRequest(`/api/v1/namespaces?labelSelector=${encodeURIComponent(`${LAB_LABEL}=true`)}`) as NamespaceList
  const deleted: string[] = []
  const now = Date.now()
  for (const item of payload.items ?? []) {
    const namespace = item.metadata?.name
    const expiresAt = item.metadata?.annotations?.[EXPIRES_ANNOTATION]
    if (!namespace || !expiresAt || new Date(expiresAt).getTime() > now) continue
    await deleteLabEnvironment(namespace)
    deleted.push(namespace)
  }
  return deleted
}

export function labsConfigured() {
  return Boolean(process.env.RAPIDREACH_LAB_KUBERNETES_API && process.env.RAPIDREACH_LAB_KUBERNETES_TOKEN && process.env.RAPIDREACH_LAB_IMAGE)
}
