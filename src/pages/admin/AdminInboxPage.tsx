import { useState, useMemo } from 'react';
import {
  Search, Tag, ChevronDown, Send, ArrowLeft,
  Clock, CheckCircle, PauseCircle, X, MessageSquare, ShieldOff, Shield,
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { useThreads } from '../../hooks/useThreads';
import { useToast } from '../../contexts/ToastContext';
import { getBooths, blockThread, saveNotification } from '../../utils/localStorage';
import type { Thread } from '../../types';

type StatusFilter = 'all' | '미처리' | '처리' | '보류';

const TEMPLATE_REPLIES = [
  {
    label: '답변 확인 중',
    text: '안녕하세요! 문의 주셔서 감사합니다. 담당자가 확인 후 빠른 시일 내로 상세 답변 드리겠습니다.',
  },
  {
    label: '견적 안내',
    text: '견적은 수량과 요구사항에 따라 달라집니다. 이메일(hello@booth.kr)로 자세한 사항 보내주시면 1영업일 내로 맞춤 견적서 발송해 드리겠습니다.',
  },
  {
    label: '문의 완료',
    text: '문의하신 내용에 대한 답변이 완료됐습니다. 추가 문의사항이 있으시면 언제든지 말씀해 주세요. 감사합니다!',
  },
];

const TAG_SUGGESTIONS = ['견적문의', 'B2B', '대량주문', '기술문의', '납품일정', '샘플요청', 'OEM'];

function StatusBadge({ status }: { status: Thread['status'] }) {
  const map = {
    '미처리': { icon: <Clock className="w-3 h-3" />, cls: 'bg-gray-100 text-gray-600' },
    '처리': { icon: <CheckCircle className="w-3 h-3" />, cls: 'bg-emerald-50 text-emerald-700' },
    '보류': { icon: <PauseCircle className="w-3 h-3" />, cls: 'bg-amber-50 text-amber-700' },
  };
  const s = map[status];
  return (
    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.icon}
      {status}
    </span>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 1) return '방금 전';
  if (diffH < 24) return `${Math.floor(diffH)}시간 전`;
  if (diffH < 48) return '어제';
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function AdminInboxPage() {
  const { threads, reply, updateStatus, updateMemo, addTag, removeTag } = useThreads();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<Thread | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const allBooths = getBooths();
  const boothMap = Object.fromEntries(allBooths.map((b) => [b.id, b]));

  const filtered = useMemo(() => {
    return threads.filter((t) => {
      const matchStatus = filter === 'all' || t.status === filter;
      const booth = boothMap[t.boothId];
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        booth?.name.toLowerCase().includes(q) ||
        t.messages.some((m) => m.text.toLowerCase().includes(q)) ||
        t.tags.some((tg) => tg.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [threads, filter, search, boothMap]);

  // Keep selected up-to-date
  const selectedThread = selected
    ? threads.find((t) => t.id === selected.id) ?? null
    : null;

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedThread) return;
    reply(selectedThread.id, replyText.trim(), 'booth');
    if (selectedThread.status === '미처리') {
      updateStatus(selectedThread.id, '처리');
    }

    // Send in-app notification to visitor if guestId is tracked
    if (selectedThread.visitorGuestId) {
      saveNotification({
        id: `notif-${Date.now()}`,
        targetGuestId: selectedThread.visitorGuestId,
        type: 'reply',
        title: `${boothMap[selectedThread.boothId]?.name ?? '부스'}에서 답변이 왔어요`,
        body: replyText.trim().slice(0, 100),
        read: false,
        boothId: selectedThread.boothId,
        threadId: selectedThread.id,
        createdAt: new Date().toISOString(),
      });
    }

    setReplyText('');
    showToast('답변이 전송됐어요', 'success');
  };

  const handleToggleBlock = () => {
    if (!selectedThread) return;
    blockThread(selectedThread.id);
    showToast(
      selectedThread.blocked ? '차단이 해제됐어요' : '해당 문의를 차단했어요',
      selectedThread.blocked ? 'info' : 'error'
    );
  };

  const handleTemplateReply = (text: string) => {
    setReplyText(text);
  };

  const handleAddTag = (tag: string) => {
    if (!selectedThread || !tag.trim()) return;
    addTag(selectedThread.id, tag.trim());
    setNewTag('');
    setShowTagInput(false);
  };

  const counts: Record<StatusFilter, number> = {
    all: threads.length,
    '미처리': threads.filter((t) => t.status === '미처리').length,
    '처리': threads.filter((t) => t.status === '처리').length,
    '보류': threads.filter((t) => t.status === '보류').length,
  };

  return (
    <AdminLayout>
      <div className="flex h-screen overflow-hidden">
        {/* Left: Thread List */}
        <div className={`flex flex-col border-r border-gray-100 ${selectedThread ? 'hidden lg:flex w-80 shrink-0' : 'flex-1'}`}>
          {/* Inbox header */}
          <div className="p-5 border-b border-gray-100">
            <h1 className="text-lg font-bold text-gray-900 mb-4">문의 인박스</h1>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="부스명 또는 키워드 검색"
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Status filter */}
            <div className="flex gap-1.5 flex-wrap">
              {(['all', '미처리', '처리', '보류'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                    filter === s
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? '전체' : s}
                  <span className={`rounded-full px-1 ${filter === s ? 'bg-brand-500 text-brand-100' : 'bg-white text-gray-400'}`}>
                    {counts[s]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">문의가 없어요</p>
              </div>
            ) : (
              filtered.map((t) => {
                const booth = boothMap[t.boothId];
                const lastMsg = t.messages[t.messages.length - 1];
                const isActive = selectedThread?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className={`w-full text-left px-5 py-4 border-b border-gray-50 transition-colors ${
                      isActive ? 'bg-brand-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {booth?.images[0] ? (
                          <img src={booth.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-base">🏪</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-semibold text-gray-900 truncate">{booth?.name ?? t.boothId}</p>
                          <span className="text-xs text-gray-400 shrink-0 ml-2">{formatTime(t.lastUpdated)}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-1.5">{lastMsg?.text}</p>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={t.status} />
                          {t.blocked && (
                            <span className="text-xs bg-red-50 text-red-600 rounded-full px-2 py-0.5 flex items-center gap-0.5">
                              <ShieldOff className="w-2.5 h-2.5" /> 차단
                            </span>
                          )}
                          {t.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Thread Detail */}
        {selectedThread ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Detail Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-4">
              <button
                onClick={() => setSelected(null)}
                className="lg:hidden p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{boothMap[selectedThread.boothId]?.name}</p>
                  <span className="text-xs text-gray-400">
                    {selectedThread.visitorId === 'user'
                      ? `로그인: ${selectedThread.visitorName ?? '사용자'}`
                      : '비로그인'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedThread.status} />
                  {selectedThread.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-0.5 text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                      #{tag}
                      <button onClick={() => removeTag(selectedThread.id, tag)} className="ml-0.5 hover:text-red-400 transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => setShowTagInput(!showTagInput)}
                    className="text-xs text-gray-400 hover:text-brand-600 transition-colors flex items-center gap-0.5"
                  >
                    <Tag className="w-3 h-3" /> 태그
                  </button>
                </div>
              </div>

              {/* Status actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleToggleBlock}
                  title={selectedThread.blocked ? '차단 해제' : '스팸 차단'}
                  className={`p-1.5 rounded-xl transition-colors ${
                    selectedThread.blocked
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'
                  }`}
                >
                  {selectedThread.blocked ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <ShieldOff className="w-4 h-4" />
                  )}
                </button>
                <select
                  value={selectedThread.status}
                  onChange={(e) => {
                    updateStatus(selectedThread.id, e.target.value as Thread['status']);
                    showToast(`상태가 "${e.target.value}"으로 변경됐어요`, 'info');
                  }}
                  className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-300 bg-white text-gray-700"
                >
                  <option value="미처리">미처리</option>
                  <option value="처리">처리</option>
                  <option value="보류">보류</option>
                </select>
              </div>
            </div>

            {/* Tag input row */}
            {showTagInput && (
              <div className="bg-gray-50 px-6 py-2.5 border-b border-gray-100 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">빠른 태그:</span>
                {TAG_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleAddTag(s)}
                    className="text-xs bg-white border border-gray-200 text-gray-600 rounded-full px-2.5 py-1 hover:border-brand-300 hover:text-brand-600 transition-colors"
                  >
                    #{s}
                  </button>
                ))}
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(newTag); }}
                  placeholder="직접 입력 후 Enter"
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 outline-none focus:ring-2 focus:ring-brand-300 bg-white"
                />
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {selectedThread.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === 'booth' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.from === 'visitor' && (
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center mr-2 shrink-0 mt-1 text-xs">
                      {selectedThread.visitorId === 'user' ? '👤' : '👻'}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.from === 'booth'
                        ? 'bg-brand-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-card border border-gray-50'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-1.5 ${msg.from === 'booth' ? 'text-brand-200' : 'text-gray-400'}`}>
                      {formatTime(msg.at)}
                      {msg.from === 'booth' && ' · 운영자'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Memo */}
            <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
              <textarea
                value={selectedThread.memo}
                onChange={(e) => updateMemo(selectedThread.id, e.target.value)}
                placeholder="내부 메모 (관람객에게 보이지 않아요)"
                rows={1}
                className="w-full text-xs text-amber-800 bg-transparent resize-none outline-none placeholder:text-amber-400"
              />
            </div>

            {/* Template replies */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <ChevronDown className="w-3 h-3" /> 템플릿 답변
              </p>
              <div className="flex gap-2 flex-wrap">
                {TEMPLATE_REPLIES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => handleTemplateReply(t.text)}
                    className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:border-brand-300 hover:text-brand-600 transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply input */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-end gap-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="관람객에게 답변을 작성하세요…"
                rows={2}
                className="flex-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all placeholder:text-gray-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="h-10 px-5 bg-brand-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-brand-700 transition-colors disabled:opacity-40 shrink-0"
              >
                <Send className="w-4 h-4" />
                답변 전송
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-center">
            <div>
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">왼쪽에서 문의를 선택하세요</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
