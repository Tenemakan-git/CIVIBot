import { api } from '../api';

export interface PlatformStats {
  users: number;
  conversations: number;
  documents: number;
  aiLogs: number;
  folders: number;
}

export interface UsageDailyPoint {
  date: string;
  calls: number;
  cost: number;
  tokens: number;
}
export interface UsageByModel {
  modele: string;
  calls: number;
  cost: number;
  tokensInput: number;
  tokensOutput: number;
}
export interface UsageReport {
  window: {
    days: number;
    calls: number;
    cost: number;
    tokensInput: number;
    tokensOutput: number;
    avgDurationMs: number;
  };
  allTime: {
    calls: number;
    cost: number;
    tokensInput: number;
    tokensOutput: number;
  };
  daily: UsageDailyPoint[];
  byModel: UsageByModel[];
}

export const adminStatsService = {
  stats: (): Promise<PlatformStats> =>
    api.get('/admin/stats').then((r) => r.data),
  usage: (days: number): Promise<UsageReport> =>
    api.get('/admin/stats/usage', { params: { days } }).then((r) => r.data),
};
