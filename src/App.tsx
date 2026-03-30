import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { auth, signInWithPopup, googleProvider, signOut, db, collection, onSnapshot, query, where, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDoc, setDoc, OperationType, handleFirestoreError, orderBy, limit } from './firebase';
import { 
  LayoutDashboard, 
  Store, 
  Wallet, 
  History, 
  Settings, 
  LogOut, 
  User, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit, 
  Zap,
  Lock,
  CheckCircle, 
  XCircle, 
  Clock,
  Menu,
  X,
  CreditCard,
  Gamepad2,
  MessageSquare,
  Search,
  ChevronRight,
  TrendingUp,
  Package,
  Send,
  AlertCircle,
  Bell,
  BarChart3,
  Users as UsersIcon,
  DollarSign,
  Headphones,
  Info,
  Trophy,
  ArrowUpRight,
  ArrowDownLeft,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { Toaster, toast } from 'sonner';

// --- Components ---

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<any>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      try {
        const parsed = JSON.parse(event.error.message);
        setErrorInfo(parsed);
      } catch (e) {
        setErrorInfo({ error: event.error?.message || event.message });
      }
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">خطأ في النظام</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">عذراً، حدث خطأ غير متوقع أثناء الاتصال بخوادم قاعدة البيانات. يرجى التأكد من صلاحيات الوصول والمحاولة مرة أخرى.</p>
          <div className="bg-slate-50 p-5 rounded-2xl text-right text-[10px] overflow-auto max-h-40 mb-8 font-mono text-slate-400 border border-slate-100">
            {JSON.stringify(errorInfo, null, 2)}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            إعادة تشغيل المنصة
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

const SidebarItem = ({ icon: Icon, label, to, active, collapsed, onClick }: { icon: any, label: string, to: string, active: boolean, collapsed: boolean, onClick?: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-500 group relative",
      active 
        ? "bg-slate-900 text-white shadow-2xl shadow-slate-200" 
        : "text-slate-400 hover:bg-slate-50 hover:text-slate-900",
      collapsed && "justify-center px-0"
    )}
  >
    <Icon className={cn("w-5 h-5 shrink-0 transition-all duration-500", active ? "text-white" : "group-hover:scale-110 group-hover:rotate-3")} />
    {!collapsed && <span className="font-bold text-sm whitespace-nowrap tracking-tight">{label}</span>}
    {active && !collapsed && (
      <motion.div 
        layoutId="sidebar-active-indicator"
        className="absolute left-2 w-1.5 h-1.5 bg-indigo-400 rounded-full"
      />
    )}
    {collapsed && active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-slate-900 rounded-r-full" />
    )}
  </Link>
);

