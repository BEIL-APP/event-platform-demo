import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  QrCode,
  Download,
  ArrowRight,
  UserCheck,
  ClipboardList,
  CreditCard,
  Clock,
  Lightbulb,
  MessageSquare,
  PhoneCall,
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

const ALL_HOURS = Array.from({ length: 24 }, (_, index) => index);

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function threadStatusColor(status: Thread['status']): string {
  const map: Record<Thread['status'], string> = {
    '미처리': 'bg-red-100 text-red-700',
    '처리': 'bg-green-100 text-green-700',
    '보류': 'bg-yellow-100 text-yellow-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
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

export function AdminBoothStatsTab({ boothId }: { boothId: string }) {
  const { threads: allThreads } = useThreads();
  const { showToast } = useToast();

  const visits = useMemo<Visit[]>(() => getVisits().filter((visit) => visit.boothId === boothId), [boothId]);
  const favorites = useMemo<Favorite[]>(() => getFavorites().filter((favorite) => favorite.boothId === boothId), [boothId]);
  const leads = useMemo<Lead[]>(() => getBoothLeads(boothId), [boothId]);
  const threads = useMemo<Thread[]>(() => allThreads.filter((thread) => thread.boothId === boothId), [allThreads, boothId]);
  const surveyAgg = useMemo(() => getSurveyAggregate(boothId), [boothId]);
  const analyticsAll = useMemo(() => getAnalytics().filter((analytics) => analytics.boothId === boothId), [boothId]);

  const analyticsTotal = analyticsAll.find((analytics) => !analytics.eventId);
  const qrVisits = visits.filter((visit) => visit.source === 'qr').length;
  const directVisits = visits.filter((visit) => visit.source === 'direct' || !visit.source).length;
  const totalFavorites = analyticsTotal?.favorites ?? favorites.length;
  const totalInquiries = analyticsTotal?.inquiries ?? threads.length;
  const totalVisits = analyticsTotal?.scans ?? visits.length;

  const leadsBySource = {
    bizcard: leads.filter((lead) => lead.source === 'bizcard').length,
    inquiry: leads.filter((lead) => lead.source === 'inquiry').length,
    email_info: leads.filter((lead) => lead.source === 'email_info').length,
    survey: leads.filter((lead) => lead.source === 'survey').length,
  };

  const hourlyCounts = ALL_HOURS.map((hour) => visits.filter((visit) => new Date(visit.visitedAt).getHours() === hour).length);
  const maxHourly = Math.max(...hourlyCounts, 1);
  const peakHour = hourlyCounts.indexOf(Math.max(...hourlyCounts, 0));

  const topInterests = Object.entries(surveyAgg.interests).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topPurposes = Object.entries(surveyAgg.purposes).sort((a, b) => b[1] - a[1]);
  const topInterestName = topInterests[0]?.[0];
  const maxInterest = topInterests[0]?.[1] ?? 1;

  const pendingInquiries = threads.filter((thread) => thread.status === '미처리').length;
  const newLeads = leads.filter((lead) => !lead.status || lead.status === 'NEW').length;
  const recentThreads = [...threads].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).slice(0, 5);
  const recentLeads = [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const insights = [
    pendingInquiries > 0
      ? { icon: MessageSquare, color: 'text-brand-600 bg-brand-50', text: `미처리 문의 ${pendingInquiries}건이 있어요`, action: '인박스 확인', to: '/admin/inbox' }
      : null,
    newLeads > 0
      ? { icon: PhoneCall, color: 'text-amber-600 bg-amber-50', text: `신규 리드 ${newLeads}건 - 팔로업이 필요해요`, action: '리드 목록', to: '/admin/leads' }
      : null,
    topInterestName
      ? { icon: Lightbulb, color: 'text-emerald-600 bg-emerald-50', text: `관심 분야 1위 "${topInterestName}" - 관련 자료를 부스에 추가해 보세요`, action: '설정 보기', to: `/admin/booths/${boothId}/setting` }
      : null,
    totalVisits > 0
      ? { icon: Clock, color: 'text-sky-600 bg-sky-50', text: `방문 피크 시간대 ${peakHour}시 - 이 시간에 인력을 집중 배치하세요`, action: null, to: null }
      : null,
  ].filter(Boolean) as Array<{ icon: typeof MessageSquare; color: string; text: string; action: string | null; to: string | null }>;

  const handleExportThreads = () => {
    if (threads.length === 0) {
      showToast('내보낼 문의가 없어요.', 'error');
      return;
    }
    exportBoothThreadsCSV(boothId, threads);
    showToast('문의 CSV가 다운로드됐어요.', 'success');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">부스 통계</h2>
          <p className="text-sm text-gray-500 font-medium">대시보드와 같은 기준으로 이 부스 성과를 보여줍니다</p>
        </div>
        <button
          onClick={handleExportThreads}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 h-10 rounded-lg px-4 text-[13px] font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-150"
        >
          <Download className="w-4 h-4 text-gray-400" />
          문의 CSV 내보내기
        </button>
      </div>

      {insights.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {insights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-white border border-gray-200/60 rounded-xl p-4 flex items-start gap-4 hover:shadow-card-hover transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">{item.text}</p>
                  {item.action && item.to && (
                    <Link to={item.to} className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-colors">
                      {item.action} <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'QR 방문 수', value: qrVisits.toLocaleString(), icon: <QrCode className="w-5 h-5" />, sub: 'QR 코드 스캔 기준' },
          { label: '직접 방문 수', value: directVisits.toLocaleString(), icon: <UserCheck className="w-5 h-5" />, sub: 'URL 직접 접근 기준' },
          { label: '관심 저장', value: totalFavorites.toLocaleString(), icon: <Users className="w-5 h-5" />, sub: '하트 누른 횟수' },
          { label: '총 문의', value: totalInquiries.toLocaleString(), icon: <TrendingUp className="w-5 h-5" />, sub: '스레드 생성 기준' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-gray-200/60 rounded-xl p-5 sm:p-6 hover:shadow-card-hover transition-all duration-200">
            <div className="text-gray-400 mb-4">{kpi.icon}</div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{kpi.value}</p>
            <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">{kpi.label}</p>
            <p className="text-[11px] text-gray-400 mt-2">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: '명함 스캔 리드', value: leadsBySource.bizcard, icon: <CreditCard className="w-5 h-5" /> },
          { label: '문의 동의 리드', value: leadsBySource.inquiry, icon: <UserCheck className="w-5 h-5" /> },
          { label: '이메일 수신 신청', value: leadsBySource.email_info, icon: <TrendingUp className="w-5 h-5" /> },
          { label: '설문 응답 수', value: surveyAgg.total, icon: <ClipboardList className="w-5 h-5" /> },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-gray-200/60 rounded-xl p-4 hover:shadow-card-hover transition-all duration-200">
            <div className="text-gray-400 mb-3">{item.icon}</div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{item.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        <div className="bg-white border border-gray-200/60 rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">방문 개요</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: '전체 방문', value: totalVisits, color: 'bg-brand-500', ratio: 100 },
              { label: 'QR 방문', value: qrVisits, color: 'bg-brand-400', ratio: totalVisits > 0 ? (qrVisits / totalVisits) * 100 : 0 },
              { label: '직접 방문', value: directVisits, color: 'bg-slate-400', ratio: totalVisits > 0 ? (directVisits / totalVisits) * 100 : 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-xs font-bold text-gray-500">{item.value.toLocaleString()}건</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.ratio}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200/60 rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">시간대별 방문</h2>
            <span className="bg-gray-100 text-gray-500 rounded-md h-6 px-2 text-[11px] font-semibold flex items-center ml-auto">
              전체 기간
            </span>
          </div>

          {visits.length === 0 ? (
            <div className="h-32 flex items-center justify-center">
              <p className="text-sm text-gray-400">방문 기록이 없어요</p>
            </div>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {ALL_HOURS.map((hour) => {
                const value = hourlyCounts[hour];
                const isPeak = value > 0 && value === maxHourly;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                    {value > 0 ? (
                      <div
                        className={`w-full rounded-t-sm transition-all cursor-help ${isPeak ? 'bg-brand-600' : 'bg-brand-400 hover:bg-brand-500'}`}
                        style={{ height: `${(value / maxHourly) * 100}%` }}
                        title={`${hour}시 : ${value}건`}
                      />
                    ) : (
                      <div className="w-full" style={{ height: '2px' }} />
                    )}
                    {hour % 3 === 0 && <span className="text-[10px] font-medium text-gray-400">{hour}</span>}
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-4 text-right">단위: 방문 수 / 시간대 (0~23시)</p>
        </div>
      </div>

      {surveyAgg.total > 0 && (
        <div className="bg-white border border-gray-200/60 rounded-xl p-5 sm:p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ClipboardList className="w-5 h-5 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">설문 집계</h2>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 rounded-md px-2 h-5 flex items-center ml-auto">
              총 {surveyAgg.total}건
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {topInterests.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">주요 관심 분야</p>
                <div className="space-y-4">
                  {topInterests.map(([tag, count]) => (
                    <div key={tag}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{tag}</span>
                        <span className="text-xs font-bold text-gray-500">{count}명</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${(count / maxInterest) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {topPurposes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">방문 목적 분포</p>
                  <div className="space-y-2.5">
                    {topPurposes.map(([purpose, count]) => (
                      <div key={purpose} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium">{purpose}</span>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 bg-brand-200 rounded-full overflow-hidden w-24">
                            <div className="h-full bg-brand-500" style={{ width: `${(count / surveyAgg.total) * 100}%` }} />
                          </div>
                          <span className="font-bold text-gray-600 w-8 text-right">{count}건</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-emerald-50 border border-emerald-100/50 rounded-xl p-5">
                <p className="text-xs font-semibold text-emerald-600 mb-1">연락 희망 응답자</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {surveyAgg.wantsContact}명
                  <span className="text-sm font-medium text-emerald-500 ml-2">
                    ({surveyAgg.total > 0 ? Math.round((surveyAgg.wantsContact / surveyAgg.total) * 100) : 0}%)
                  </span>
                </p>
                <p className="text-[11px] text-emerald-600/60 mt-1 font-medium italic">잠재 리드로 연결될 가능성이 높습니다</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white border border-gray-200/60 rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">최근 문의</h2>
            </div>
            <Link to="/admin/inbox" className="text-xs font-semibold text-gray-500 hover:text-brand-600 flex items-center gap-1 transition-colors">
              전체 보기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentThreads.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400 font-medium">아직 문의가 없어요</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentThreads.map((thread) => {
                const lastMessage = thread.messages[thread.messages.length - 1];
                const displayName = thread.visitorName ?? thread.visitorEmail ?? (thread.visitorId === 'user' ? '로그인 사용자' : '익명');
                return (
                  <div key={thread.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-gray-900 truncate">{displayName}</span>
                      <span className={`text-[11px] font-bold rounded-md px-1.5 py-0.5 ${threadStatusColor(thread.status)}`}>
                        {thread.status}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto shrink-0">{formatDate(thread.lastUpdated)}</span>
                    </div>
                    {lastMessage && (
                      <p className="text-xs text-gray-500 truncate">
                        {lastMessage.from === 'booth' ? '[답변] ' : ''}
                        {lastMessage.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200/60 rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">최근 리드</h2>
            </div>
            <Link to="/admin/leads" className="text-xs font-semibold text-gray-500 hover:text-brand-600 flex items-center gap-1 transition-colors">
              전체 보기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400 font-medium">아직 리드가 없어요</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentLeads.map((lead) => {
                const sourceColors = {
                  bizcard: 'bg-gray-100 text-gray-600',
                  inquiry: 'bg-blue-50 text-blue-600',
                  email_info: 'bg-emerald-50 text-emerald-600',
                  survey: 'bg-amber-50 text-amber-600',
                  manual: 'bg-purple-50 text-purple-600',
                } as const;
                const sourceLabels = {
                  bizcard: '명함',
                  inquiry: '문의',
                  email_info: '이메일',
                  survey: '설문',
                  manual: '수동',
                } as const;

                return (
                  <div key={lead.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                    <span className={`text-[11px] font-bold rounded-md px-1.5 py-0.5 shrink-0 ${sourceColors[lead.source]}`}>
                      {sourceLabels[lead.source]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{lead.name ?? lead.email ?? '이름 없음'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] font-bold rounded-md px-1.5 py-0.5 ${leadStatusColor(lead.status ?? 'NEW')}`}>
                          {leadStatusLabel(lead.status ?? 'NEW')}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(lead.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
