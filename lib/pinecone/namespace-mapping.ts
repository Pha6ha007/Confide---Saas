// lib/pinecone/namespace-mapping.ts
// Centralized mapping: AgentType → Pinecone Namespace

import { AgentType } from '@/types'
import { NAMESPACES, type Namespace } from './constants'

/**
 * Maps each specialist agent to its corresponding Pinecone namespace
 *
 * This determines which knowledge base the agent retrieves context from.
 *
 * Examples:
 * - anxiety agent → anxiety_cbt namespace (CBT/ACT/DBT books)
 * - trauma agent → trauma namespace (van der Kolk, Herman, PTSD resources)
 * - relationships agent → family namespace (Gottman, attachment theory)
 */
export const AGENT_NAMESPACE_MAP: Record<AgentType, Namespace> = {
  anxiety: NAMESPACES.ANXIETY_CBT,
  family: NAMESPACES.FAMILY,
  trauma: NAMESPACES.TRAUMA,
  relationships: NAMESPACES.FAMILY, // Uses family namespace - attachment/relationship content overlaps
  mens: NAMESPACES.MENS,
  womens: NAMESPACES.GENERAL, // TODO: Create dedicated womens namespace when content is ready
  general: NAMESPACES.GENERAL,
}

/**
 * Get the Pinecone namespace for a given agent type
 *
 * @param agentType - The specialist agent type
 * @returns The corresponding Pinecone namespace
 *
 * @example
 * ```typescript
 * const namespace = getNamespaceForAgent('anxiety')
 * // Returns: 'anxiety_cbt'
 *
 * const chunks = await retrieveContext(query, namespace, 5)
 * ```
 */
export function getNamespaceForAgent(agentType: AgentType): Namespace {
  return AGENT_NAMESPACE_MAP[agentType] || NAMESPACES.GENERAL
}

/**
 * Get all available namespaces for RAG ingestion reference
 */
export function getAvailableNamespaces(): Namespace[] {
  return Object.values(NAMESPACES)
}

/**
 * Check if a namespace has content (based on mapping)
 */
export function isNamespaceActive(namespace: Namespace): boolean {
  // All mapped namespaces are active except womens (still using general)
  return namespace !== NAMESPACES.GENERAL ||
         Object.values(AGENT_NAMESPACE_MAP).includes(namespace)
}
