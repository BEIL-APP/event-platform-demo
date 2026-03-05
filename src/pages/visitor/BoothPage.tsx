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
  Mail,
  FileDown,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  LogIn,
  Share2,
} from 'lucide-react';
import { VisitorHeader } from '../../components/VisitorHeader';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useBooth } from '../../hooks/useBooths';
import { useFavorites } from '../../hooks/useFavorites';
import { useThreads } from '../../hooks/useThreads';
import {
  addVisit,
  getBoothPolicy,
  getBoothAttachments,
  getBoothSurveys,
  saveLead,
  saveSurvey,
  getGuestId,
  checkRateLimit,
  incrementRateLimit,
} from '../../utils/localStorage';
import type { BoothPolicy, Attachment, SurveyResponse } from '../../types';

const INTEREST_CHIPS = ['구매검토', '파트너십', 'B2B 납품', '정보수집', '기업복지', 'ESG', '스타트업', '대기업'];
const PURPOSE_OPTIONS = [
  { value: '구매검토', label: '구매 / 계약 검토' },
  { value: '정보수집', label: '제품 정보 수집' },
  { value: '파트너십', label: '파트너십 / 협력' },
  { value: '견적', label: '견적 요청' },
];

function isPolicyActive(policy: BoothPolicy): boolean {
  const now = new Date();
  return new Date(policy.startAt) <= now && now <= new Date(policy.endAt);
}

