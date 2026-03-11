import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  Heart,
  MessageSquare,
  Users,
  QrCode,
  Navigation,
  TrendingUp,
  Clock,
  UserCheck,
  ClipboardList,
  Download,
} from 'lucide-react';
import { useThreads } from '../../hooks/useThreads';
import { useToast } from '../../contexts/ToastContext';
import { exportBoothThreadsCSV } from '../../utils/csv';
import {
  getVisits,
  getFavorites,
  getBoothLeads,
  getSurveyAggregate,
  getAnalytics,
} from '../../utils/localStorage';
import type { Visit, Favorite, Lead, Thread } from '../../types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function leadSourceLabel(source: Lead['source']): string {
  const map: Record<Lead['source'], string> = {
    bizcard: '명함 스캔',
    inquiry: '문의',
    email_info: '이메일 자료',
    survey: '설문',
    manual: '직접 입력',
  };
  return map[source] ?? source;
}

function leadStatusLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: '신규',
    CONTACTED: '연락함',
    MEETING: '미팅',
    WON: '성사',
    LOST: '실패',
  };
  return map[status] ?? status;
}

function leadStatusColor(status: string): string {
  const map: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700',
    CONTACTED: 'bg-yellow-100 text-yellow-700',
    MEETING: 'bg-purple-100 text-purple-700',
    WON: 'bg-green-100 text-green-700',
    LOST: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

function threadStatusColor(status: Thread['status']): string {
  const map: Record<Thread['status'], string> = {
    '미처리': 'bg-red-100 text-red-700',
    '처리': 'bg-green-100 text-green-700',
    '보류': 'bg-yellow-100 text-yellow-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
}

function KpiCard({ icon, label, value, sub }: KpiCardProps) {
  return (
    <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm p-4 flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

function HourlyBar({ hour, count, max }: { hour: number; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-end gap-1" title={`${hour}시: ${count}건`}>
      <div className="flex flex-col items-center gap-0.5 w-full">
        <div
          className="w-full bg-brand-500 rounded-t transition-all"
          style={{ height: `${Math.max(pct * 0.8, count > 0 ? 4 : 1)}px` }}
        />
        <span className="text-[9px] text-gray-400">{hour}</span>
      </div>
    </div>
  );
}

export function AdminBoothStatsTab({ boothId }: { boothId: string }) {
  const { threads: allThreads } = useThreads();
  const { showToast } = useToast();

  const visits = useMemo<Visit[]>(() => getVisits().filter((v) => v.boothId === boothId), [boothId]);
  const favorites = useMemo<Favorite[]>(() => getFavorites().filter((f) => f.boothId === boothId), [boothId]);
  const leads = useMemo<Lead[]>(() => getBoothLeads(boothId), [boothId]);
  const threads = useMemo<Thread[]>(() => allThreads.filter((t) => t.boothId === boothId), [allThreads, boothId]);
  const surveyAgg = useMemo(() => getSurveyAggregate(boothId), [boothId]);
  const analyticsAll = useMemo(() => getAnalytics().filter((a) => a.boothId === boothId), [boothId]);

  const totalVisits = visits.length;
  const qrVisits = visits.filter((v) => v.source === 'qr').length;
  const directVisits = visits.filter((v) => v.source === 'direct').length;
  const noSourceVisits = visits.filter((v) => !v.source).length;

  const hourlyCounts = useMemo(() => {
    const counts = Array<number>(24).fill(0);
    for (const v of visits) {
      counts[new Date(v.visitedAt).getHours()] += 1;
    }
    return counts;
  }, [visits]);
  const maxHourly = Math.max(...hourlyCounts, 1);

  const leadSources: Lead['source'][] = ['bizcard', 'inquiry', 'email_info', 'survey', 'manual'];
  const leadSourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const source of leadSources) counts[source] = 0;
    for (const lead of leads) counts[lead.source] = (counts[lead.source] ?? 0) + 1;
    return counts;
  }, [leads]);

  const pipelineStatuses = ['NEW', 'CONTACTED', 'MEETING', 'WON', 'LOST'] as const;
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const status of pipelineStatuses) counts[status] = 0;
    for (const lead of leads) {
      const status = lead.status ?? 'NEW';
      counts[status] = (counts[status] ?? 0) + 1;
    }
    return counts;
  }, [leads]);

  const analyticsTotal = analyticsAll.find((analytics) => !analytics.eventId);
  const totalScans = analyticsTotal?.scans ?? totalVisits;
  const totalFavs = analyticsTotal?.favorites ?? favorites.length;
  const totalInquiries = analyticsTotal?.inquiries ?? threads.length;

  const topInterests = useMemo(
    () => Object.entries(surveyAgg.interests).sort((a, b) => b[1] - a[1]).slice(0, 8),
    [surveyAgg],
  );
  const topPurposes = useMemo(
    () => Object.entries(surveyAgg.purposes).sort((a, b) => b[1] - a[1]).slice(0, 6),
    [surveyAgg],
  );
  const maxInterest = topInterests[0]?.[1] ?? 1;
  const maxPurpose = topPurposes[0]?.[1] ?? 1;

  const recentThreads = useMemo(
    () => [...threads].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).slice(0, 5),
    [threads],
  );
  const recentLeads = useMemo(
    () => [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [leads],
  );

  const handleExportThreads = () => {
    if (threads.length === 0) {
      showToast('내보낼 문의가 없어요.', 'error');
      return;
    }
    exportBoothThreadsCSV(boothId, threads);
    showToast('문의 CSV가 다운로드됐어요.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleExportThreads}
          className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 h-9 px-4 text-[13px] font-medium rounded-lg transition-all duration-150"
        >
          <Download className="w-4 h-4" />
          문의 CSV 내보내기
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={<BarChart2 size={18} />} label="총 방문 수" value={totalScans} sub={`QR ${qrVisits} / 직접 ${directVisits + noSourceVisits}`} />
        <KpiCard icon={<Heart size={18} />} label="관심 저장" value={totalFavs} />
        <KpiCard icon={<MessageSquare size={18} />} label="총 문의 수" value={totalInquiries} />
        <KpiCard icon={<Users size={18} />} label="총 리드 수" value={leads.length} />
      </div>

      <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <QrCode size={15} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-900">방문 유형 분석</h2>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-500" />
            <span className="text-sm text-gray-700">QR 스캔</span>
            <span className="text-sm font-bold text-gray-900">{qrVisits}건</span>
            {totalVisits > 0 && <span className="text-xs text-gray-400">({Math.round((qrVisits / totalVisits) * 100)}%)</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-300" />
            <span className="text-sm text-gray-700">직접 방문</span>
            <span className="text-sm font-bold text-gray-900">{directVisits + noSourceVisits}건</span>
            {totalVisits > 0 && <span className="text-xs text-gray-400">({Math.round(((directVisits + noSourceVisits) / totalVisits) * 100)}%)</span>}
          </div>
        </div>
        {totalVisits > 0 && (
          <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${Math.round((qrVisits / totalVisits) * 100)}%` }} />
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={15} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-900">시간대별 방문 수</h2>
          <span className="ml-auto text-xs text-gray-400">0 - 23시</span>
        </div>
        {totalVisits === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">아직 방문 기록이 없어요.</p>
        ) : (
          <div className="flex items-end gap-0.5 h-24">
            {hourlyCounts.map((count, hour) => (
              <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full">
                <HourlyBar hour={hour} count={count} max={maxHourly} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Navigation size={15} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-900">리드 소스별 분포</h2>
        </div>
        {leads.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">아직 리드가 없어요.</p>
        ) : (
          <div className="space-y-2">
            {leadSources.map((source) => {
              const count = leadSourceCounts[source] ?? 0;
              const percent = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
              return (
                <div key={source} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-gray-600 flex-shrink-0">{leadSourceLabel(source)}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-400 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs font-medium text-gray-700">{count}건</span>
                  <span className="w-8 text-right text-xs text-gray-400">{percent}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-900">리드 파이프라인</h2>
        </div>
        {leads.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">아직 리드가 없어요.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {pipelineStatuses.map((status) => (
              <div key={status} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${leadStatusColor(status)}`}>
                  {leadStatusLabel(status)}
                </span>
                <span className="text-sm font-bold text-gray-900">{pipelineCounts[status] ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList size={15} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-900">설문 집계</h2>
          <span className="ml-auto text-xs text-gray-400">총 {surveyAgg.total}건</span>
        </div>
        {surveyAgg.total === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">아직 설문 응답이 없어요.</p>
        ) : (
          <div className="space-y-5 mt-3">
            {topInterests.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">관심 분야 (복수 선택)</p>
                <div className="space-y-1.5">
                  {topInterests.map(([tag, count]) => (
                    <div key={tag} className="flex items-center gap-2">
                      <span className="w-24 text-xs text-gray-700 truncate flex-shrink-0">{tag}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.round((count / maxInterest) * 100)}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs font-medium text-gray-700">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {topPurposes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">방문 목적</p>
                <div className="space-y-1.5">
                  {topPurposes.map(([purpose, count]) => (
                    <div key={purpose} className="flex items-center gap-2">
                      <span className="w-24 text-xs text-gray-700 truncate flex-shrink-0">{purpose}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.round((count / maxPurpose) * 100)}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs font-medium text-gray-700">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
              <UserCheck size={14} className="text-green-500 flex-shrink-0" />
              <span className="text-xs text-gray-700">연락 희망</span>
              <span className="text-sm font-bold text-gray-900">{surveyAgg.wantsContact}명</span>
              {surveyAgg.total > 0 && <span className="text-xs text-gray-400">({Math.round((surveyAgg.wantsContact / surveyAgg.total) * 100)}%)</span>}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-900">최근 문의</h2>
          </div>
          <Link to="/admin/inbox" className="text-xs text-brand-600 hover:underline">
            전체 보기
          </Link>
        </div>
        {recentThreads.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">아직 문의가 없어요.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentThreads.map((thread) => {
              const lastMessage = thread.messages[thread.messages.length - 1];
              const displayName = thread.visitorName ?? thread.visitorEmail ?? (thread.visitorId === 'user' ? '로그인 사용자' : '익명');
              return (
                <li key={thread.id} className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-gray-800">{displayName}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${threadStatusColor(thread.status)}`}>
                        {thread.status}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">{formatDate(thread.lastUpdated)}</span>
                    </div>
                    {lastMessage && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {lastMessage.from === 'booth' ? '[답변] ' : ''}
                        {lastMessage.text}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-900">최근 리드</h2>
          </div>
          <Link to="/admin/leads" className="text-xs text-brand-600 hover:underline">
            전체 보기
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">아직 리드가 없어요.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentLeads.map((lead) => (
              <li key={lead.id} className="py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-800">{lead.name ?? lead.email ?? '이름 없음'}</span>
                    {lead.company && <span className="text-xs text-gray-500">{lead.company}</span>}
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-auto">
                      {leadSourceLabel(lead.source)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${leadStatusColor(lead.status ?? 'NEW')}`}>
                      {leadStatusLabel(lead.status ?? 'NEW')}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
