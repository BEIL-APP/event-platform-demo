import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { useBooths } from '../../hooks/useBooths';
import { useToast } from '../../contexts/ToastContext';
import type { Booth } from '../../types';

const CATEGORIES = [
  '음료 & 식품', '인쇄 & 굿즈', '친환경 오피스', 'IT & SaaS',
  '핸드크래프트', '웰니스 & 복지', '마케팅', '패션 & 라이프스타일', '기타',
];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, className = '',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all placeholder:text-gray-400 ${className}`}
    />
  );
}

export default function AdminBoothNewPage() {
  const navigate = useNavigate();
  const { addBooth } = useBooths();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState(['', '']);
  const [instagram, setInstagram] = useState('');
  const [store, setStore] = useState('');
  const [site, setSite] = useState('');
  const [faq, setFaq] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]);
  const [nextEventTitle, setNextEventTitle] = useState('');
  const [nextEventDate, setNextEventDate] = useState('');
  const [nextEventLocation, setNextEventLocation] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      showToast('부스 이름을 입력해주세요', 'error');
      return;
    }
    if (!tagline.trim()) {
      showToast('한 줄 소개를 입력해주세요', 'error');
      return;
    }

    const booth: Booth = {
      id: `booth-${Date.now()}`,
      name: name.trim(),
      category,
      tagline: tagline.trim(),
      description: description.trim(),
      images: images.filter((img) => img.trim()),
      links: {
        instagram: instagram.trim() || undefined,
        store: store.trim() || undefined,
        site: site.trim() || undefined,
      },
      faq: faq.filter((f) => f.question.trim() && f.answer.trim()),
      nextEvents: nextEventTitle.trim()
        ? [{ title: nextEventTitle.trim(), date: nextEventDate, location: nextEventLocation.trim() }]
        : [],
      createdAt: new Date().toISOString(),
    };

    addBooth(booth);
    showToast('부스가 생성됐어요!', 'success');
    navigate(`/admin/booths/${booth.id}`);
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">새 부스 만들기</h1>
            <p className="text-sm text-gray-400 mt-0.5">부스 정보를 입력하고 QR을 발급받으세요</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-5">기본 정보</h2>
            <div className="space-y-4">
              <div>
                <FieldLabel required>부스 이름</FieldLabel>
                <TextInput value={name} onChange={setName} placeholder="예: TeaCo" />
              </div>
              <div>
                <FieldLabel required>카테고리</FieldLabel>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel required>한 줄 소개 (tagline)</FieldLabel>
                <TextInput
                  value={tagline}
                  onChange={setTagline}
                  placeholder="예: 한 잔에 담긴 일상의 여유"
                />
              </div>
              <div>
                <FieldLabel>상세 소개</FieldLabel>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="부스를 찾아온 관람객에게 소개할 내용을 작성해주세요."
                  rows={4}
                  className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-5">이미지 URL</h2>
            <div className="space-y-3">
              {images.map((img, i) => (
                <div key={i} className="flex items-center gap-2">
                  <TextInput
                    value={img}
                    onChange={(v) => {
                      const next = [...images];
                      next[i] = v;
                      setImages(next);
                    }}
                    placeholder={`이미지 ${i + 1} URL (예: https://...)`}
                  />
                  {images.length > 1 && (
                    <button
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {images.length < 4 && (
                <button
                  onClick={() => setImages([...images, ''])}
                  className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> 이미지 추가
                </button>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-5">링크</h2>
            <div className="space-y-3">
              <div>
                <FieldLabel>인스타그램</FieldLabel>
                <TextInput value={instagram} onChange={setInstagram} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <FieldLabel>스토어</FieldLabel>
                <TextInput value={store} onChange={setStore} placeholder="https://..." />
              </div>
              <div>
                <FieldLabel>홈페이지</FieldLabel>
                <TextInput value={site} onChange={setSite} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-5">자주 묻는 질문 (최대 3개)</h2>
            <div className="space-y-4">
              {faq.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Q{i + 1}</p>
                  <TextInput
                    value={item.question}
                    onChange={(v) => {
                      const next = [...faq];
                      next[i] = { ...next[i], question: v };
                      setFaq(next);
                    }}
                    placeholder="질문을 입력하세요"
                    className="mb-2"
                  />
                  <textarea
                    value={item.answer}
                    onChange={(e) => {
                      const next = [...faq];
                      next[i] = { ...next[i], answer: e.target.value };
                      setFaq(next);
                    }}
                    placeholder="답변을 입력하세요"
                    rows={2}
                    className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-2.5 resize-none outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all placeholder:text-gray-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Next Event */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-5">다음 이벤트 (선택)</h2>
            <div className="space-y-3">
              <div>
                <FieldLabel>이벤트 이름</FieldLabel>
                <TextInput value={nextEventTitle} onChange={setNextEventTitle} placeholder="예: 봄 바이어 미팅" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>날짜</FieldLabel>
                  <input
                    type="date"
                    value={nextEventDate}
                    onChange={(e) => setNextEventDate(e.target.value)}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
                  />
                </div>
                <div>
                  <FieldLabel>장소</FieldLabel>
                  <TextInput value={nextEventLocation} onChange={setNextEventLocation} placeholder="예: COEX Hall A" />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pb-4">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              부스 생성 & QR 발급
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