function isPolicyExpired(policy: BoothPolicy): boolean {
  return new Date(policy.endAt) < new Date();
}

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['xlsx', 'xls', 'csv'].includes(ext ?? '')) return '📊';
  if (['pptx', 'ppt'].includes(ext ?? '')) return '📋';
  return '📎';
}

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
  const [showLoginNudge, setShowLoginNudge] = useState(false);

  // Inquiry modal
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryConsent, setInquiryConsent] = useState(false);
  const [inquiryConsentMarketing, setInquiryConsentMarketing] = useState(false);
  const [inquiryAbuseCheck, setInquiryAbuseCheck] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryRateLimited, setInquiryRateLimited] = useState(false);

  // Email info modal
  const [showEmailInfo, setShowEmailInfo] = useState(false);
  const [emailInfoAddr, setEmailInfoAddr] = useState('');
  const [emailInfoConsent, setEmailInfoConsent] = useState(false);
  const [emailInfoSent, setEmailInfoSent] = useState(false);

  // Survey modal
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyInterests, setSurveyInterests] = useState<string[]>([]);
  const [surveyPurpose, setSurveyPurpose] = useState('');
  const [surveyWantsContact, setSurveyWantsContact] = useState(false);
  const [surveySent, setSurveySent] = useState(false);

  // Policy & data
  const [policy, setPolicy] = useState<BoothPolicy | undefined>();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [surveyDone, setSurveyDone] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (!boothId || tracked.current) return;
    tracked.current = true;
    addVisit(boothId);
  }, [boothId]);

  useEffect(() => {
    if (boothId) {
      setFav(checkFav(boothId));
      setPolicy(getBoothPolicy(boothId));
      setAttachments(getBoothAttachments(boothId));
      const surveys = getBoothSurveys(boothId);
      const guestId = getGuestId();
      setSurveyDone(surveys.some((s) => s.visitorId === guestId));
    }
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

  const expired = policy ? isPolicyExpired(policy) : false;
  const active = policy ? isPolicyActive(policy) : true;
  const inquiryAllowed = !expired || (policy?.allowInquiryAfterEnd ?? true);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleToggleFav = () => {
    if (!boothId) return;
    if (!isLoggedIn) {
      setShowLoginNudge(true);
      setTimeout(() => setShowLoginNudge(false), 4000);
    }
    const next = toggleFav(boothId);
    setFav(next);
    showToast(next ? '관심 부스에 저장했어요 ✓' : '관심 부스에서 제거했어요', next ? 'success' : 'info');
  };

  const handleSendInquiry = () => {
    if (!inquiryText.trim() || !boothId) return;
    if (!isLoggedIn && (!inquiryEmail.includes('@') || !inquiryAbuseCheck)) return;

    const guestId = getGuestId();
    const rateLimitKey = `${guestId}:${boothId}:inquiry`;
    if (checkRateLimit(rateLimitKey, 3)) {
      setInquiryRateLimited(true);
      showToast('하루 3건까지 문의할 수 있어요. 내일 다시 시도해주세요.', 'error');
      return;
    }

    createInquiry(boothId, inquiryText.trim(), isLoggedIn, {
      email: isLoggedIn ? undefined : inquiryEmail,
      consent: inquiryConsent,
      consentMarketing: inquiryConsentMarketing,
    });
    incrementRateLimit(rateLimitKey, 24 * 60 * 60 * 1000);
    setInquirySent(true);
    setInquiryText('');
    showToast('문의가 전달됐어요!', 'success');
  };

  const handleCloseInquiry = () => {
    setShowInquiry(false);
    setInquirySent(false);
    setInquiryRateLimited(false);
    setInquiryText('');
    setInquiryEmail('');
    setInquiryConsent(false);
    setInquiryConsentMarketing(false);
    setInquiryAbuseCheck(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: booth?.name ?? '', text: booth?.tagline ?? '', url };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled — ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast('링크가 복사됐어요!', 'success');
      } catch {
        showToast('링크 복사에 실패했어요', 'error');
      }
    }
  };

  const handleSendEmailInfo = () => {
    if (!emailInfoAddr.includes('@') || !emailInfoConsent || !boothId) return;
    saveLead({
      id: `lead-${Date.now()}`,
      boothId,
      source: 'email_info',
      email: emailInfoAddr,
      memo: '이메일 정보 수신 신청',
      consent: true,
      createdAt: new Date().toISOString(),
    });
    setEmailInfoSent(true);
    showToast('자료 발송 완료! 잠시 후 메일을 확인해주세요.', 'success');
  };

  const handleCloseEmailInfo = () => {
    setShowEmailInfo(false);
    setEmailInfoSent(false);
    setEmailInfoAddr('');
    setEmailInfoConsent(false);
  };

  const handleSendSurvey = () => {
    if (!boothId) return;
    const guestId = getGuestId();
    const response: SurveyResponse = {
      id: `survey-${Date.now()}`,
      boothId,
      visitorId: guestId,
      answers: {
        interests: surveyInterests,
        purpose: surveyPurpose || undefined,
        wantsContact: surveyWantsContact,
      },
      createdAt: new Date().toISOString(),
    };
    saveSurvey(response);

    if (surveyWantsContact) {
      saveLead({
        id: `lead-survey-${Date.now()}`,
        boothId,
        source: 'survey',
        memo: `관심분야: ${surveyInterests.join(', ')} | 목적: ${surveyPurpose}`,
        consent: surveyWantsContact,
        createdAt: new Date().toISOString(),
      });
    }

    setSurveySent(true);
    setSurveyDone(true);
    showToast('설문 완료! 소중한 의견 감사해요.', 'success');
  };

  const handleCloseSurvey = () => {
    setShowSurvey(false);
    setSurveySent(false);
  };

  const inquiryFormValid = isLoggedIn
    ? inquiryText.trim().length > 0
    : inquiryText.trim().length > 0 && inquiryEmail.includes('@') && inquiryAbuseCheck;

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
            <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center">
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
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
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
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-all duration-150"
              >
                <ArrowLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => setImgIndex((p) => (p + 1) % booth.images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-all duration-150"
              >
                <ArrowLeft className="w-4 h-4 text-gray-700 rotate-180" />
              </button>
            </>
          )}

          {/* Expired overlay badge */}
          {expired && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gray-900/80 text-white text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5" />
              운영 종료
            </div>
          )}

          {/* Active badge */}
          {!expired && active && policy && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              운영중
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white px-4 pt-4 pb-6">
          {/* Category + policy */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 rounded-md px-2 h-5">
              {booth.category}
            </span>
            {expired && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-md px-2 h-5">
                <AlertCircle className="w-3 h-3" />
                {new Date(policy!.endAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 종료
              </span>
            )}
          </div>

          {/* Name + Tagline */}
          <h1 className="text-lg font-semibold text-gray-900 mb-1">{booth.name}</h1>
          <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">{booth.tagline}</p>

          {/* Login nudge (temporary banner) */}
          {showLoginNudge && (
            <div className="mb-4 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2.5 flex items-center gap-2">
              <LogIn className="w-4 h-4 text-brand-500 shrink-0" />
              <p className="text-xs text-brand-700">
                <Link to="/auth" className="font-semibold underline">로그인</Link>하면 기기가 바뀌어도 저장 목록이 유지돼요
              </p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleToggleFav}
              className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all duration-150 ${
                fav
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
              {fav ? '저장됨' : '저장하기'}
            </button>
            <button
              onClick={() => setShowInquiry(true)}
              disabled={!inquiryAllowed}
              title={!inquiryAllowed ? '운영 종료 후 문의가 닫혔습니다' : undefined}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-500 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageSquare className="w-4 h-4" />
              {!inquiryAllowed ? '문의 마감' : '문의하기'}
            </button>
            <button
              onClick={handleShare}
              className="w-12 flex items-center justify-center h-10 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-150"
              title="공유하기"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Email info CTA */}
          <button
            onClick={() => setShowEmailInfo(true)}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-all duration-150 mb-6"
          >
            <Mail className="w-4 h-4" />
            이메일로 자료 받기
          </button>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-[13px] font-semibold text-gray-900 mb-3">소개</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{booth.description}</p>
          </div>

          {/* Attachments / Brochure */}
          {attachments.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[13px] font-semibold text-gray-900 mb-3">첨부 자료</h2>
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5"
                  >
                    <span className="text-xl">{getFileIcon(att.filename)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{att.filename}</p>
                      {att.size && <p className="text-xs text-gray-400">{att.size}</p>}
                    </div>
                    <button
                      onClick={() => showToast('다운로드 기능은 실제 연동 시 제공됩니다 (데모)', 'info')}
                      className="flex items-center gap-1 text-xs text-brand-600 font-medium hover:text-brand-700 transition-all duration-150"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      다운로드
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(booth.links.instagram || booth.links.store || booth.links.site) && (
            <div className="mb-6">
              <h2 className="text-[13px] font-semibold text-gray-900 mb-3">링크</h2>
              <div className="flex flex-wrap gap-2">
                {booth.links.instagram && (
                  <a
                    href={booth.links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all duration-150 rounded-lg px-3 py-2"
                  >
                    <Instagram className="w-3.5 h-3.5 text-gray-500" />
                    인스타그램
                  </a>
                )}
                {booth.links.store && (
                  <a
                    href={booth.links.store}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all duration-150 rounded-lg px-3 py-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-gray-500" />
                    스토어
                  </a>
                )}
                {booth.links.site && (
                  <a
                    href={booth.links.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all duration-150 rounded-lg px-3 py-2"
                  >
                    <Globe className="w-3.5 h-3.5 text-gray-500" />
                    홈페이지
                  </a>
                )}
              </div>
            </div>
          )}

          {/* FAQ */}
          {booth.faq.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[13px] font-semibold text-gray-900 mb-3">자주 묻는 질문</h2>
              <div className="space-y-2">
                {booth.faq.map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-all duration-150"
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
            <div className="mb-6">
              <h2 className="text-[13px] font-semibold text-gray-900 mb-3">다음 이벤트</h2>
              <div className="space-y-2">
                {booth.nextEvents.map((ev, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">{ev.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" /> {ev.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" /> {ev.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Survey CTA */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <ClipboardList className="w-4 h-4 text-gray-500" />
              <span className="text-[13px] font-semibold text-gray-900">1분 설문에 참여해보세요</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              관심 분야와 방문 목적을 알려주시면 더 좋은 정보를 드릴 수 있어요
            </p>
            <button
              onClick={() => setShowSurvey(true)}
              disabled={surveyDone}
              className="w-full bg-brand-600 text-white text-sm font-medium rounded-lg h-10 hover:bg-brand-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {surveyDone ? '설문 완료 ✓' : '설문 참여하기'}
            </button>
          </div>
        </div>

        {/* Login nudge banner (bottom) */}
        {!isLoggedIn && (
          <div className="mx-4 mt-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-medium">로그인하면</span> 문의 답변 알림과 저장 목록을 어디서든
              확인할 수 있어요.{' '}
              <Link to="/auth" className="underline font-medium text-brand-600">지금 가입하기 →</Link>
            </p>
          </div>
        )}
      </div>

      {/* ─── Inquiry Modal ─────────────────────────────────────────────────────── */}
      <Modal open={showInquiry} onClose={handleCloseInquiry} title="문의 남기기">
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
              onClick={handleCloseInquiry}
              className="w-full bg-brand-600 text-white text-sm font-medium rounded-lg h-10 hover:bg-brand-500 transition-all duration-150"
            >
              확인
            </button>
          </div>
        ) : (
          <>
            {isLoggedIn ? (
              <p className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3">
                로그인 상태로 문의합니다. 답변 알림을 받을 수 있어요.
              </p>
            ) : (
              <p className="text-xs text-gray-500 mb-3">
                비로그인 문의 — 이메일 주소를 남기면 답변을 받을 수 있어요.
              </p>
            )}

            <textarea
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              placeholder={`${booth.name}에 궁금한 점을 남겨주세요.`}
              className="w-full h-28 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-3 resize-none outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all placeholder:text-gray-400 mb-3"
            />

            {/* Rate limit warning */}
            {inquiryRateLimited && (
              <div className="mb-3 bg-red-50 border border-red-100 rounded-lg px-3 py-3">
                <p className="text-xs text-red-700">
                  하루 3건까지 문의할 수 있어요. 내일 다시 시도해주세요.
                </p>
              </div>
            )}

            {/* Non-login: email + checks */}
            {!isLoggedIn && (
              <div className="space-y-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">이메일 주소</label>
                  <input
                    type="email"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="답변을 받을 이메일"
                    className="w-full h-10 text-sm bg-white border border-gray-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all placeholder:text-gray-400"
                  />
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inquiryAbuseCheck}
                    onChange={(e) => setInquiryAbuseCheck(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-brand-600"
                  />
                  <span className="text-xs text-gray-500">
                    부적절한 문의(스팸, 광고 등)는 이용이 제한될 수 있음을 확인했습니다
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inquiryConsent}
                    onChange={(e) => setInquiryConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-brand-600"
                  />
                  <span className="text-xs text-gray-500">
                    (선택) 운영자에게 이메일 제공에 동의합니다
                    <span className="text-gray-400 block">동의 시 운영자가 리드로 저장합니다</span>
                  </span>
                </label>

                {inquiryConsent && (
                  <label className="flex items-start gap-2 cursor-pointer pl-6">
                    <input
                      type="checkbox"
                      checked={inquiryConsentMarketing}
                      onChange={(e) => setInquiryConsentMarketing(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-brand-600"
                    />
                    <span className="text-xs text-gray-400">
                      (선택) 마케팅 정보 수신에 동의합니다
                      <span className="block">언제든 철회할 수 있어요</span>
                    </span>
                  </label>
                )}
              </div>
            )}

            <button
              onClick={handleSendInquiry}
              disabled={!inquiryFormValid}
              className="w-full bg-brand-600 text-white text-sm font-medium rounded-lg h-10 hover:bg-brand-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              문의 보내기
            </button>

            {/* Public Q&A placeholder */}
            {/* TODO: "공개 질문" 기능 — 이번 MVP 제외, 향후 추가 예정 */}
          </>
        )}
      </Modal>

      {/* ─── Email Info Modal ──────────────────────────────────────────────────── */}
      <Modal open={showEmailInfo} onClose={handleCloseEmailInfo} title="이메일로 자료 받기">
        {emailInfoSent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="font-medium text-gray-900 mb-1">발송 완료!</p>
            <p className="text-sm text-gray-500 mb-5">
              {emailInfoAddr}으로 카탈로그를 보내드렸어요. (데모: 실제 발송 없음)
            </p>
            <button
              onClick={handleCloseEmailInfo}
              className="w-full bg-brand-600 text-white text-sm font-medium rounded-lg h-10 hover:bg-brand-500 transition-all duration-150"
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {booth.name}의 카탈로그와 제품 소개 자료를 이메일로 보내드릴게요.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">이메일 주소</label>
              <input
                type="email"
                value={emailInfoAddr}
                onChange={(e) => setEmailInfoAddr(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-10 text-sm bg-white border border-gray-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all placeholder:text-gray-400"
              />
            </div>
            <label className="flex items-start gap-2 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={emailInfoConsent}
                onChange={(e) => setEmailInfoConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-brand-600"
              />
              <span className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">[필수]</span> 이메일 수신 및
                부스 운영자에게 정보 제공에 동의합니다
              </span>
            </label>
            <button
              onClick={handleSendEmailInfo}
              disabled={!emailInfoAddr.includes('@') || !emailInfoConsent}
              className="w-full bg-brand-600 text-white text-sm font-medium rounded-lg h-10 hover:bg-brand-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              자료 받기
            </button>
          </>
        )}
      </Modal>

      {/* ─── Survey Modal ─────────────────────────────────────────────────────── */}
      <Modal open={showSurvey} onClose={handleCloseSurvey} title="1분 설문">
        {surveySent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🙌</div>
            <p className="font-medium text-gray-900 mb-1">설문 완료!</p>
            <p className="text-sm text-gray-500 mb-5">소중한 의견 감사해요.</p>
            <button
              onClick={handleCloseSurvey}
              className="w-full bg-brand-600 text-white text-sm font-medium rounded-lg h-10 hover:bg-brand-500 transition-all duration-150"
            >
              확인
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Interests */}
            <div>
              <p className="text-[13px] font-semibold text-gray-900 mb-2.5">관심 분야를 선택해주세요</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() =>
                      setSurveyInterests((prev) =>
                        prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
                      )
                    }
                    className={`text-xs font-medium rounded-lg px-3 py-1.5 border transition-all duration-150 ${
                      surveyInterests.includes(chip)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose */}
            <div>
              <p className="text-[13px] font-semibold text-gray-900 mb-2.5">방문 목적</p>
              <div className="space-y-2">
                {PURPOSE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="purpose"
                      value={opt.value}
                      checked={surveyPurpose === opt.value}
                      onChange={() => setSurveyPurpose(opt.value)}
                      className="w-4 h-4 accent-brand-600"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-800">연락 받기를 원해요</p>
                <p className="text-xs text-gray-400 mt-0.5">운영자가 리드로 저장합니다</p>
              </div>
              <button
                onClick={() => setSurveyWantsContact((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-all duration-150 ${
                  surveyWantsContact ? 'bg-brand-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    surveyWantsContact ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleSendSurvey}
              className="w-full bg-brand-600 text-white text-sm font-medium rounded-lg h-10 hover:bg-brand-500 transition-all duration-150"
            >
              제출하기
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
