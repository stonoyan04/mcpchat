/**
 * Server configuration types
 */

export interface ServerConfig {
  port: number;
  anthropicApiKey: string | null;
  anthropicApiUrl: string;
  anthropicVersion: string;
  anthropicModel: string;
  maxTokens: number;
  nodeEnv: string;
}
