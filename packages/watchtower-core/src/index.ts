// Schemas
export {
  AgentSchema,
  AgentStatusEnum,
  SignalSchema,
  SeverityEnum,
  EvidenceLinkSchema,
  SnapshotSchema,
  RiskReportSchema,
  ConfidenceEnum,
  AlertSchema,
} from './schemas/index.js';

export type {
  Agent,
  AgentStatus,
  Signal,
  Severity,
  EvidenceLink,
  Snapshot,
  RiskReport,
  Confidence,
  Alert,
} from './schemas/index.js';

// Utils
export { canonicalJson, sha256Hex, sortSignals, sortEvidence } from './utils/index.js';

// Scoring
export { scoreAgent } from './scoring/index.js';

// Storage
export {
  initDb,
  initDbWithInlineMigrations,
  upsertAgent,
  getAgent,
  listAgents,
  insertSnapshot,
  getLatestSnapshots,
  insertAlerts,
  listAlerts,
  insertRiskReport,
  getLatestRiskReport,
} from './storage/index.js';

// Integrations
export {
  SolverReceiptV0Schema,
  ArtifactEntrySchema,
  normalizeReceipt,
} from './integrations/index.js';

export type {
  SolverReceiptV0,
  ArtifactEntry,
  NormalizedReceipt,
  DeliveredArtifact,
} from './integrations/index.js';

// Behavior
export {
  verifyEvidence,
  deriveBehaviorSignals,
  ingestReceipt,
} from './behavior/index.js';

export type {
  VerificationResult,
  VerificationFailure,
  VerifyOptions,
  FailureCode,
  IngestResult,
} from './behavior/index.js';
