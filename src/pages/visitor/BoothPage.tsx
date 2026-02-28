import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  Instagram,
  ShoppingBag,
  Globe,
  ChevronDown,
  Calendar,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { VisitorHeader } from '../../components/VisitorHeader';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useBooth } from '../../hooks/useBooths';
import { useFavorites } from '../../hooks/useFavorites';
import { useThreads } from '../../hooks/useThreads';
import { addVisit } from '../../utils/localStorage';

export default function BoothPage() {
  const { boothId } = useParams<{ boothId: string }>();
  const { booth } = useBooth(boothId ?? '');
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const { checkFav, toggleFav } = useFavorites();
  const { createInquiry } = useThreads();

  const [imgIndex, setImgIndex] = useState(0);
  const [fav, setFav] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (!boothId || tracked.current) return;
    tracked.current = true;
    addVisit(boothId);
  }, [boothId]);

  useEffect(() => {
    if (boothId) setFav(checkFav(boothId));
  }, [boothId, checkFav]);

  if (!booth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 text-sm">부스를 찾을 수 없어요</p>
          <Link to="/" className="mt-4 inline-block text-brand-600 text-sm font-medium">
            ← 홈으로
          </Link>
        </div>
      </div>
    );
  }

  const handleToggleFav = () => {
    if (!boothId) return;
    const next = toggleFav(boothId);
    setFav(next);
    showToast(next ? '관심 부스에 저장했어요 ✓' : '관심 부스에서 제거했어요', next ? 'success' : 'info');
  };

  const handleSendInquiry = () => {
    if (!inquiryText.trim() || !boothId) return;
    createInquiry(boothId, inquiryText.trim(), isLoggedIn);
    setInquirySent(true);
    setInquiryText('');
    showToast('문의가 전달됐어요! 답변을 기다려주세요.', 'success');
  };

  const handleCloseModal = () => {
    setShowInquiry(false);
    setInquirySent(false);
    setInquiryText('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <VisitorHeader />

      <div className="max-w-sm mx-auto pb-20">
        {/* Hero image */}
        <div className="relative overflow-hidden bg-gray-100">
          {booth.images.length > 0 ? (
            <img
              src={booth.images[imgIndex]}
              alt={booth.name}
              className="w-full aspect-[4/3] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80';
              }}
            />
          ) : (
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center">
              <span className="text-5xl">🏪</span>
            </div>
          )}

          {/* Image dots */}
          {booth.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {booth.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === imgIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Image nav */}
          {booth.images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex((p) => (p - 1 + booth.images.length) % booth.images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => setImgIndex((p) => (p + 1) % booth.images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-700 rotate-180" />
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="bg-white px-5 pt-5 pb-6">
          {/* Category badge */}
          <span className="inline-block text-xs font-medium text-brand-600 bg-brand-50 rounded-full px-2.5 py-0.5 mb-3">
            {booth.category}
          </span>

          {/* Name + Tagline */}
          <h1 className="text-xl font-bold text-gray-900 mb-1">{booth.name}</h1>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">{booth.tagline}</p>

          {/* CTA Buttons */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={handleToggleFav}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                fav
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
              {fav ? '저장됨' : '저장하기'}
            </button>
            <button
              onClick={() => setShowInquiry(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              문의하기
            </button>
          </div>

          {/* Save hint */}
          {!fav && (
            <p className="text-xs text-gray-400 text-center mb-5">
              이 부스를 저장하면 나중에 다시 쉽게 찾을 수 있어요
            </p>
          )}

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">소개</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{booth.description}</p>
          </div>

          {/* Links */}
          {(booth.links.instagram || booth.links.store || booth.links.site) && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">링크</h2>
              <div className="flex flex-wrap gap-2">
                {booth.links.instagram && (
                  <a
                    href={booth.links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg px-3 py-2"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    인스타그램
                  </a>
                )}
                {booth.links.store && (
                  <a
                    href={booth.links.store}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg px-3 py-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                    스토어
                  </a>
                )}
                {booth.links.site && (
                  <a
                    href={booth.links.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg px-3 py-2"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    홈페이지
                  </a>
                )}
              </div>
            </div>
          )}

          {/* FAQ */}
          {booth.faq.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">자주 묻는 질문</h2>
              <div className="space-y-2">
                {booth.faq.map((item, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-800 pr-4">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                          openFaq === i ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 bg-gray-50">
                        <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Events */}
          {booth.nextEvents.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-800 mb-3">다음 이벤트</h2>
              <div className="space-y-2">
                {booth.nextEvents.map((ev, i) => (
                  <div key={i} className="bg-brand-50 rounded-xl px-4 py-3">
                    <p className="text-sm font-medium text-brand-800">{ev.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-brand-600">
                        <Calendar className="w-3 h-3" /> {ev.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-brand-600">
                        <MapPin className="w-3 h-3" /> {ev.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Login nudge banner */}
        {!isLoggedIn && (
          <div className="mx-4 mt-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3.5">
            <p className="text-xs text-indigo-700 leading-relaxed">
              <span className="font-medium">로그인하면</span> 문의 답변 알림과 저장 목록을 어디서든
              확인할 수 있어요.
            </p>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      <Modal open={showInquiry} onClose={handleCloseModal} title="문의 남기기">
        {inquirySent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✉️</div>
            <p className="font-medium text-gray-900 mb-1">문의가 전달됐어요!</p>
            <p className="text-sm text-gray-500 mb-5">
              {isLoggedIn
                ? '답변이 오면 /messages에서 알려드릴게요.'
                : '답변은 /messages 탭에서 확인하세요. 로그인하면 알림을 받을 수 있어요.'}
            </p>
            <button
              onClick={handleCloseModal}
              className="w-full bg-brand-600 text-white text-sm font-medium rounded-xl py-3 hover:bg-brand-700 transition-colors"
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {isLoggedIn ? '로그인 상태로 문의합니다.' : '비로그인으로 문의합니다.'}
            </p>
            <textarea
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              placeholder={`${booth.name}에 궁금한 점을 남겨주세요.`}
              className="w-full h-32 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all placeholder:text-gray-400"
            />
            <button
              onClick={handleSendInquiry}
              disabled={!inquiryText.trim()}
              className="mt-3 w-full bg-brand-600 text-white text-sm font-medium rounded-xl py-3 hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              문의 보내기
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}
