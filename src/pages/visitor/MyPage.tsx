import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Heart, QrCode, ChevronRight, Info, Share2, Trash2, AlertTriangle } from 'lucide-react';
import { VisitorHeader } from '../../components/VisitorHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useVisits } from '../../hooks/useVisits';
import { useFavorites } from '../../hooks/useFavorites';
import { getBooths, deleteMyData } from '../../utils/localStorage';
import type { Booth } from '../../types';

function BoothCard({ booth, meta, onShare }: { booth: Booth; meta?: string; onShare?: () => void }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow">
      <Link to={`/scan/${booth.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          {booth.images[0] ? (
            <img
              src={booth.images[0]}
              alt={booth.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1560472355-536de3962603?w=200&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">🏪</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-brand-600 font-medium mb-0.5">{booth.category}</p>
          <p className="font-semibold text-gray-900 text-sm truncate">{booth.name}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{booth.tagline}</p>
          {meta && <p className="text-xs text-gray-300 mt-1">{meta}</p>}
        </div>
      </Link>
      <div className="flex items-center gap-1 shrink-0">
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
            title="공유하기"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </div>
  );
}

export default function MyPage() {
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { visits } = useVisits();
  const { favorites } = useFavorites();
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const allBooths = getBooths();
  const boothMap = Object.fromEntries(allBooths.map((b) => [b.id, b]));

  // Deduplicated recent visits
  const seen = new Set<string>();
  const recentBooths = visits
    .filter((v) => {
      if (seen.has(v.boothId)) return false;
      seen.add(v.boothId);
      return true;
    })
    .slice(0, 20)
    .map((v) => ({
      booth: boothMap[v.boothId],
      visitedAt: v.visitedAt,
    }))
    .filter((item) => item.booth);

  const favoriteBooths = favorites
    .map((f) => ({ booth: boothMap[f.boothId], createdAt: f.createdAt }))
    .filter((item) => item.booth);

  const handleShare = async (booth: Booth) => {
    const url = `${window.location.origin}/scan/${booth.id}`;
    const shareData = { title: booth.name, text: booth.tagline, url };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast('링크가 복사됐어요!', 'success');
      } catch {
        showToast('링크 복사에 실패했어요', 'error');
      }
    }
  };

  const handleDeleteMyData = () => {
    deleteMyData();
    showToast('내 데이터가 삭제됐어요. 새 세션으로 시작할게요.', 'success');
    setShowDeleteConfirm(false);
    navigate('/scan/booth-001');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = diffMs / (1000 * 60 * 60);
    if (diffH < 1) return '방금 전';
    if (diffH < 24) return `${Math.floor(diffH)}시간 전`;
    if (diffH < 48) return '어제';
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <VisitorHeader />

      <div className="max-w-sm mx-auto px-4 pt-5 pb-20">
        {/* Page title */}
        <h1 className="text-lg font-bold text-gray-900 mb-1">내 부스</h1>
        <p className="text-xs text-gray-400 mb-5">방문 기록과 관심 부스를 모아볼 수 있어요</p>

        {/* Login banner */}
        <div
          className={`flex items-start gap-3 rounded-xl px-4 py-3.5 mb-5 ${
            isLoggedIn
              ? 'bg-brand-50 border border-brand-100'
              : 'bg-amber-50 border border-amber-100'
          }`}
        >
          <Info className={`w-4 h-4 mt-0.5 shrink-0 ${isLoggedIn ? 'text-brand-500' : 'text-amber-500'}`} />
          <p className={`text-xs leading-relaxed ${isLoggedIn ? 'text-brand-700' : 'text-amber-700'}`}>
            {isLoggedIn ? (
              <>
                <span className="font-medium">로그인 중이에요.</span> 기록이 계정에 보관돼요.
              </>
            ) : (
              <>
                <span className="font-medium">비로그인으로 사용 중이에요.</span> 이 기기에서만 기록이 유지돼요.
              </>
            )}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'recent'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            최근 본 부스
            {recentBooths.length > 0 && (
              <span className="bg-gray-200 text-gray-600 text-xs rounded-full px-1.5 py-0.5 leading-none">
                {recentBooths.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'favorites'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            관심 부스
            {favoriteBooths.length > 0 && (
              <span className="bg-gray-200 text-gray-600 text-xs rounded-full px-1.5 py-0.5 leading-none">
                {favoriteBooths.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'recent' && (
          <div>
            {recentBooths.length === 0 ? (
              <div className="text-center py-16">
                <QrCode className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">아직 방문한 부스가 없어요</p>
                <p className="text-xs text-gray-300 mt-1">QR을 스캔하면 자동으로 기록돼요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBooths.map(({ booth, visitedAt }) => (
                  <BoothCard
                    key={booth.id}
                    booth={booth}
                    meta={`방문: ${formatDate(visitedAt)}`}
                    onShare={() => handleShare(booth)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            {favoriteBooths.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">저장한 부스가 없어요</p>
                <p className="text-xs text-gray-300 mt-1">부스 페이지에서 하트를 눌러보세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteBooths.map(({ booth }) => (
                  <BoothCard key={booth.id} booth={booth} onShare={() => handleShare(booth)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Data Deletion */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-xs font-medium text-gray-500 mb-2">개인정보 관리</p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              내 데이터 삭제 요청
            </button>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 leading-relaxed">
                  방문 기록, 관심 부스, 문의 내역, 알림 등 이 기기에 저장된 모든 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없어요.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteMyData}
                  className="flex-1 text-xs font-medium text-white bg-red-500 rounded-xl py-2.5 hover:bg-red-600 transition-colors"
                >
                  삭제 확인
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
