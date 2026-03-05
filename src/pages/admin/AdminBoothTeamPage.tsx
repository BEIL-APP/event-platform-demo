import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, Crown, UserCheck, UserPlus, Trash2, Clock, Mail,
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { useBooth } from '../../hooks/useBooths';
import { useToast } from '../../contexts/ToastContext';
import {
  getBoothStaff, saveStaff, deleteStaff,
} from '../../utils/localStorage';
import type { StaffMember } from '../../types';

function RoleBadge({ role }: { role: StaffMember['role'] }) {
  if (role === 'owner') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1">
        <Crown className="w-3 h-3" /> 오너
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-brand-700 bg-brand-50 rounded-lg px-2.5 py-1">
      <UserCheck className="w-3 h-3" /> 스태프
    </span>
  );
}

function StatusBadge({ status }: { status: StaffMember['status'] }) {
  if (status === 'active') {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2 py-0.5">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> 활성
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-lg px-2 py-0.5">
      <Clock className="w-2.5 h-2.5" /> 초대 중
    </span>
  );
}

export default function AdminBoothTeamPage() {
  const { boothId } = useParams<{ boothId: string }>();
  const { booth } = useBooth(boothId ?? '');
  const { showToast } = useToast();

  const [members, setMembers] = useState<StaffMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'staff'>('staff');
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (boothId) setMembers(getBoothStaff(boothId));
  }, [boothId]);

  const reload = () => {
    if (boothId) setMembers(getBoothStaff(boothId));
  };

  const handleInvite = () => {
    if (!inviteEmail.includes('@') || !inviteName.trim() || !boothId) {
      showToast('이름과 이메일을 입력해주세요', 'error');
      return;
    }
    const member: StaffMember = {
      id: `staff-${Date.now()}`,
      boothId,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'pending',
      invitedAt: new Date().toISOString(),
    };
    saveStaff(member);
    reload();
    setInviteEmail('');
    setInviteName('');
    setShowInvite(false);
    showToast(`${inviteEmail}에 초대장을 보냈어요 (데모)`, 'success');
  };

  const handleActivate = (member: StaffMember) => {
    saveStaff({ ...member, status: 'active' });
    reload();
    showToast('팀원을 활성화했어요', 'success');
  };

  const handleRoleChange = (member: StaffMember, role: 'owner' | 'staff') => {
    saveStaff({ ...member, role });
    reload();
    showToast('권한이 변경됐어요', 'info');
  };

  const handleDelete = (id: string) => {
    deleteStaff(id);
    reload();
    showToast('팀원을 제거했어요', 'info');
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

  const activeMembers = members.filter((m) => m.status === 'active');
  const pendingMembers = members.filter((m) => m.status === 'pending');

  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to={`/admin/booths/${boothId}`}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">팀 관리</h1>
            <p className="text-sm text-gray-400 mt-0.5">{booth.name} 부스의 운영 팀</p>
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-2 h-10 text-sm font-medium text-white bg-brand-600 rounded-xl px-4 hover:bg-brand-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            팀원 초대
          </button>
        </div>

        {/* Invite Form */}
        {showInvite && (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">새 팀원 초대</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">이름</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full h-10 text-sm bg-white border border-gray-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">역할</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'owner' | 'staff')}
                    className="w-full h-10 text-sm bg-white border border-gray-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
                  >
                    <option value="staff">스태프</option>
                    <option value="owner">오너</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-10 text-sm bg-white border border-gray-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleInvite}
                  className="flex-1 h-10 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
                >
                  초대 보내기 (데모)
                </button>
                <button
                  onClick={() => setShowInvite(false)}
                  className="h-10 px-4 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Members */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-800">활성 팀원</h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-lg px-2 py-0.5 ml-auto">
              {activeMembers.length}명
            </span>
          </div>

          {activeMembers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">활성 팀원이 없어요</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {activeMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-sm font-semibold text-gray-600">
                    {m.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-400 truncate">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <RoleBadge role={m.role} />
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m, e.target.value as 'owner' | 'staff')}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none text-gray-600 bg-white"
                    >
                      <option value="staff">스태프</option>
                      <option value="owner">오너</option>
                    </select>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Invites */}
        {pendingMembers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-800">초대 대기 중</h2>
              <span className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-0.5 ml-auto">
                {pendingMembers.length}건
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {pendingMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400 truncate">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={m.status} />
                    <RoleBadge role={m.role} />
                    <button
                      onClick={() => handleActivate(m)}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Role Description */}
        <div className="mt-6 bg-gray-50 rounded-xl p-6">
          <p className="text-xs font-semibold text-gray-700 mb-3">권한 안내</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Crown className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-700">오너 (Owner)</p>
                <p className="text-xs text-gray-400">부스 설정, 팀원 관리, 리드·문의 전체 접근</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <UserCheck className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-700">스태프 (Staff)</p>
                <p className="text-xs text-gray-400">문의 응답, 리드 조회 (설정 변경 불가)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
