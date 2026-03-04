import { Pinecone } from '@pinecone-database/pinecone'

// Lazy initialization - создаём клиент только при первом обращении
let _pinecone: Pinecone | null = null

function getPineconeClient() {
  if (!_pinecone) {
    _pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    })
  }
  return _pinecone
}

// Имя индекса из env
export const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'confide-knowledge'

// Получить индекс
export function getPineconeIndex() {
  const pinecone = getPineconeClient()
  return pinecone.index(INDEX_NAME)
}

// Re-export constants to maintain backward compatibility
export { NAMESPACES, type Namespace } from './constants'

// Re-export namespace utilities for convenience
export { getNamespaceForAgent, AGENT_NAMESPACE_MAP, getAvailableNamespaces } from './namespace-mapping'
