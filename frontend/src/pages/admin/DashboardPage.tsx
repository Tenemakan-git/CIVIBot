import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, MessageSquare, FileText, FolderOpen,
  DollarSign, Activity, Cpu, Timer,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { adminStatsService } from '../../services/admin/stats.service';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const WINDOWS = [7, 14, 30];
const MODEL_COLORS = ['#f77f00', '#0b5d3b', '#7c3aed', '#d97706', '#dc2626', '#0891b2'];

const fmtUSD = (n: number) => `$${n < 1 ? n.toFixed(4) : n.toFixed(2)}`;
const fmtInt = (n: number) => n.toLocaleString('fr-FR');
const fmtTokens = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
const shortModel = (m: string) => m.replace(/^claude-/, '').replace(/-\d+$/, '');
const dayLabel = (d: string) => d.slice(5); // MM-DD

export default function DashboardPage() {
  const [days, setDays] = useState(14);

  const statsQ = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminStatsService.stats(),
  });
  const usageQ = useQuery({
    queryKey: ['admin-usage', days],
    queryFn: () => adminStatsService.usage(days),
  });

  if (statsQ.isLoading || usageQ.isLoading) return <LoadingSpinner />;

  const s = statsQ.data;
  const u = usageQ.data;

  const platform = [
    { label: 'Utilisateurs', value: fmtInt(s?.users ?? 0), icon: <Users size={20} className="text-orange-500" /> },
    { label: 'Conversations', value: fmtInt(s?.conversations ?? 0), icon: <MessageSquare size={20} className="text-green-500" /> },
    { label: 'Dossiers', value: fmtInt(s?.folders ?? 0), icon: <FolderOpen size={20} className="text-amber-500" /> },
    { label: 'Documents RAG', value: fmtInt(s?.documents ?? 0), icon: <FileText size={20} className="text-purple-500" /> },
  ];

  const ia = [
    { label: 'Coût total (all-time)', value: fmtUSD(u?.allTime.cost ?? 0), icon: <DollarSign size={20} className="text-emerald-600" /> },
    { label: 'Appels IA (all-time)', value: fmtInt(u?.allTime.calls ?? 0), icon: <Activity size={20} className="text-orange-500" /> },
    { label: `Tokens (${days} j)`, value: fmtTokens((u?.window.tokensInput ?? 0) + (u?.window.tokensOutput ?? 0)), icon: <Cpu size={20} className="text-indigo-500" /> },
    { label: `Latence moy. (${days} j)`, value: `${fmtInt(u?.window.avgDurationMs ?? 0)} ms`, icon: <Timer size={20} className="text-rose-500" /> },
  ];

  const daily = u?.daily ?? [];
  const byModel = u?.byModel ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => setDays(w)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                days === w ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {w} j
            </button>
          ))}
        </div>
      </div>

      {/* KPI plateforme */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {platform.map((c) => <KpiCard key={c.label} {...c} />)}
      </div>

      {/* KPI coûts & usage IA */}
      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Coûts &amp; usage IA
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {ia.map((c) => <KpiCard key={c.label} {...c} />)}
        </div>
      </div>

      {/* Graphes */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title={`Coût IA par jour (${days} derniers jours)`}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={daily} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#009e60" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#009e60" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="date" tickFormatter={dayLabel} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmtUSD(v)} width={64} />
              <Tooltip formatter={(v) => fmtUSD(Number(v))} labelFormatter={(l) => `Jour ${l}`} />
              <Area type="monotone" dataKey="cost" stroke="#009e60" strokeWidth={2} fill="url(#costFill)" name="Coût" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Appels IA par jour (${days} derniers jours)`}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={daily} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="date" tickFormatter={dayLabel} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={40} />
              <Tooltip labelFormatter={(l) => `Jour ${l}`} />
              <Bar dataKey="calls" fill="#f77f00" radius={[4, 4, 0, 0]} name="Appels" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Répartition du coût par modèle">
          {byModel.length === 0 || byModel.every((m) => m.cost === 0) ? (
            <EmptyChart text="Aucun coût enregistré sur la période (appels sans tarification)." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={byModel}
                  dataKey="cost"
                  nameKey="modele"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {byModel.map((_, i) => (
                    <Cell key={i} fill={MODEL_COLORS[i % MODEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [fmtUSD(Number(v)), shortModel(String(n))]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Détail par modèle">
          {byModel.length === 0 ? (
            <EmptyChart text="Aucune donnée d'usage IA pour le moment." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="pb-2">Modèle</th>
                    <th className="pb-2 text-right">Appels</th>
                    <th className="pb-2 text-right">Tokens</th>
                    <th className="pb-2 text-right">Coût</th>
                  </tr>
                </thead>
                <tbody>
                  {byModel.map((m, i) => (
                    <tr key={m.modele} className="border-t border-gray-100">
                      <td className="py-2">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: MODEL_COLORS[i % MODEL_COLORS.length] }} />
                          {shortModel(m.modele)}
                        </span>
                      </td>
                      <td className="py-2 text-right tabular-nums">{fmtInt(m.calls)}</td>
                      <td className="py-2 text-right tabular-nums text-gray-500">
                        {fmtTokens(m.tokensInput + m.tokensOutput)}
                      </td>
                      <td className="py-2 text-right tabular-nums font-medium">{fmtUSD(m.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-800">{title}</h3>
      {children}
    </section>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center px-6 text-center text-sm text-gray-400">
      {text}
    </div>
  );
}
