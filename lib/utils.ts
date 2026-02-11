// Map database category enum values to display names
const categoryDisplayNames: Record<string, string> = {
  'kubernetes': 'Kubernetes',
  'terraform': 'Terraform',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'GCP',
  'cicd': 'CI/CD',
  'security': 'Security',
  'observability': 'Observability',
  'platform-engineering': 'Platform Engineering',
  'docker': 'Docker',
  'monitoring': 'Monitoring',
}

export function formatCategory(category: string): string {
  return categoryDisplayNames[category] || category.charAt(0).toUpperCase() + category.slice(1)
}
