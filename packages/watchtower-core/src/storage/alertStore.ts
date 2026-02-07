import type Database from 'better-sqlite3';
import type { Alert } from '../schemas/index.js';

export function insertAlerts(db: Database.Database, alerts: Alert[]): void {
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO alerts (alert_id, agent_id, severity, type, description, evidence_json, created_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const insertMany = db.transaction((items: Alert[]) => {
    for (const alert of items) {
      stmt.run(
        alert.alertId,
        alert.agentId,
        alert.severity,
        alert.type,
        alert.description,
        JSON.stringify(alert.evidenceLinks),
        alert.createdAt,
        alert.isActive ? 1 : 0,
      );
    }
  });

  insertMany(alerts);
}

export function listAlerts(
  db: Database.Database,
  filters?: { agentId?: string; activeOnly?: boolean },
): Alert[] {
  let sql = 'SELECT * FROM alerts WHERE 1=1';
  const params: unknown[] = [];

  if (filters?.agentId) {
    sql += ' AND agent_id = ?';
    params.push(filters.agentId);
  }
  if (filters?.activeOnly) {
    sql += ' AND is_active = 1';
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params) as Array<{
    alert_id: string;
    agent_id: string;
    severity: string;
    type: string;
    description: string;
    evidence_json: string;
    created_at: number;
    is_active: number;
  }>;

  return rows.map((row) => ({
    alertId: row.alert_id,
    agentId: row.agent_id,
    severity: row.severity as Alert['severity'],
    type: row.type,
    description: row.description,
    evidenceLinks: JSON.parse(row.evidence_json),
    createdAt: row.created_at,
    isActive: row.is_active === 1,
  }));
}

/**
 * Bulk-fetch active alert counts grouped by agent_id in a single query.
 * Returns a Map keyed by agentId → count.
 */
export function getActiveAlertCountsByAgent(
  db: Database.Database,
  agentIds: string[],
): Map<string, number> {
  if (agentIds.length === 0) return new Map();

  const rows = db
    .prepare(
      `SELECT agent_id, COUNT(*) as cnt
       FROM alerts
       WHERE is_active = 1 AND agent_id IN (${agentIds.map(() => '?').join(',')})
       GROUP BY agent_id`,
    )
    .all(...agentIds) as Array<{ agent_id: string; cnt: number }>;

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.agent_id, row.cnt);
  }
  return map;
}
