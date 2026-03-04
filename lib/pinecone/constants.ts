/**
 * Pinecone constants — namespaces and configuration
 *
 * Extracted to separate file to avoid circular dependencies
 */

// Namespaces для разных типов знаний
export const NAMESPACES = {
  ANXIETY_CBT: 'anxiety_cbt',
  FAMILY: 'family',
  TRAUMA: 'trauma',
  CRISIS: 'crisis',
  GENERAL: 'general',
  MENS: 'mens',
  WOMENS: 'womens',
} as const

export type Namespace = (typeof NAMESPACES)[keyof typeof NAMESPACES]
