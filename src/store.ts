/** In-memory usage store (diagnostic/billing feed, not domain state). */

export type UsageStatus = "COMPUTED" | "REJECTED";

export interface UsageRecord {
  requestId: string;
  clientId: string;
  inputDigits: number;
  durationMs: number;
  status: UsageStatus;
  createdAt: string;
}

export class InMemoryStore {
  private readonly records = new Map<string, UsageRecord>();

  save(record: UsageRecord): void {
    this.records.set(record.requestId, record);
  }

  get(requestId: string): UsageRecord | undefined {
    return this.records.get(requestId);
  }

  list(filter: { clientId?: string; status?: UsageStatus; limit: number }): UsageRecord[] {
    const out: UsageRecord[] = [];
    for (const record of this.records.values()) {
      if (filter.clientId !== undefined && record.clientId !== filter.clientId) {
        continue;
      }
      if (filter.status !== undefined && record.status !== filter.status) {
        continue;
      }
      out.push(record);
      if (out.length >= filter.limit) {
        break;
      }
    }
    return out;
  }
}
