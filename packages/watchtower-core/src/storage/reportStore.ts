import type Database from 'better-sqlite3';
import type { RiskReport } from '../schemas/index.js';

export function insertRiskReport(db: Database.Database, report: RiskReport): void {
  db.prepare(
    `INSERT OR IGNORE INTO risk_reports (report_id, agent_id, generated_at, overall_risk, confidence, report_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    report.reportId,
    report.agentId,
    report.generatedAt,
    report.overallRisk,
    report.confidence,
    JSON.stringify(report),
  );
}

export function getLatestRiskReport(
  db: Database.Database,
  agentId: string,
): RiskReport | undefined {
  const row = db
    .prepare(
      `SELECT report_json FROM risk_reports WHERE agent_id = ? ORDER BY generated_at DESC LIMIT 1`,
    )
    .get(agentId) as { report_json: string } | undefined;

  if (!row) return undefined;
  return JSON.parse(row.report_json) as RiskReport;
}

/**
 * Bulk-fetch the latest risk report for every given agent in a single query.
 * Returns a Map keyed by agentId.
 */
export function getLatestRiskReportsByAgents(
  db: Database.Database,
  agentIds: string[],
): Map<string, RiskReport> {
  if (agentIds.length === 0) return new Map();

  const rows = db
    .prepare(
      `SELECT r.agent_id, r.report_json
       FROM risk_reports r
       INNER JOIN (
         SELECT agent_id, MAX(generated_at) AS max_gen
         FROM risk_reports
         WHERE agent_id IN (${agentIds.map(() => '?').join(',')})
         GROUP BY agent_id
       ) latest ON r.agent_id = latest.agent_id AND r.generated_at = latest.max_gen`,
    )
    .all(...agentIds) as Array<{ agent_id: string; report_json: string }>;

  const map = new Map<string, RiskReport>();
  for (const row of rows) {
    map.set(row.agent_id, JSON.parse(row.report_json) as RiskReport);
  }
  return map;
}
