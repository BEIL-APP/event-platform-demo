import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, QrCode, Download, ArrowRight, Zap } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useBooths } from '../../hooks/useBooths';
import { exportAnalyticsCSV } from '../../utils/csv';
import { useToast } from '../../contexts/ToastContext';

export default function OrganizerPreviewPage() {
  const { analytics } = useAnalytics();
  const { booths } = useBooths();
  const { showToast } = useToast();

  const totalScans = analytics.reduce((s, a) => s + a.scans, 0);
  const totalFavorites = analytics.reduce((s, a) => s + a.favorites, 0);
  const totalInquiries = analytics.reduce((s, a) => s + a.inquiries, 0);

  const boothMap = Object.fromEntries(booths.map((b) => [b.id, b]));

  // Top booths by scans
  const topBooths = [...analytics]
    .sort((a, b) => b.scans - a.scans)
    .slice(0, 5);

  const handleExportAll = () => {
    exportAnalyticsCSV(analytics);
    showToast('전체 통계 CSV가 다운로드됐어요!', 'success');
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">주최자 프리뷰</h1>
              <span className="text-xs font-medium bg-amber-100 text-amber-700 rounded-full px-2.5 py-1">
                확장 예정
              </span>
            </div>
            <p className="text-sm text-gray-400">이벤트 전체 통계와 부스 현황을 한눈에 파악하세요</p>
          </div>
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 text-brand-500" />
            전체 CSV Export
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: '총 스캔 수',
              value: totalScans.toLocaleString(),
              icon: <QrCode className="w-5 h-5" />,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              iconBg: 'bg-blue-100',
              trend: '+12% 전주 대비',
            },
            {
              label: '관심 저장',
              value: totalFavorites.toLocaleString(),
              icon: <Users className="w-5 h-5" />,
              color: 'text-pink-600',
              bg: 'bg-pink-50',
              iconBg: 'bg-pink-100',
              trend: '+8% 전주 대비',
            },
            {
              label: '총 문의',
              value: totalInquiries.toLocaleString(),
              icon: <TrendingUp className="w-5 h-5" />,
              color: 'text-brand-600',
              bg: 'bg-brand-50',
              iconBg: 'bg-brand-100',
              trend: '+22% 전주 대비',
            },
          ].map((kpi) => (
            <div key={kpi.label} className={`${kpi.bg} rounded-2xl p-5`}>
              <div className={`${kpi.iconBg} rounded-xl p-2.5 w-fit mb-4 ${kpi.color}`}>
                {kpi.icon}
              </div>
              <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">{kpi.label}</p>
              <p className="text-xs text-gray-400 mt-2">{kpi.trend}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Top Booths Table */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-semibold text-gray-800">부스별 성과 (스캔 기준)</h2>
              </div>
              <Link
                to="/admin/booths"
                className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                전체 보기 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {topBooths.map((a, i) => {
                const booth = boothMap[a.boothId];
                const maxScans = topBooths[0]?.scans ?? 1;
                return (
                  <div key={a.boothId}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {booth?.images[0] && (
                          <img src={booth.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800 truncate">{booth?.name ?? a.boothId}</p>
                          <span className="text-xs font-semibold text-gray-700 ml-2">{a.scans.toLocaleString()}</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-400 rounded-full transition-all"
                            style={{ width: `${(a.scans / maxScans) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coming Soon / Placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-800">향후 기능 로드맵</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: '시간대별 스캔 히트맵', desc: '방문 집중 시간대 분석' },
                { label: '카테고리별 관심 분포', desc: '어떤 업종이 인기 있는지' },
                { label: '문의 전환율 분석', desc: '스캔 → 문의 전환 퍼널' },
                { label: '관람객 재방문율', desc: '같은 관람객의 다중 방문 추적' },
                { label: '리얼타임 대시보드', desc: '현장 라이브 모니터링' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <span className="text-xs text-gray-300 ml-auto shrink-0">예정</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All booths stats table */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">전체 부스 통계</h2>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 transition-colors"
            >
              <Download className="w-3 h-3" /> CSV 다운로드
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-gray-500">
                  <th className="text-left px-6 py-3">부스</th>
                  <th className="text-left px-4 py-3">카테고리</th>
                  <th className="text-right px-4 py-3">스캔</th>
                  <th className="text-right px-4 py-3">관심</th>
                  <th className="text-right px-4 py-3">문의</th>
                  <th className="text-right px-6 py-3">전환율</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analytics.map((a) => {
                  const booth = boothMap[a.boothId];
                  const convRate = a.scans > 0 ? ((a.inquiries / a.scans) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={a.boothId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {booth?.images[0] && (
                              <img src={booth.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            )}
                          </div>
                          <Link
                            to={`/admin/booths/${a.boothId}`}
                            className="text-sm font-medium text-gray-900 hover:text-brand-600 transition-colors"
                          >
                            {booth?.name ?? a.boothId}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                          {booth?.category ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-medium text-gray-700">{a.scans}</td>
                      <td className="px-4 py-3.5 text-right text-sm font-medium text-pink-600">{a.favorites}</td>
                      <td className="px-4 py-3.5 text-right text-sm font-medium text-brand-600">{a.inquiries}</td>
                      <td className="px-6 py-3.5 text-right text-sm font-medium text-gray-500">{convRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
