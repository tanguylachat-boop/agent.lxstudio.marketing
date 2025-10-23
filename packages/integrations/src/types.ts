/**
 * Résultat générique de publication
 */
export interface PublishResult {
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
  response?: unknown;
}

/**
 * Métriques génériques
 */
export interface Metrics {
  views?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  profileVisits?: number;
}
