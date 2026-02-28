import { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Heart, MessageSquare, ExternalLink, FileDown } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { AdminLayout } from '../../components/AdminLayout';
import { useBooth } from '../../hooks/useBooths';
import { useBoothAnalytics } from '../../hooks/useAnalytics';
import { useThreads } from '../../hooks/useThreads';
import { useToast } from '../../contexts/ToastContext';
import { exportBoothThreadsCSV, exportAnalyticsCSV } from '../../utils/csv';
import { getAnalytics } from '../../utils/localStorage';

export default function AdminBoothDetailPage() {
  const { boothId } = useParams<{ boothId: string }>();
  const { booth } = useBooth(boothId ?? '');
  const { data: stats, refresh: refreshStats } = useBoothAnalytics(boothId ?? '');
  const { threads } = useThreads();
  const { showToast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  const boothUrl = `${window.location.origin}/scan/${boothId}`;

  const handleDownloadQR = () => {
    const canvas = document.getElementById('booth-qr-canvas') as HTMLCanvasElement;
    if (!canvas) {
      showToast('QR 다운로드에 실패했어요', 'error');
      return;
    }
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${booth?.name ?? boothId}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('QR 코드가 다운로드됐어요!', 'success');
  };

  const handleExportCSV = () => {
    const all = getAnalytics();
    exportAnalyticsCSV(all.filter((a) => a.boothId === boothId));
    showToast('CSV 파일이 다운로드됐어요!', 'success');
  };

  const handleExportThreadsCSV = () => {
    exportBoothThreadsCSV(boothId ?? '', threads);
    showToast('문의 데이터가 다운로드됐어요!', 'success');
  };

  if (!booth) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-gray-500">부스를 찾을 수 없어요</p>
          <Link to="/admin/booths" className="text-brand-600 text-sm mt-2 inline-block">
            ← 목록으로
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      label: '총 스캔',
      value: stats.scans,
      icon: <Eye className="w-5 h-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      desc: 'QR 스캔 횟수',
    },
    {
      label: '관심 저장',
      value: stats.favorites,
      icon: <Heart className="w-5 h-5" />,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      iconBg: 'bg-pink-100',
      desc: '하트 누른 관람객',
    },
    {
      label: '문의 건수',
      value: stats.inquiries,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      iconBg: 'bg-brand-100',
      desc: '접수된 문의',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/admin/booths"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{booth.name}</h1>
              <span className="text-xs font-medium text-brand-600 bg-brand-50 rounded-full px-2.5 py-1">
                {booth.category}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{booth.tagline}</p>
          </div>
          <Link
            to={`/scan/${boothId}`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors border border-gray-200 rounded-xl px-3 py-2 hover:border-brand-300"
          >
            <ExternalLink className="w-4 h-4" />
            관람객 보기
          </Link>
        </div>

        {/* Two column: QR + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* QR Code Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-800">QR 코드</h2>
              <button
                onClick={handleDownloadQR}
                className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg px-3 py-1.5 transition-colors font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                PNG 다운로드
              </button>
            </div>

            {/* QR */}
            <div ref={qrRef} className="flex justify-center mb-4">
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm inline-block">
                <QRCodeCanvas
                  id="booth-qr-canvas"
                  value={boothUrl}
                  size={160}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">스캔 URL</p>
              <p className="text-xs font-mono text-gray-600 bg-gray-50 rounded-lg px-3 py-2 break-all">
                {boothUrl}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-800">통계</h2>
              <button
                onClick={() => { refreshStats(); showToast('통계를 새로고침했어요', 'info'); }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                새로고침
              </button>
            </div>
            <div className="space-y-3">
              {statCards.map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3.5 flex items-center gap-3`}>
                  <div className={`${s.iconBg} rounded-lg p-2 ${s.color}`}>
                    {s.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">{s.desc}</p>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                  </div>
                  <p className="text-xs font-medium text-gray-600">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">데이터 내보내기</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <FileDown className="w-4 h-4 text-brand-500" />
              통계 CSV Export
            </button>
            <button
              onClick={handleExportThreadsCSV}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <FileDown className="w-4 h-4 text-emerald-500" />
              문의 CSV Export
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            UTF-8 BOM 형식으로 내보내져 Excel에서 바로 열 수 있어요.
          </p>
        </div>

        {/* Booth Preview Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">부스 정보</h2>
          <div className="space-y-3">
            {booth.images.length > 0 && (
              <div className="flex gap-2">
                {booth.images.map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">FAQ 항목</p>
                <p className="text-sm font-medium text-gray-700">{booth.faq.length}개</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">링크</p>
                <p className="text-sm font-medium text-gray-700">
                  {[booth.links.instagram, booth.links.store, booth.links.site].filter(Boolean).length}개 연결
                </p>
              </div>
              {booth.nextEvents.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">다음 이벤트</p>
                  <p className="text-sm font-medium text-gray-700">
                    {booth.nextEvents[0].title} · {booth.nextEvents[0].date}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
