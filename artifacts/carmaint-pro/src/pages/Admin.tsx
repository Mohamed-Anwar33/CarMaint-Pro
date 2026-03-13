import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Megaphone, Plus, Trash2, Edit2, Shield, CheckCircle, XCircle,
  BarChart3, Car, Bell, Search, Crown, ChevronDown, Save, X, RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { UserRole, UserPlan } from "@/hooks/use-auth";

type AdminTab = "overview" | "users" | "announcements" | "cars";

interface Profile {
  id: string; email: string; name: string | null;
  role: UserRole; plan: UserPlan; onboardingCompleted: boolean; createdAt: string; carsCount?: number;
}
interface Announcement {
  id: string; title: string; message: string; type: "offer" | "update"; active: boolean; createdAt: string;
}
interface CarData {
  id: string; name: string; ownerId: string; modelYear: number; createdAt: string;
}

const PLAN_LABELS: Record<UserPlan, string> = { free: "مجاني", pro: "برو", family_small: "عائلة صغيرة", family_large: "عائلة كبيرة" };
const ROLE_LABELS: Record<UserRole, string> = { manager: "مدير", driver: "سائق", both: "مدير وسائق", admin: "مسؤول" };
const PLAN_COLORS: Record<UserPlan, string> = { free: "text-slate-400 bg-slate-400/10 border-slate-400/20", pro: "text-primary bg-primary/10 border-primary/20", family_small: "text-secondary bg-secondary/10 border-secondary/20", family_large: "text-purple-400 bg-purple-400/10 border-purple-400/20" };
const ROLE_COLORS: Record<UserRole, string> = { manager: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", driver: "text-sky-400 bg-sky-400/10 border-sky-400/20", both: "text-purple-400 bg-purple-400/10 border-purple-400/20", admin: "text-primary bg-primary/10 border-primary/20" };

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", type: "offer" as "offer" | "update", active: true });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersData, annData] = await Promise.all([
        api.get<Profile[]>("/api/users"),
        api.get<Announcement[]>("/api/announcements"),
      ]);
      setProfiles(usersData);
      setAnnouncements(annData);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      showToast("فشل في تحميل البيانات", "error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      await api.patch(`/api/users/${userId}`, { role });
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role } : p));
      showToast("تم تحديث الدور بنجاح");
    } catch { showToast("حدث خطأ أثناء التحديث", "error"); }
  };

  const updateUserPlan = async (userId: string, plan: UserPlan) => {
    try {
      await api.patch(`/api/users/${userId}`, { plan });
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, plan } : p));
      showToast("تم تحديث الخطة بنجاح");
    } catch { showToast("حدث خطأ أثناء التحديث", "error"); }
  };

  const saveAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) { showToast("يرجى ملء جميع الحقول", "error"); return; }
    setSaving(true);
    try {
      if (editingAnnouncement) {
        const updated = await api.put<Announcement>(`/api/announcements/${editingAnnouncement.id}`, announcementForm);
        setAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? updated : a));
        showToast("تم التحديث بنجاح");
      } else {
        const created = await api.post<Announcement>("/api/announcements", announcementForm);
        setAnnouncements(prev => [created, ...prev]);
        showToast("تم إضافة الإعلان بنجاح");
      }
      setShowAnnouncementForm(false);
      setEditingAnnouncement(null);
      setAnnouncementForm({ title: "", message: "", type: "offer", active: true });
    } catch { showToast("حدث خطأ", "error"); }
    setSaving(false);
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await api.delete(`/api/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showToast("تم حذف الإعلان");
    } catch { showToast("حدث خطأ", "error"); }
  };

  const filteredProfiles = profiles.filter(p =>
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: profiles.length,
    free: profiles.filter(p => p.plan === "free").length,
    paid: profiles.filter(p => p.plan !== "free").length,
    managers: profiles.filter(p => p.role === "manager" || p.role === "both").length,
    drivers: profiles.filter(p => p.role === "driver" || p.role === "both").length,
  };

  const tabs = [
    { id: "overview" as AdminTab, label: "نظرة عامة", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "users" as AdminTab, label: "المستخدمون", icon: <Users className="w-4 h-4" />, count: profiles.length },
    { id: "announcements" as AdminTab, label: "الإعلانات", icon: <Megaphone className="w-4 h-4" />, count: announcements.length },
    { id: "cars" as AdminTab, label: "السيارات", icon: <Car className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={cn("fixed top-20 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl",
            toast.type === "success" ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" : "bg-destructive/20 border border-destructive/30 text-destructive")}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">لوحة تحكم المسؤول</h1>
                <p className="text-xs text-muted-foreground">إدارة المستخدمين والمحتوى والصلاحيات</p>
              </div>
            </div>
            <button onClick={fetchAll} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary/30 text-sm text-muted-foreground hover:text-white transition-all">
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> تحديث
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-card border border-border/50 rounded-2xl mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                activeTab === tab.id ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-white hover:bg-white/5")}>
              {tab.icon} {tab.label}
              {tab.count !== undefined && (
                <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-bold", activeTab === tab.id ? "bg-white/20 text-white" : "bg-border text-muted-foreground")}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "إجمالي المستخدمين", value: stats.total, icon: <Users className="w-5 h-5" />, color: "text-secondary" },
                { label: "المشتركون المدفوعون", value: stats.paid, icon: <Crown className="w-5 h-5" />, color: "text-primary" },
                { label: "الحسابات المجانية", value: stats.free, icon: <Shield className="w-5 h-5" />, color: "text-emerald-400" },
                { label: "الإعلانات النشطة", value: announcements.filter(a => a.active).length, icon: <Bell className="w-5 h-5" />, color: "text-amber-400" },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border/50 rounded-2xl p-5 hover:border-border transition-colors">
                  <div className={cn("mb-3", stat.color)}>{stat.icon}</div>
                  <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">توزيع الخطط</h3>
                <div className="space-y-3">
                  {(["free", "pro", "family_small", "family_large"] as UserPlan[]).map(plan => {
                    const count = profiles.filter(p => p.plan === plan).length;
                    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={plan}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{PLAN_LABELS[plan]}</span>
                          <span className="text-white font-medium">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-background overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">آخر المستخدمين المسجلين</h3>
                <div className="space-y-3">
                  {[...profiles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {(p.name || p.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{p.name || "بدون اسم"}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{p.email}</p>
                        </div>
                      </div>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded border font-bold", PLAN_COLORS[p.plan])}>
                        {PLAN_LABELS[p.plan]}
                      </span>
                    </div>
                  ))}
                  {profiles.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">لا يوجد مستخدمون بعد</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">إدارة المستخدمين <span className="text-muted-foreground text-sm font-normal">({profiles.length})</span></h2>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد..."
                  className="pr-9 pl-4 py-2 rounded-xl bg-card border border-border focus:border-primary outline-none text-sm text-white placeholder:text-slate-500 w-56 transition-colors" />
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground">المستخدم</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground hidden sm:table-cell">تاريخ التسجيل</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground hidden sm:table-cell">السيارات</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground">الدور</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground">الخطة</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground hidden md:table-cell">الإعداد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredProfiles.map(profile => (
                      <tr key={profile.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                              {(profile.name || profile.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{profile.name || "بدون اسم"}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[160px]">{profile.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-xs text-muted-foreground">{new Date(profile.createdAt).toLocaleDateString("ar-SA")}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-xs font-bold text-white bg-white/5 border border-border px-2 py-1 rounded-md">
                            // @ts-ignore
                            {profile.carsCount || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <RoleSelect value={profile.role} onChange={(role) => updateUserRole(profile.id, role)} />
                        </td>
                        <td className="px-4 py-3">
                          <PlanSelect value={profile.plan} onChange={(plan) => updateUserPlan(profile.id, plan)} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={cn("text-[10px] px-2 py-1 rounded-md border font-medium",
                            profile.onboardingCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400")}>
                            {profile.onboardingCompleted ? "مكتمل" : "غير مكتمل"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProfiles.length === 0 && (
                  <div className="py-16 text-center">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground text-sm">{search ? "لا توجد نتائج للبحث" : "لا يوجد مستخدمون بعد"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">إدارة الإعلانات</h2>
              <button onClick={() => { setShowAnnouncementForm(true); setEditingAnnouncement(null); setAnnouncementForm({ title: "", message: "", type: "offer", active: true }); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                <Plus className="w-4 h-4" /> إضافة إعلان
              </button>
            </div>

            {/* Announcement Form Modal */}
            {showAnnouncementForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border border-border/50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-white">{editingAnnouncement ? "تعديل الإعلان" : "إضافة إعلان جديد"}</h3>
                    <button onClick={() => setShowAnnouncementForm(false)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">العنوان</label>
                      <input value={announcementForm.title} onChange={e => setAnnouncementForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="عنوان الإعلان" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm text-white placeholder:text-slate-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">الرسالة</label>
                      <textarea value={announcementForm.message} onChange={e => setAnnouncementForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="نص الإعلان التفصيلي..." rows={3}
                        className="w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm text-white placeholder:text-slate-500 transition-colors resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">النوع</label>
                        <div className="flex gap-2">
                          {(["offer", "update"] as const).map(t => (
                            <button key={t} type="button" onClick={() => setAnnouncementForm(p => ({ ...p, type: t }))}
                              className={cn("flex-1 py-2 rounded-lg text-xs font-medium border transition-all",
                                announcementForm.type === t ? (t === "offer" ? "border-primary bg-primary/10 text-primary" : "border-secondary bg-secondary/10 text-secondary") : "border-border text-muted-foreground hover:border-border/80")}>
                              {t === "offer" ? "عرض" : "تحديث"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">الحالة</label>
                        <button type="button" onClick={() => setAnnouncementForm(p => ({ ...p, active: !p.active }))}
                          className={cn("w-full py-2 rounded-lg text-xs font-medium border transition-all",
                            announcementForm.active ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-border text-muted-foreground")}>
                          {announcementForm.active ? "✓ نشط" : "○ معطل"}
                        </button>
                      </div>
                    </div>
                    <button onClick={saveAnnouncement} disabled={saving}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:shadow-primary/30 transition-all disabled:opacity-60">
                      {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> حفظ الإعلان</>}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            <div className="space-y-4">
              {announcements.map(ann => (
                <motion.div key={ann.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={cn("relative overflow-hidden rounded-2xl border p-5", ann.type === "offer" ? "bg-primary/5 border-primary/20" : "bg-secondary/5 border-secondary/20")}>
                  <div className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: ann.type === "offer" ? "#F97316" : "#38BDF8" }} />
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-black border",
                          ann.type === "offer" ? "bg-primary/20 text-primary border-primary/30" : "bg-secondary/20 text-secondary border-secondary/30")}>
                          {ann.type === "offer" ? "عرض" : "تحديث"}
                        </span>
                        {!ann.active && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted/20 text-muted-foreground border border-muted-foreground/20">معطل</span>}
                        <span className="text-[10px] text-muted-foreground">{new Date(ann.createdAt).toLocaleDateString("ar-SA")}</span>
                      </div>
                      <h3 className="font-bold text-white mb-1">{ann.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{ann.message}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setEditingAnnouncement(ann); setAnnouncementForm({ title: ann.title, message: ann.message, type: ann.type, active: ann.active }); setShowAnnouncementForm(true); }}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-border flex items-center justify-center text-muted-foreground hover:text-white transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteAnnouncement(ann.id)}
                        className="w-8 h-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 flex items-center justify-center text-destructive transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {announcements.length === 0 && (
                <div className="py-20 text-center border border-dashed border-border rounded-2xl">
                  <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground text-sm">لا توجد إعلانات بعد. أضف أول إعلان!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cars Tab */}
        {activeTab === "cars" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-5">إدارة السيارات</h2>
            <CarsList />
          </div>
        )}
      </div>
    </div>
  );
}

function RoleSelect({ value, onChange }: { value: UserRole; onChange: (r: UserRole) => void }) {
  const [open, setOpen] = useState(false);
  const roles: UserRole[] = ["manager", "driver", "both", "admin"];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all", ROLE_COLORS[value])}>
        {ROLE_LABELS[value]} <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 right-0 z-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[130px]">
            {roles.map(r => (
              <button key={r} onClick={() => { onChange(r); setOpen(false); }}
                className={cn("w-full text-right px-3 py-2 text-xs font-medium hover:bg-white/5 transition-colors flex items-center gap-2", value === r ? "text-primary" : "text-muted-foreground hover:text-white")}>
                {value === r && <CheckCircle className="w-3 h-3" />} {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PlanSelect({ value, onChange }: { value: UserPlan; onChange: (p: UserPlan) => void }) {
  const [open, setOpen] = useState(false);
  const plans: UserPlan[] = ["free", "pro", "family_small", "family_large"];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all", PLAN_COLORS[value])}>
        {PLAN_LABELS[value]} <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 right-0 z-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[140px]">
            {plans.map(p => (
              <button key={p} onClick={() => { onChange(p); setOpen(false); }}
                className={cn("w-full text-right px-3 py-2 text-xs font-medium hover:bg-white/5 transition-colors flex items-center gap-2", value === p ? "text-primary" : "text-muted-foreground hover:text-white")}>
                {value === p && <CheckCircle className="w-3 h-3" />} {PLAN_LABELS[p]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CarsList() {
  const [cars, setCars] = useState<(CarData & { ownerName?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<(CarData & { ownerName?: string })[]>("/api/cars/all")
      .then(data => { setCars(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      {cars.length === 0 ? (
        <div className="py-16 text-center">
          <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground text-sm">لا توجد سيارات مسجلة بعد</p>
        </div>
      ) : (
        <>
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">إجمالي السيارات</span>
            <span className="text-xs font-bold text-white bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">{cars.length}</span>
          </div>
          <table className="w-full">
            <thead><tr className="border-b border-border/50">
              <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground">اسم السيارة</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground hidden sm:table-cell">المالك</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground hidden sm:table-cell">سنة الصنع</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground hidden md:table-cell">تاريخ الإضافة</th>
            </tr></thead>
            <tbody className="divide-y divide-border/30">
              {cars.map(car => (
                <tr key={car.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-white">{car.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-muted-foreground">{car.ownerName || "—"}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-muted-foreground">{car.modelYear}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{new Date(car.createdAt).toLocaleDateString("ar-SA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