const Navbar = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  const { profile, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'notifications'), 
      where('userId', 'in', [profile.uid, 'all'])
    );
    const unsub = onSnapshot(q, (s) => {
      setNotifications(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'notifications'));
    return unsub;
  }, [profile]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="sticky top-0 z-[100] glass border-b border-slate-200/60 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onToggleSidebar}
            className="p-3 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-slate-200 group"
          >
            <Menu className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200 rotate-6 hover:rotate-0 transition-all duration-500 group">
              <Gamepad2 className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
                جيم ستور <span className="text-indigo-600">برو</span>
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">
                منصة الشحن المتكاملة
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-3 text-slate-500 hover:bg-slate-100 rounded-2xl relative transition-all active:scale-95 border border-transparent hover:border-slate-200 group"
            >
              <Bell className="w-5 h-5 group-hover:shake transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {showNotifs && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="absolute left-0 mt-6 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-[100]"
                >
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h4 className="font-black text-slate-900">مركز التنبيهات</h4>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">جديد</span>
                  </div>
                  <div className="max-h-[30rem] overflow-y-auto p-2 space-y-2">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 text-sm font-bold">لا توجد تنبيهات حالياً</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={cn("p-5 rounded-3xl transition-all cursor-pointer border border-transparent", !n.isRead ? "bg-indigo-50/40 border-indigo-100/50" : "hover:bg-slate-50")}>
                          <div className="flex gap-4">
                            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", n.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600")}>
                              {n.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-slate-900 leading-tight">{n.title}</p>
                              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">{n.message}</p>
                              <div className="flex items-center gap-2 mt-4 opacity-40">
                                <Clock className="w-3 h-3" />
                                <p className="text-[9px] font-bold">{format(new Date(n.createdAt), 'HH:mm - yyyy/MM/dd')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                    <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">عرض كافة التنبيهات</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {profile && (
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">الرصيد المعتمد</span>
                <span className="text-base font-black text-slate-900 leading-none mt-1">{profile.balance.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">ل.س</span></span>
              </div>
            </div>
          )}

          {profile && (
            <div className="flex items-center gap-4 pl-2 border-r border-slate-200/60 pr-8">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900">{profile.displayName}</p>
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-1">{isAdmin ? 'مدير المنصة' : 'عضو متميز'}</p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500"></div>
                <img src={profile.photoURL} alt="" className="relative w-11 h-11 rounded-2xl border-2 border-white shadow-xl object-cover" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- Pages ---

const AdUnit = () => (
  <div className="mt-12 flex justify-center">
    <div 
      id="container-bba07b3e1325a79fa04d4e442896da8d" 
      className="w-full max-w-4xl min-h-[100px] bg-slate-50/50 rounded-[3rem] border border-slate-100 flex items-center justify-center text-slate-300 text-[10px] font-black uppercase tracking-widest overflow-hidden shadow-sm"
    >
      مساحة إعلانية
    </div>
  </div>
);

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, balance: 0 });
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const unsubP = onSnapshot(query(collection(db, 'products'), limit(3)), (s) => {
      setLatestProducts(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setStats(prev => ({ ...prev, products: s.size }));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'products'));

    const unsubS = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });

    const qRecent = query(
      collection(db, 'orders'), 
      where('status', '==', 'completed'), 
      orderBy('createdAt', 'desc'), 
      limit(5)
    );
    const unsubRecent = onSnapshot(qRecent, (s) => {
      setRecentOrders(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'orders/recent'));
    
    if (profile) {
      const q = query(collection(db, 'orders'), where('userId', '==', profile.uid));
      const unsubO = onSnapshot(q, (s) => setStats(prev => ({ ...prev, orders: s.size })), (err) => handleFirestoreError(err, OperationType.GET, 'orders'));
      return () => { unsubP(); unsubO(); unsubS(); unsubRecent(); };
    }
    return () => { unsubP(); unsubS(); unsubRecent(); };
  }, [profile]);

  const levelColors = {
    bronze: "text-orange-700 bg-orange-50 border-orange-100",
    silver: "text-slate-500 bg-slate-50 border-slate-100",
    gold: "text-amber-600 bg-amber-50 border-amber-100"
  };

  const levelNames = {
    bronze: "المستوى البرونزي",
    silver: "المستوى الفضي",
    gold: "المستوى الذهبي"
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
            أهلاً بك في <span className="text-indigo-600">مركز التحكم</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-medium leading-relaxed">
            مرحباً {profile?.displayName}، إليك ملخص شامل للنشاط التشغيلي والبيانات المالية الحالية.
          </p>
        </div>
        {profile && (
          <div className={cn("px-8 py-5 rounded-[2rem] border flex items-center gap-5 shadow-sm backdrop-blur-sm", levelColors[profile.level])}>
            <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center shadow-inner">
              <Trophy className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">تصنيف العضوية المعتمد</span>
              <span className="text-xl font-black">{levelNames[profile.level]}</span>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col gap-10 card-hover relative overflow-hidden group"
        >
          <div className="w-20 h-20 bg-slate-900 rounded-[2.25rem] flex items-center justify-center text-white group-hover:scale-110 transition-all duration-700 shadow-2xl shadow-slate-200">
            <Wallet className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mb-3">الرصيد التشغيلي المتاح</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter font-mono">
              {profile?.balance.toLocaleString()} <span className="text-sm font-bold text-slate-300">ل.س</span>
            </p>
          </div>
          <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
            <TrendingUp className="w-48 h-48 rotate-12" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-indigo-600/10">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5 }}
              className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
            />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col gap-10 card-hover relative overflow-hidden group"
        >
          <div className="w-20 h-20 bg-indigo-50 rounded-[2.25rem] flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-all duration-700 shadow-inner">
            <Package className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mb-3">إجمالي الوحدات الرقمية</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter font-mono">
              {stats.products} <span className="text-sm font-bold text-slate-300">عنصر</span>
            </p>
          </div>
          <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
            <Store className="w-48 h-48 rotate-12" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col gap-10 card-hover relative overflow-hidden group"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-[2.25rem] flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-all duration-700 shadow-inner">
            <History className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mb-3">العمليات المنجزة بنجاح</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter font-mono">
              {stats.orders} <span className="text-sm font-bold text-slate-300">عملية</span>
            </p>
          </div>
          <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
            <CheckCircle className="w-48 h-48 rotate-12" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">أحدث العروض الرقمية</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">تحديثات فورية من المتجر</p>
              </div>
            </div>
            <Link to="/store" className="px-6 py-2.5 bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-200">استعراض الكل</Link>
          </div>
          <div className="space-y-6">
            {latestProducts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">لا توجد عروض متاحة حالياً</p>
              </div>
            ) : (
              latestProducts.map(product => (
                <Link key={product.id} to="/store" className="flex items-center gap-6 p-6 rounded-[2.5rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group cursor-pointer">
                  <div className="w-20 h-20 bg-slate-100 rounded-[1.75rem] flex items-center justify-center group-hover:scale-105 transition-all duration-500 overflow-hidden border border-slate-200">
                    {product.iconUrl ? (
                      <img src={product.iconUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Gamepad2 className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900 text-xl">{product.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">الفئة: {product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-indigo-600 text-2xl font-mono">
                      {Math.round((product.packages?.[0]?.priceUSD || product.priceUSD) * (settings.usdToSypRate || 15000)).toLocaleString()}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">ليرة سورية</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">سجل الشحن الناجح</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">آخر العمليات المكتملة</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">مباشر</div>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">لا توجد عمليات مكتملة حالياً</p>
              </div>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-5 p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm truncate">{order.productName}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {order.userEmail.split('@')[0].slice(0, 3)}*** تم شحن {order.packageName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{format(new Date(order.createdAt), 'HH:mm')}</p>
                    <div className="flex items-center gap-1 text-emerald-600 mt-1">
                      <Zap className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-black uppercase">ناجح</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">إعلانات النظام المركزية</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">تنبيهات الإدارة العامة</p>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white flex-1 flex flex-col justify-center relative overflow-hidden shadow-2xl shadow-slate-300 border border-slate-800">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-600/20 rounded-full border border-indigo-500/30 mb-8">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">إعلان رسمي هام</span>
              </div>
              <h4 className="text-4xl font-black mb-6 leading-tight tracking-tighter">مهرجان رمضان المبارك! 🌙</h4>
              <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">نعلن عن إطلاق حملة الخصومات الكبرى بنسبة تصل إلى 15% على كافة الخدمات الرقمية. العرض ساري لفترة محدودة لجميع الأعضاء المتميزين.</p>
              <Link to="/store" className="inline-block px-12 py-5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40 active:scale-95 border border-indigo-500">
                الانتقال للمتجر فوراً
              </Link>
            </div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
            <TrendingUp className="absolute top-10 right-10 w-40 h-40 text-white/5 -rotate-12" />
          </div>
        </div>
      </div>

      <AdUnit />
    </div>
  );
};

const StorePage = () => {
  const { profile } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ usdToSypRate: 15000 });
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<any | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [playerId, setPlayerId] = useState('');

  useEffect(() => {
    const unsubP = onSnapshot(collection(db, 'products'), (s) => {
      setProducts(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'products'));
    const unsubS = onSnapshot(doc(db, 'settings', 'global'), (s) => {
      if (s.exists()) setSettings(s.data());
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/global'));
    return () => { unsubP(); unsubS(); };
  }, []);

  useEffect(() => {
    if (buying && buying.packages && buying.packages.length > 0) {
      setSelectedPackage(buying.packages[0]);
    } else {
      setSelectedPackage(null);
    }
  }, [buying]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuy = async (product: any) => {
    if (!profile) return;
    if (!playerId.trim()) {
      toast.error('يرجى إدخال معرف اللاعب (ID) لإتمام عملية الشحن');
      return;
    }

    const pkg = selectedPackage || (product.packages && product.packages[0]) || product;
    const currentRate = settings.usdToSypRate || 15000;
    const currentSYPPrice = Math.round(pkg.priceUSD * currentRate);

    if (profile.balance < currentSYPPrice) {
      toast.error('عذراً، الرصيد المتاح في محفظتكم غير كافٍ لإتمام هذه العملية. المبلغ المطلوب: ' + currentSYPPrice.toLocaleString() + ' ل.س');
      return;
    }

    setBuying(product);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: profile.uid,
        userEmail: profile.email,
        productId: product.id,
        productName: product.name,
        packageName: pkg.name || 'باقة أساسية',
        amount: pkg.amount || product.amount,
        price: currentSYPPrice,
        priceUSD: pkg.priceUSD,
        playerId: playerId.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', profile.uid), {
        balance: profile.balance - currentSYPPrice,
        totalSpent: (profile.totalSpent || 0) + currentSYPPrice
      });

      toast.success('تم تسجيل طلب الشراء بنجاح. تم خصم ' + currentSYPPrice.toLocaleString() + ' ل.س من رصيدكم.');
      setPlayerId('');
      setBuying(null);
      setSelectedPackage(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'orders/users');
      setBuying(null);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">سوق <span className="text-indigo-600">الخدمات الرقمية</span></h1>
          <p className="text-slate-500 mt-3 text-lg font-medium leading-relaxed">استعرض قائمة المنتجات والوحدات الرقمية المتاحة للشحن الفوري والمباشر.</p>
        </div>
        <div className="relative w-full md:w-[30rem] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث عن منتج، لعبة، أو بطاقة..." 
            className="w-full pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-bold text-base"
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-[28rem] bg-slate-100 animate-pulse rounded-[3.5rem] border border-slate-200"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => (
              <motion.div 
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -12 }}
                className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden group card-hover flex flex-col relative"
              >
                <div className="h-56 bg-slate-50 flex items-center justify-center p-12 relative overflow-hidden border-b border-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  {product.iconUrl ? (
                    <img src={product.iconUrl} alt="" className="max-h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl" />
                  ) : (
                    <Gamepad2 className="w-24 h-24 text-slate-200 relative z-10" />
                  )}
                  <div className="absolute top-6 right-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 shadow-sm">
                    {product.category}
                  </div>
                </div>
                
                <div className="p-10 flex-1 flex flex-col justify-between gap-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">متوفر للتسليم الفوري</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {product.packages && product.packages.length > 0 && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">اختر الحزمة المطلوبة</label>
                        <div className="grid grid-cols-2 gap-3">
                          {product.packages.map((pkg: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedPackage(pkg)}
                              className={cn(
                                "p-4 rounded-2xl border-2 transition-all text-right group/pkg",
                                (selectedPackage?.name === pkg.name || (!selectedPackage && idx === 0))
                                  ? "border-indigo-600 bg-indigo-50/50"
                                  : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
                              )}
                            >
                              <p className={cn(
                                "font-black text-sm mb-1",
                                (selectedPackage?.name === pkg.name || (!selectedPackage && idx === 0)) ? "text-indigo-600" : "text-slate-700"
                              )}>{pkg.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 font-mono">
                                {Math.round(pkg.priceUSD * (settings.usdToSypRate || 15000)).toLocaleString()} ل.س
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">معرف اللاعب (Player ID)</label>
                      <div className="relative group/id">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/id:text-indigo-500 transition-colors" />
                        <input 
                          type="text"
                          value={playerId}
                          onChange={(e) => setPlayerId(e.target.value)}
                          placeholder="أدخل الـ ID هنا..."
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">السعر المعتمد</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter font-mono">
                          {((selectedPackage?.priceUSD || (product.packages?.[0]?.priceUSD) || product.priceUSD) * (settings.usdToSypRate || 15000)).toLocaleString()} 
                          <span className="text-xs font-bold text-slate-300 mr-2">ل.س</span>
                        </p>
                      </div>
                      <p className="text-xs font-black text-slate-300 font-mono mb-1">${(selectedPackage?.priceUSD || (product.packages?.[0]?.priceUSD) || product.priceUSD).toLocaleString()}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleBuy(product)}
                      disabled={buying?.id === product.id}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3 group/btn"
                    >
                      {buying?.id === product.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>تأكيد عملية الشراء</span>
                          <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const WalletPage = () => {
  const { profile } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({ rechargeInstructions: '', usdToSypRate: 15000 });
  const [history, setHistory] = useState<any[]>([]);
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  
  // Deposit form state
  const [depositForm, setDepositForm] = useState({ amount: '', method: 'شام كاش', senderDetails: '', transactionId: '' });
  const [submitting, setSubmitting] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ تعليمات الشحن بنجاح!');
  };

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (s) => {
      if (s.exists()) setSettings(s.data());
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/global'));
    
    if (profile) {
      const q = query(collection(db, 'orders'), where('userId', '==', profile.uid));
      const unsubHistory = onSnapshot(q, (s) => {
        setHistory(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      }, (err) => handleFirestoreError(err, OperationType.GET, 'orders'));

      const qD = query(collection(db, 'deposit_requests'), where('userId', '==', profile.uid));
      const unsubDepositHistory = onSnapshot(qD, (s) => {
        setDepositHistory(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      }, (err) => handleFirestoreError(err, OperationType.GET, 'deposit_requests'));

      return () => { unsubSettings(); unsubHistory(); unsubDepositHistory(); };
    }
    return unsubSettings;
  }, [profile]);

  const handleRecharge = async () => {
    if (!code.trim() || !profile) return;
    setLoading(true);
    try {
      const codeDoc = await getDoc(doc(db, 'recharge_codes', code.trim()));
      if (!codeDoc.exists()) {
        toast.error('عذراً، الرمز المدخل غير صالح أو غير مسجل في قاعدة البيانات.');
        return;
      }
      const data = codeDoc.data();
      if (data.isUsed) {
        toast.error('هذا الرمز تم استهلاكه مسبقاً. يرجى التحقق من صحة الرمز والمحاولة مرة أخرى.');
        return;
      }

      await updateDoc(doc(db, 'recharge_codes', code.trim()), {
        isUsed: true,
        usedBy: profile.uid,
        usedAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: profile.uid,
        title: 'تم استلام طلب تفعيل الكود',
        message: `لقد قمت باستخدام الكود ${code.trim()}. سيتم مراجعة العملية وتحديث رصيدكم يدوياً من قبل الإدارة.`,
        type: 'info',
        createdAt: new Date().toISOString(),
        isRead: false
      });

      toast.success(`تم استلام طلب تفعيل الكود بنجاح. سيتم مراجعة العملية وتحديث رصيدكم يدوياً.`);
      setCode('');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'recharge_codes/users/notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDepositRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !depositForm.amount || !depositForm.senderDetails || !depositForm.transactionId) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'deposit_requests'), {
        userId: profile.uid,
        userEmail: profile.email,
        amount: Number(depositForm.amount),
        method: depositForm.method,
        senderDetails: depositForm.senderDetails,
        transactionId: depositForm.transactionId,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast.success('تم تسجيل طلب الإيداع بنجاح. سيقوم القسم المالي بمراجعة البيانات وتحديث رصيدكم في أقرب وقت ممكن.');
      setDepositForm({ amount: '', method: 'شام كاش', senderDetails: '', transactionId: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'deposit_requests');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-200 pb-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">إدارة <span className="text-indigo-600">المحفظة المالية</span></h1>
          <p className="text-slate-500 mt-3 text-lg font-medium leading-relaxed">المركز اللوجستي الموحد لإدارة الأرصدة والعمليات المالية والتحويلات المباشرة.</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl shadow-slate-200">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">النظام المالي نشط وآمن</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Main Balance Card */}
          <div className="bg-slate-950 rounded-[4rem] p-12 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group border border-slate-800">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-20">
                <div>
                  <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mb-5">الرصيد التشغيلي المعتمد</p>
                  <div className="flex items-baseline gap-5">
                    <h2 className="text-7xl font-black tracking-tighter font-mono leading-none">
                      {profile?.balance.toLocaleString()}
                    </h2>
                    <span className="text-2xl font-bold text-slate-600">ل.س</span>
                  </div>
                  <div className="mt-8 flex items-center gap-4 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 w-fit backdrop-blur-sm">
                    <DollarSign className="w-5 h-5 text-indigo-400" />
                    <span className="text-base font-bold font-mono text-slate-300 tracking-tight">
                      القيمة التقديرية: <span className="text-white">${(profile?.balance / (settings.usdToSypRate || 15000)).toFixed(2)}</span> USD
                    </span>
                  </div>
                </div>
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-all duration-700 shadow-inner">
                  <CreditCard className="w-12 h-12 text-indigo-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/5">
                <div>
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-3">معرف الحساب الرقمي</p>
                  <p className="font-bold text-xl font-mono tracking-wider text-slate-300">{profile?.uid.substring(0, 16).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-3">تصنيف العضوية</p>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600/10 rounded-full border border-indigo-500/20">
                    <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-black text-sm text-indigo-400 uppercase tracking-widest">{profile?.level}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[150px]"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-600/5 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Deposit Request Form */}
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 space-y-10 relative overflow-hidden group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <ArrowUpRight className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">طلب إيداع مالي</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">تحويل عبر القنوات المعتمدة</p>
                </div>
              </div>
              <form onSubmit={handleDepositRequest} className="space-y-8 relative z-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">المبلغ المراد إيداعه (ل.س)</label>
                    <div className="relative">
                      <input 
                        type="number" required value={depositForm.amount} onChange={e => setDepositForm({...depositForm, amount: e.target.value})}
                        placeholder="0.00"
                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-2xl font-mono" 
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-bold">ل.س</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">قناة التحويل المعتمدة</label>
                    <select 
                      value={depositForm.method} onChange={e => setDepositForm({...depositForm, method: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-lg appearance-none"
                    >
                      <option>شام كاش</option>
                      <option>بيمو</option>
                      <option>سيريتل كاش</option>
                      <option>أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">بيانات المرسل الرسمية</label>
                    <input 
                      type="text" required value={depositForm.senderDetails} onChange={e => setDepositForm({...depositForm, senderDetails: e.target.value})}
                      placeholder="الاسم الكامل أو رقم الحساب المحول منه"
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">رقم عملية التحويل (Transaction ID)</label>
                    <input 
                      type="text" required value={depositForm.transactionId} onChange={e => setDepositForm({...depositForm, transactionId: e.target.value})}
                      placeholder="أدخل رقم العملية لتأكيد الدفع"
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black font-mono text-xl" 
                    />
                  </div>
                </div>
                <button 
                  type="submit" disabled={submitting}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>تأكيد طلب الإيداع</span>
                      <ArrowUpRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
            </div>

            {/* Recharge Code Form */}
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 space-y-10 relative overflow-hidden group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">تفعيل كود الشحن</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">شحن فوري عبر الرموز الرقمية</p>
                </div>
              </div>
              <div className="space-y-8 relative z-10">
                <div className="relative group/input">
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-purple-600 transition-colors">
                    <Lock className="w-6 h-6" />
                  </div>
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="أدخل الكود الرقمي هنا..." 
                    className="w-full pl-20 pr-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none font-mono text-2xl font-black tracking-[0.3em] uppercase placeholder:tracking-normal placeholder:font-sans placeholder:text-base"
                  />
                </div>
                <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
                  <p className="text-xs text-purple-700 font-medium leading-relaxed flex gap-3">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>يرجى التأكد من صحة الكود المكون من حروف وأرقام. الأكواد صالحة للاستخدام لمرة واحدة فقط ويتم تفعيلها فورياً.</span>
                  </p>
                </div>
                <button 
                  onClick={handleRecharge}
                  disabled={loading || !code.trim()}
                  className="w-full py-6 bg-purple-600 text-white rounded-[2rem] font-black hover:bg-purple-700 transition-all shadow-2xl shadow-purple-100 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>تفعيل الرصيد الفوري</span>
                      <Zap className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Instructions Card */}
          <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl shadow-slate-200 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-black text-white flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                بروتوكول الشحن اليدوي
              </h3>
              <button 
                onClick={() => copyToClipboard(settings?.rechargeInstructions || '')}
                className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                <Copy className="w-4 h-4" />
                نسخ البيانات
              </button>
            </div>
            <div className="text-slate-400 text-sm font-medium whitespace-pre-wrap leading-loose relative z-10 bg-white/5 p-6 rounded-2xl border border-white/5">
              {settings?.rechargeInstructions || 'لا توجد تعليمات شحن حالياً. يرجى التواصل مع الدعم الفني للمنصة.'}
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl"></div>
          </div>

          {/* Recent Deposits */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900">سجل الإيداعات</h3>
              <div className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">آخر 5 عمليات</div>
            </div>
            <div className="space-y-5">
              {depositHistory.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-slate-100">
                    <Clock className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 text-sm font-black uppercase tracking-widest">لا توجد سجلات إيداع</p>
                </div>
              ) : (
                depositHistory.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-5 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm",
                        item.status === 'approved' ? "bg-emerald-50 text-emerald-600" : 
                        item.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {item.status === 'approved' ? <CheckCircle className="w-6 h-6" /> : 
                         item.status === 'pending' ? <Clock className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900 font-mono leading-none">{item.amount.toLocaleString()} <span className="text-[10px] text-slate-400">ل.س</span></p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">{format(new Date(item.createdAt), 'yyyy/MM/dd')}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                      item.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-100" :
                      item.status === 'approved' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                    )}>
                      {item.status === 'pending' ? 'معلق' : 
                       item.status === 'approved' ? 'مقبول' : 'مرفوض'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900">العمليات التشغيلية</h3>
              <div className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">آخر 5 عمليات</div>
            </div>
            <div className="space-y-5">
              {history.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-slate-100">
                    <History className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 text-sm font-black uppercase tracking-widest">لا توجد عمليات مسجلة</p>
                </div>
              ) : (
                history.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-5 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm",
                        item.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {item.status === 'completed' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{item.productName}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">{format(new Date(item.createdAt), 'yyyy/MM/dd')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-black text-lg font-mono leading-none", item.status === 'completed' ? "text-emerald-600" : "text-amber-600")}>
                        {item.price.toLocaleString()}
                      </p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">ليرة سورية</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'deposits' | 'codes' | 'reports' | 'notifications' | 'settings' | 'users'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ rechargeInstructions: '', supportLink: '', usdToSypRate: 15000 });

  // Form states
  const [newProduct, setNewProduct] = useState({ name: '', category: 'الألعاب', priceUSD: 0, amount: 0, iconUrl: '', packages: [] as any[] });
  const [newPackage, setNewPackage] = useState({ name: '', priceUSD: 0, amount: 0 });
  const [newCode, setNewCode] = useState({ code: '', label: '' });
  const [newNotif, setNewNotif] = useState({ title: '', message: '', userId: 'all', type: 'info' });
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubP = onSnapshot(collection(db, 'products'), (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => handleFirestoreError(err, OperationType.GET, 'products'));
    const unsubO = onSnapshot(collection(db, 'orders'), (s) => setOrders(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))), (err) => handleFirestoreError(err, OperationType.GET, 'orders'));
    const unsubC = onSnapshot(collection(db, 'recharge_codes'), (s) => setCodes(s.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => handleFirestoreError(err, OperationType.GET, 'recharge_codes'));
    const unsubN = onSnapshot(collection(db, 'notifications'), (s) => setNotifs(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))), (err) => handleFirestoreError(err, OperationType.GET, 'notifications'));
    const unsubD = onSnapshot(collection(db, 'deposit_requests'), (s) => setDepositRequests(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))), (err) => handleFirestoreError(err, OperationType.GET, 'deposit_requests'));
    const unsubS = onSnapshot(doc(db, 'settings', 'global'), (s) => {
      if (s.exists()) setSettings(s.data());
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/global'));
    const unsubU = onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => handleFirestoreError(err, OperationType.GET, 'users'));
    return () => { unsubP(); unsubO(); unsubC(); unsubN(); unsubD(); unsubS(); unsubU(); };
  }, [isAdmin]);

  const handleUpdateUserBalance = async (userId: string, newBalance: number) => {
    try {
      await updateDoc(doc(db, 'users', userId), { balance: newBalance });
      toast.success('تم تحديث رصيد المستخدم بنجاح');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'users');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/global');
    }
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name) return;
    
    // If no packages, use top-level price
    const finalPackages = newProduct.packages.length > 0 
      ? newProduct.packages 
      : [{ name: 'باقة أساسية', priceUSD: newProduct.priceUSD, amount: newProduct.amount }];

    const productData = {
      ...newProduct,
      packages: finalPackages,
      // For backward compatibility/dashboard
      priceUSD: finalPackages[0].priceUSD,
      amount: finalPackages[0].amount
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('تم إضافة المنتج بنجاح');
      }
      setNewProduct({ name: '', category: 'الألعاب', priceUSD: 0, amount: 0, iconUrl: '', packages: [] });
      setEditingProduct(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'products');
    }
  };

  const handleAddCode = async () => {
    if (!newCode.code) return;
    try {
      await setDoc(doc(db, 'recharge_codes', newCode.code), {
        ...newCode,
        isUsed: false,
        usedBy: null,
        createdAt: new Date().toISOString()
      });
      setNewCode({ code: '', label: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'recharge_codes');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('تم حذف المنتج بنجاح');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'products');
    }
  };

  const handleDeleteCode = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'recharge_codes', id));
      toast.success('تم حذف الكود بنجاح');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'recharge_codes');
    }
  };

  const handleSendNotif = async () => {
    if (!newNotif.title || !newNotif.message) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        ...newNotif,
        createdAt: new Date().toISOString(),
        isRead: false
      });
      setNewNotif({ title: '', message: '', userId: 'all', type: 'info' });
      toast.success('تم إرسال الإشعار بنجاح');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'notifications');
    }
  };

  const handleDepositStatus = async (request: any, status: 'approved' | 'rejected') => {
    try {
      if (status === 'approved') {
        const userDoc = await getDoc(doc(db, 'users', request.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          await updateDoc(doc(db, 'users', request.userId), {
            balance: userData.balance + request.amount
          });

          await addDoc(collection(db, 'notifications'), {
            userId: request.userId,
            title: 'تمت الموافقة على الإيداع! 💰',
            message: `تمت إضافة ${request.amount} ل.س إلى رصيدك بنجاح.`,
            type: 'success',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        }
      } else {
        await addDoc(collection(db, 'notifications'), {
          userId: request.userId,
          title: 'تم رفض طلب الإيداع ❌',
          message: `عذراً، تم رفض طلب الإيداع الخاص بك. يرجى التواصل مع الدعم.`,
          type: 'error',
          createdAt: new Date().toISOString(),
          isRead: false
        });
      }
      await updateDoc(doc(db, 'deposit_requests', request.id), { status });
      toast.info('تم تحديث حالة الطلب');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'deposit_requests/users/notifications');
    }
  };

  const handleOrderStatus = async (order: any, status: 'completed' | 'rejected') => {
    try {
      if (status === 'completed') {
        await addDoc(collection(db, 'notifications'), {
          userId: order.userId,
          title: 'تم تنفيذ طلبك! ✅',
          message: `تم شحن ${order.productName} بنجاح.`,
          type: 'success',
          createdAt: new Date().toISOString(),
          isRead: false
        });
      } else if (status === 'rejected') {
        // Refund balance
        const userDoc = await getDoc(doc(db, 'users', order.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          await updateDoc(doc(db, 'users', order.userId), {
            balance: userData.balance + order.price,
            totalSpent: Math.max(0, (userData.totalSpent || 0) - order.price)
          });
        }

        await addDoc(collection(db, 'notifications'), {
          userId: order.userId,
          title: 'تم رفض الطلب ❌',
          message: `عذراً، تم رفض طلبك لشحن ${order.productName}. تم إعادة المبلغ (${order.price} ل.س) إلى رصيدك.`,
          type: 'error',
          createdAt: new Date().toISOString(),
          isRead: false
        });
      }
      await updateDoc(doc(db, 'orders', order.id), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'orders/users/notifications');
    }
  };

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.price, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalCodesValue = codes.filter(c => !c.isUsed).reduce((sum, c) => sum + c.amount, 0);

  if (!isAdmin) return <div className="p-8 text-center font-bold text-rose-500">غير مصرح لك بالدخول إلى هذه المنطقة الأمنية.</div>;

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
            منصة <span className="text-indigo-600">الإدارة المركزية</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-medium leading-relaxed">
            بيئة العمل المتكاملة للتحكم في الأصول الرقمية، مراقبة التدفقات المالية، وإدارة العمليات التشغيلية.
          </p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl shadow-slate-200">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">وضع الإدارة العليا نشط</span>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 p-2 bg-slate-100/50 backdrop-blur-sm rounded-[2.5rem] w-fit border border-slate-200/60">
        {(['products', 'orders', 'deposits', 'codes', 'users', 'reports', 'notifications', 'settings'] as const).map(tab => {
          const Icon = tab === 'products' ? Package : 
                       tab === 'orders' ? History : 
                       tab === 'deposits' ? Wallet :
                       tab === 'codes' ? CreditCard : 
                       tab === 'users' ? UsersIcon :
                       tab === 'reports' ? BarChart3 : 
                       tab === 'notifications' ? Bell : Settings;
          
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3",
                activeTab === tab 
                  ? "bg-slate-900 text-white shadow-2xl shadow-slate-300 scale-105" 
                  : "text-slate-400 hover:text-slate-900 hover:bg-white"
              )}
            >
              <Icon className={cn("w-4 h-4", activeTab === tab ? "text-indigo-400" : "text-slate-300")} />
              <span>
                {tab === 'products' ? 'إدارة الأصول' : 
                 tab === 'orders' ? 'سجل العمليات' : 
                 tab === 'deposits' ? 'التدفقات المالية' :
                 tab === 'codes' ? 'رموز الشحن' : 
                 tab === 'users' ? 'إدارة المستخدمين' :
                 tab === 'reports' ? 'التحليلات' : 
                 tab === 'notifications' ? 'مركز البث' : 'تكوين النظام'}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10 relative overflow-hidden">
              <div className="flex items-center gap-5 mb-4">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                  <Settings className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">تكوين النظام الهيكلي</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">تعديل المعايير التشغيلية للمنصة</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">بروتوكول الشحن اليدوي</label>
                  <textarea 
                    value={settings.rechargeInstructions}
                    onChange={e => setSettings({...settings, rechargeInstructions: e.target.value})}
                    placeholder="أدخل التعليمات الرسمية لعمليات الشحن اليدوي..."
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all h-64 font-medium leading-relaxed"
                  />
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">رابط الدعم الفني المباشر</label>
                    <input 
                      type="text"
                      value={settings.supportLink}
                      onChange={e => setSettings({...settings, supportLink: e.target.value})}
                      placeholder="https://wa.me/xxxxxx"
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">سعر صرف الدولار المعتمد (ل.س)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={settings.usdToSypRate}
                        onChange={e => setSettings({...settings, usdToSypRate: Number(e.target.value)})}
                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-2xl font-mono"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-bold">ل.س</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveSettings}
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3"
                  >
                    <span>حفظ وتطبيق التكوينات</span>
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'deposits' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900">إدارة التدفقات المالية الواردة</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">مراجعة طلبات الإيداع والتحقق من الحوالات</p>
                </div>
                <div className="px-4 py-1.5 bg-white rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  إجمالي الطلبات: {depositRequests.length}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="px-10 py-6">العميل المستهدف</th>
                      <th className="px-10 py-6">القيمة المالية</th>
                      <th className="px-10 py-6">قناة التحويل</th>
                      <th className="px-10 py-6">بيانات المصدر</th>
                      <th className="px-10 py-6">رقم العملية</th>
                      <th className="px-10 py-6">الحالة التشغيلية</th>
                      <th className="px-10 py-6 text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {depositRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                          <p className="font-bold text-slate-900">{req.userEmail}</p>
                          <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">{req.userId}</p>
                        </td>
                        <td className="px-10 py-6">
                          <p className="font-black text-slate-900 text-lg font-mono">{req.amount.toLocaleString()} <span className="text-[10px] text-slate-300">ل.س</span></p>
                        </td>
                        <td className="px-10 py-6">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200">{req.method}</span>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-xs font-medium text-slate-500 max-w-[12rem] truncate">{req.senderDetails}</p>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-xs font-black text-indigo-600 font-mono">{req.transactionId || '---'}</p>
                        </td>
                        <td className="px-10 py-6">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                            req.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-100" :
                            req.status === 'approved' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", req.status === 'pending' ? "bg-amber-400 animate-pulse" : req.status === 'approved' ? "bg-emerald-400" : "bg-rose-400")}></div>
                            {req.status === 'pending' ? 'قيد المراجعة' : req.status === 'approved' ? 'تم الاعتماد' : 'مرفوض نهائياً'}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          {req.status === 'pending' && (
                            <div className="flex justify-end gap-3">
                              <button 
                                onClick={() => handleDepositStatus(req, 'approved')} 
                                className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDepositStatus(req, 'rejected')} 
                                className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'reports' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.75rem] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <DollarSign className="w-8 h-8" />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">إجمالي العوائد التشغيلية</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter font-mono">{totalRevenue.toLocaleString()} <span className="text-sm font-bold text-slate-300">ل.س</span></p>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
            </div>
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[1.75rem] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-8 h-8" />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">العمليات قيد التنفيذ</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter font-mono">{pendingOrders} <span className="text-sm font-bold text-slate-300">طلب</span></p>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
            </div>
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.75rem] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-8 h-8" />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">قيمة المخزون الرقمي</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter font-mono">{totalCodesValue.toLocaleString()} <span className="text-sm font-bold text-slate-300">ل.س</span></p>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Bell className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">مركز البث الموحد</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">إرسال تنبيهات فورية لكافة المستخدمين</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">عنوان البث</label>
                  <input 
                    type="text" placeholder="مثلاً: تحديث جديد للنظام" value={newNotif.title}
                    onChange={e => setNewNotif({...newNotif, title: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">تصنيف الرسالة</label>
                  <select 
                    value={newNotif.type} onChange={e => setNewNotif({...newNotif, type: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold appearance-none"
                  >
                    <option value="info">معلومات عامة (Info)</option>
                    <option value="success">إشعار نجاح (Success)</option>
                    <option value="warning">تنبيه أمني (Warning)</option>
                    <option value="error">خطأ تقني (Error)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">محتوى البث</label>
                <textarea 
                  placeholder="اكتب تفاصيل الإشعار هنا..." value={newNotif.message}
                  onChange={e => setNewNotif({...newNotif, message: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all h-32 font-medium"
                />
              </div>

              <button 
                onClick={handleSendNotif} 
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3"
              >
                <span>بث الإشعار الآن</span>
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">أرشيف البث</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي السجلات: {notifs.length}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {notifs.map(n => (
                  <div key={n.id} className="p-8 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                    <div className="flex gap-6 items-center">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                        n.type === 'success' ? "bg-emerald-50 text-emerald-600" :
                        n.type === 'error' ? "bg-rose-50 text-rose-600" :
                        n.type === 'warning' ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"
                      )}>
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{n.message}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(n.createdAt), 'yyyy/MM/dd')}</p>
                      <p className="text-[10px] font-mono text-slate-300 mt-1">{format(new Date(n.createdAt), 'HH:mm')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'products' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{editingProduct ? 'تعديل الأصول الرقمية' : 'إضافة أصول رقمية جديدة'}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{editingProduct ? 'تعديل بيانات المنتج والحزم الحالية' : 'إضافة منتجات جديدة متاحة في المتجر'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">اسم المنتج</label>
                  <input 
                    type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="مثلاً: تطبيق Mico"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">رابط الأيقونة</label>
                  <input 
                    type="text" value={newProduct.iconUrl} onChange={e => setNewProduct({...newProduct, iconUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الفئة</label>
                  <select 
                    value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold appearance-none"
                  >
                    <option value="الألعاب">الألعاب</option>
                    <option value="البطاقات">البطاقات</option>
                    <option value="البرامج">البرامج</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div className="md:col-span-4 p-8 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900">إدارة حزم البيع (Packages)</h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الحزم: {newProduct.packages.length}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <input 
                        type="text" placeholder="اسم الحزمة (مثلاً: 5000 كوينزة)" value={newPackage.name}
                        onChange={e => setNewPackage({...newPackage, name: e.target.value})}
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm"
                      />
                    </div>
                    <div>
                      <input 
                        type="number" placeholder="السعر ($)" value={newPackage.priceUSD || ''}
                        onChange={e => setNewPackage({...newPackage, priceUSD: Number(e.target.value)})}
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-black font-mono text-sm"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (newPackage.name && newPackage.priceUSD > 0) {
                          setNewProduct({...newProduct, packages: [...newProduct.packages, newPackage]});
                          setNewPackage({ name: '', priceUSD: 0, amount: 0 });
                        }
                      }}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs hover:bg-indigo-700 transition-all"
                    >
                      إضافة حزمة
                    </button>
                  </div>

                  {newProduct.packages.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {newProduct.packages.map((pkg, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm group/pkgitem">
                          <input 
                            type="text" 
                            value={pkg.name} 
                            onChange={(e) => {
                              const updated = [...newProduct.packages];
                              updated[i] = { ...updated[i], name: e.target.value };
                              setNewProduct({...newProduct, packages: updated});
                            }}
                            className="text-xs font-bold text-slate-700 bg-transparent border-none focus:ring-0 w-24 p-0"
                          />
                          <div className="flex items-center gap-1 border-r border-slate-100 pr-3">
                            <span className="text-xs font-black text-indigo-600 font-mono">$</span>
                            <input 
                              type="number" 
                              value={pkg.priceUSD} 
                              onChange={(e) => {
                                const updated = [...newProduct.packages];
                                updated[i] = { ...updated[i], priceUSD: Number(e.target.value) };
                                setNewProduct({...newProduct, packages: updated});
                              }}
                              className="text-xs font-black text-indigo-600 font-mono bg-transparent border-none focus:ring-0 w-16 p-0"
                            />
                          </div>
                          <button 
                            onClick={() => setNewProduct({...newProduct, packages: newProduct.packages.filter((_, idx) => idx !== i)})}
                            className="text-rose-300 hover:text-rose-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-4 flex items-center gap-4">
                  <button 
                    onClick={handleSaveProduct} 
                    className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3"
                  >
                    {editingProduct ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span>{editingProduct ? 'حفظ التعديلات النهائية' : 'حفظ المنتج الجديد'}</span>
                  </button>
                  {editingProduct && (
                    <button 
                      onClick={() => {
                        setEditingProduct(null);
                        setNewProduct({ name: '', category: 'الألعاب', priceUSD: 0, amount: 0, iconUrl: '', packages: [] });
                      }}
                      className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                    >
                      إلغاء التعديل
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">قائمة الأصول الحالية</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي المنتجات: {products.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="px-8 py-6">المنتج</th>
                      <th className="px-8 py-6">الفئة</th>
                      <th className="px-8 py-6">السعر ($)</th>
                      <th className="px-8 py-6">السعر (ل.س)</th>
                      <th className="px-8 py-6">المخزون</th>
                      <th className="px-8 py-6 text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200/50">
                              {p.iconUrl ? <img src={p.iconUrl} alt="" className="w-full h-full object-contain" /> : <Package className="w-6 h-6 text-slate-300" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{p.name}</p>
                              {p.packages && p.packages.length > 0 && (
                                <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1">
                                  {p.packages.length} حزم متاحة
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg border border-slate-200">{p.category}</span>
                        </td>
                        <td className="px-8 py-6 font-black text-indigo-600 font-mono">
                          {p.packages && p.packages.length > 0 
                            ? `$${Math.min(...p.packages.map(pkg => pkg.priceUSD))} - $${Math.max(...p.packages.map(pkg => pkg.priceUSD))}`
                            : `$${p.priceUSD?.toLocaleString()}`
                          }
                        </td>
                        <td className="px-8 py-6 font-black text-slate-900 font-mono">
                          {p.packages && p.packages.length > 0 
                            ? `${(Math.min(...p.packages.map(pkg => pkg.priceUSD)) * (settings.usdToSypRate || 15000)).toLocaleString()} ل.س`
                            : `${(p.priceUSD * (settings.usdToSypRate || 15000)).toLocaleString()} ل.س`
                          }
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", p.amount > 0 ? "bg-emerald-400" : "bg-rose-400")}></div>
                            <span className="font-bold text-slate-700">{p.amount} وحدة</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-left">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingProduct(p);
                                setNewProduct({ ...p });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900">سجل العمليات التشغيلية</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">مراقبة وتنفيذ طلبات الشحن المباشر</p>
                </div>
                <div className="px-4 py-1.5 bg-white rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  إجمالي العمليات: {orders.length}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="px-10 py-6">العميل</th>
                      <th className="px-10 py-6">المنتج المطلوب</th>
                      <th className="px-10 py-6">القيمة</th>
                      <th className="px-10 py-6">الحالة</th>
                      <th className="px-10 py-6">التوقيت</th>
                      <th className="px-10 py-6 text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                          <p className="font-bold text-slate-900">{o.userEmail}</p>
                          <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">{o.userId}</p>
                        </td>
                        <td className="px-10 py-6">
                          <p className="font-black text-slate-900">{o.productName}</p>
                          {o.packageName && (
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">الحزمة: {o.packageName}</p>
                          )}
                          {o.playerId && (
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block">ID: {o.playerId}</p>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(o.playerId);
                                  toast.success('تم نسخ معرف اللاعب');
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
                                title="نسخ ID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-10 py-6">
                          <p className="font-black text-indigo-600 font-mono">{o.price.toLocaleString()} <span className="text-[10px] text-slate-300">ل.س</span></p>
                        </td>
                        <td className="px-10 py-6">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                            o.status === 'completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            o.status === 'rejected' ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-700 border-amber-100"
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", o.status === 'pending' ? "bg-amber-400 animate-pulse" : o.status === 'completed' ? "bg-emerald-400" : "bg-rose-400")}></div>
                            {o.status === 'completed' ? 'مكتمل' : o.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(o.createdAt), 'yyyy/MM/dd')}</p>
                          <p className="text-[10px] font-mono text-slate-300 mt-1">{format(new Date(o.createdAt), 'HH:mm')}</p>
                        </td>
                        <td className="px-10 py-6">
                          {o.status === 'pending' && (
                            <div className="flex justify-end gap-3">
                              <button 
                                onClick={() => handleOrderStatus(o, 'completed')} 
                                className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleOrderStatus(o, 'rejected')} 
                                className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900">إدارة قاعدة بيانات المستخدمين</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">التحكم في أرصدة وصلاحيات الأعضاء</p>
                </div>
                <div className="px-4 py-1.5 bg-white rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  إجمالي المستخدمين: {users.length}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="px-10 py-6">المستخدم</th>
                      <th className="px-10 py-6">الرصيد الحالي</th>
                      <th className="px-10 py-6">إجمالي الإنفاق</th>
                      <th className="px-10 py-6">المستوى</th>
                      <th className="px-10 py-6 text-left">تعديل الرصيد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                          <p className="font-bold text-slate-900">{u.email}</p>
                          <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">{u.id}</p>
                        </td>
                        <td className="px-10 py-6">
                          <p className="font-black text-indigo-600 font-mono">{u.balance?.toLocaleString()} <span className="text-[10px] text-slate-300">ل.س</span></p>
                        </td>
                        <td className="px-10 py-6">
                          <p className="font-black text-slate-900 font-mono">{u.totalSpent?.toLocaleString()} <span className="text-[10px] text-slate-300">ل.س</span></p>
                        </td>
                        <td className="px-10 py-6">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100">مستوى {u.level || 1}</span>
                        </td>
                        <td className="px-10 py-6 text-left">
                          <div className="flex justify-end items-center gap-3">
                            <input 
                              type="number"
                              defaultValue={u.balance}
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (val !== u.balance) {
                                  handleUpdateUserBalance(u.id, val);
                                }
                              }}
                              className="w-32 px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-black font-mono text-xs text-center"
                            />
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                              <Edit className="w-4 h-4" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'codes' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">توليد رموز الشحن الرقمية</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">إنشاء أكواد رصيد مسبقة الدفع للتوزيع</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">تسمية الرمز (اختياري)</label>
                  <input 
                    type="text" value={newCode.label} onChange={e => setNewCode({...newCode, label: e.target.value})}
                    placeholder="مثلاً: دفعة تجار دمشق"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">كود الشحن الفريد</label>
                  <input 
                    type="text" value={newCode.code} onChange={e => setNewCode({...newCode, code: e.target.value})}
                    placeholder="ABCD-1234-EFGH"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black font-mono"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddCode} 
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" />
                <span>توليد واعتماد الكود</span>
              </button>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">سجل الرموز المصدرة</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الرموز: {codes.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="px-10 py-6">التسمية</th>
                      <th className="px-10 py-6">كود الشحن</th>
                      <th className="px-10 py-6">الحالة</th>
                      <th className="px-10 py-6">المستخدم</th>
                      <th className="px-10 py-6 text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {codes.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                          <p className="font-bold text-slate-500">{c.label || 'بدون تسمية'}</p>
                        </td>
                        <td className="px-10 py-6">
                          <p className="font-black text-slate-900 font-mono tracking-widest">{c.code}</p>
                        </td>
                        <td className="px-10 py-6">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                            c.isUsed ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", c.isUsed ? "bg-slate-300" : "bg-emerald-400")}></div>
                            {c.isUsed ? 'تم الاستخدام' : 'نشط وصالح'}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-xs font-medium text-slate-500">{c.usedBy || '---'}</p>
                        </td>
                        <td className="px-10 py-6 text-left">
                          <button 
                            onClick={() => handleDeleteCode(c.id)}
                            className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AdUnit />
    </div>
  );
};

const LoginPage = () => {
  const handleLogin = () => signInWithPopup(auth, googleProvider);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden" dir="rtl">
      {/* Immersive Background Architecture */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e1b4b,transparent)] opacity-60"></div>
        <div className="absolute -top-64 -left-64 w-[50rem] h-[50rem] bg-indigo-600/20 rounded-full blur-[180px] animate-pulse"></div>
        <div className="absolute -bottom-64 -right-64 w-[50rem] h-[50rem] bg-purple-600/20 rounded-full blur-[180px] animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0_0_80_80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M70 60L40 45L10 60V30L40 15L70 30V60Z\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'1\'/%3E%3C/svg%3E")', backgroundSize: '80px 80px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full bg-slate-900/40 backdrop-blur-3xl rounded-[5rem] shadow-[0_0_120px_rgba(0,0,0,0.6)] p-12 md:p-20 text-center space-y-16 border border-white/5 relative z-10"
      >
        <div className="space-y-8">
          <motion.div 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-32 h-32 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-[3rem] flex items-center justify-center text-white mx-auto shadow-[0_30px_60px_rgba(79,70,229,0.4)] relative group overflow-hidden border border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <ShieldCheck className="w-16 h-16 relative z-10 drop-shadow-2xl" />
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
              GameStore <span className="text-indigo-500">Elite</span>
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-indigo-500/30"></div>
              <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.5em]">
                منصة الإدارة الرقمية المتكاملة
              </p>
              <div className="h-px w-8 bg-indigo-500/30"></div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-md mx-auto">
            مرحباً بكم في الواجهة الاحترافية الموحدة لتزويد الخدمات الرقمية. يرجى المصادقة للوصول إلى بيئة العمل الخاصة بكم.
          </p>
          
          <button 
            onClick={handleLogin}
            className="w-full py-7 bg-white text-slate-950 rounded-[2.5rem] flex items-center justify-center gap-5 font-black text-xl hover:bg-slate-50 transition-all group active:scale-[0.98] shadow-[0_25px_50px_rgba(255,255,255,0.05)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-slate-100 translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
            <img src="https://www.google.com/favicon.ico" className="w-7 h-7 relative z-10" alt="" />
            <span className="relative z-10">تسجيل الدخول عبر حساب Google</span>
          </button>
        </div>

        <div className="pt-16 border-t border-white/5 space-y-10">
          <div className="flex items-center justify-center gap-12 opacity-40">
            <div className="flex flex-col items-center gap-3 group cursor-help">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white">تشفير سيادي</span>
            </div>
            <div className="flex flex-col items-center gap-3 group cursor-help">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white">معالجة فورية</span>
            </div>
            <div className="flex flex-col items-center gap-3 group cursor-help">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white">نظام محمي</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">
              إصدار النظام الهيكلي 4.0.2 &copy; 2026
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent rounded-full"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

const AppContent = () => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const [supportLink, setSupportLink] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (s) => {
      if (s.exists()) setSupportLink(s.data().supportLink);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/global'));
    return unsub;
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900" dir="rtl">
      {/* Support Button */}
      {supportLink && (
        <a 
          href={supportLink} 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-10 right-10 z-[60] w-20 h-20 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200 hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95 group border-4 border-white"
        >
          <Headphones className="w-10 h-10 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-14 right-0 bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-xl">
            مركز الدعم الفني المباشر
          </span>
        </a>
      )}

      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 relative">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Architecture */}
        <aside className={cn(
          "fixed md:sticky top-[85px] h-[calc(100vh-85px)] bg-white border-l border-slate-200/50 flex flex-col p-6 space-y-12 z-50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
          isSidebarOpen 
            ? "w-[280px] translate-x-0 shadow-[40px_0_80px_rgba(0,0,0,0.05)]" 
            : "w-0 md:w-20 translate-x-full md:translate-x-0 overflow-hidden md:p-4"
        )}>
          <div className={cn("flex items-center gap-4 px-2 transition-all duration-500", !isSidebarOpen && "md:justify-center")}>
            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xl shadow-slate-200 relative group overflow-hidden border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 scale-0 group-hover:scale-100 transition-transform duration-700 ease-out"></div>
              <ShieldCheck className="w-7 h-7 relative z-10" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-black text-xl text-slate-900 tracking-tighter leading-none">GameStore</span>
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">النظام الهيكلي</span>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-4">
            <SidebarItem icon={LayoutDashboard} label={isSidebarOpen ? "لوحة التحكم" : ""} to="/" active={location.pathname === '/'} collapsed={!isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />
            <SidebarItem icon={Store} label={isSidebarOpen ? "المتجر" : ""} to="/store" active={location.pathname === '/store'} collapsed={!isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />
            <SidebarItem icon={Wallet} label={isSidebarOpen ? "المحفظة" : ""} to="/wallet" active={location.pathname === '/wallet'} collapsed={!isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />
            {isAdmin && (
              <SidebarItem icon={ShieldCheck} label={isSidebarOpen ? "الإدارة" : ""} to="/admin" active={location.pathname === '/admin'} collapsed={!isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />
            )}
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <button 
              onClick={() => signOut(auth)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all duration-300 group active:scale-95",
                !isSidebarOpen && "md:justify-center"
              )}
            >
              <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              {isSidebarOpen && <span className="font-black text-xs uppercase tracking-widest">خروج</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 md:p-16 overflow-x-hidden relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <AnimatePresence mode="wait">
              <div key={location.pathname}>
                <Routes location={location}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/store" element={<StorePage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
                </Routes>
              </div>
            </AnimatePresence>
            <AdUnit />
          </div>
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
