import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../lib/firebase';
import { collection, query, orderBy, getDocs, limit, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Plus, Edit, Trash2, Save, X, Image as ImageIcon, User as UserIcon, MessageSquare, Calendar, Users, Grid, FileText, Award, Clock } from 'lucide-react';
import { ImageUpload } from '../components/ImageUpload';

// Helper: delete file from Firebase Storage if URL is a storage URL
async function deleteStorageFile(url: string) {
  try {
    if (!url || !url.includes('firebasestorage.googleapis.com')) return;
    const urlObj = new URL(url);
    const pathEncoded = urlObj.pathname.split('/o/')[1];
    if (!pathEncoded) return;
    const filePath = decodeURIComponent(pathEncoded.split('?')[0]);
    await deleteObject(ref(storage, filePath));
  } catch (e) {
    // File may already be deleted or not in storage — ignore
    console.warn('Storage delete skipped:', e);
  }
}

// ── Client-side email whitelist (defense-in-depth) ────────────────────────
// এই list-টি শুধু fast-fail-এর জন্য। আসল security Firestore Rules-এ আছে।
// নতুন admin যোগ করতে এখানে এবং firestore.rules-এর isAdmin()-এ দুই জায়গাতেই যোগ করতে হবে।
const ADMIN_EMAILS: string[] = [
  'businessclub.bafsd@gmail.com',
  'alamsharifulshourav@gmail.com',
];
// ──────────────────────────────────────────────────────────────────────────

// Verify admin by trying to read a Rules-protected document.
// firestore.rules-এ adminVerify-তে শুধু isAdmin() email-ই read করতে পারবে।
// অন্য কেউ চেষ্টা করলে permission denied error আসবে → false return।
async function verifyAdminViaRules(): Promise<boolean> {
  try {
    await getDoc(doc(db, 'adminVerify', 'token'));
    return true;
  } catch {
    return false;
  }
}

// Common Types
type Tab = 'hero' | 'sponsors' | 'testimonials' | 'incharge' | 'faqs' | 'events' | 'team' | 'gallery' | 'blogs' | 'cta' | 'certificates';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('hero');

  // ── Admin login rate limiting ──────────────────────────────────────────
  // Prevents rapid-fire Google OAuth popup spam. Max 5 attempts per 15 min.
  const [loginBlocked, setLoginBlocked] = useState(false);
  const [loginBlockMsg, setLoginBlockMsg] = useState('');
  const checkLoginRateLimit = (): boolean => {
    const RL_KEY = 'bafsdbc_admin_login_rl';
    const MAX = 5;
    const WINDOW_MS = 15 * 60 * 1000;
    try {
      const raw = localStorage.getItem(RL_KEY);
      const now = Date.now();
      if (!raw) { localStorage.setItem(RL_KEY, JSON.stringify({ count: 1, windowStart: now })); return true; }
      const { count, windowStart } = JSON.parse(raw) as { count: number; windowStart: number };
      if (now - windowStart > WINDOW_MS) { localStorage.setItem(RL_KEY, JSON.stringify({ count: 1, windowStart: now })); return true; }
      if (count >= MAX) {
        const wait = Math.ceil((WINDOW_MS - (now - windowStart)) / 60000);
        setLoginBlockMsg(`Too many login attempts. Please wait ${wait} minute${wait !== 1 ? 's' : ''}.`);
        setLoginBlocked(true);
        return false;
      }
      localStorage.setItem(RL_KEY, JSON.stringify({ count: count + 1, windowStart }));
      return true;
    } catch { return true; }
  };
  // ──────────────────────────────────────────────────────────────────────

  // ── SECURITY NOTE ───────────────────────────────────────────────────────
  // The VITE_ADMIN_PASSWORD gate has been intentionally removed.
  // VITE_* variables are inlined into the compiled JS bundle by Vite at
  // build time, making the password visible to anyone who opens DevTools
  // and searches the bundle. This is security theater, not real protection.
  //
  // Admin access is enforced by two server-side controls that cannot be
  // bypassed by a client:
  //   1. Google OAuth — identity confirmed by Google's servers
  //   2. Firestore Security Rules — isAdmin() checked on Firebase's servers
  //
  // Only emails explicitly listed in the isAdmin() function in firestore.rules
  // can read /adminVerify/token. If that read fails, the user is signed out.
  // ───────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        // Step 1: client-side whitelist check (fast-fail, no Firestore call needed)
        if (!ADMIN_EMAILS.includes(currentUser.email)) {
          await signOut(auth);
          setUser(null);
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          return;
        }
        // Step 2: server-side Firestore Rules check (cannot be bypassed client-side)
        const allowed = await verifyAdminViaRules();
        if (allowed) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          await signOut(auth);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!checkLoginRateLimit()) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email) {
        // Step 1: client-side whitelist check
        if (!ADMIN_EMAILS.includes(result.user.email)) {
          await signOut(auth);
          console.warn('[Admin] Login rejected (email not in whitelist):', result.user.email);
          return;
        }
        // Step 2: server-side Firestore Rules check
        const allowed = await verifyAdminViaRules();
        if (!allowed) {
          await signOut(auth);
          console.warn('[Admin] Login rejected by Firestore rules:', result.user.email);
        }
      }
    } catch (error: any) {
      console.error('[Admin] Login failed:', error?.code ?? error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUser(null);
    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-12 h-12 border-4 border-baf-cyan/20 border-t-baf-cyan rounded-full animate-spin"></div>
      </div>
    );
  }

  // Google Login gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md text-center border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Admin Panel Login</h2>
          <p className="text-slate-400 mb-8 text-sm">Sign in with an authorized administrator Google account to continue.</p>
          {loginBlocked && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {loginBlockMsg}
            </div>
          )}
          <button
            onClick={handleLogin}
            disabled={loginBlocked}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 border-r border-white/5 flex flex-col pt-20 overflow-y-auto z-10 sticky top-0 h-screen shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-slate-950/50">
          <h2 className="text-2xl font-bold font-serif text-white">Admin <span className="text-baf-cyan">Panel</span></h2>
          <div className="flex items-center gap-3 mt-4">
             <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-baf-cyan flex-shrink-0">
               {user?.email?.[0].toUpperCase()}
             </div>
             <p className="text-xs text-slate-400 truncate flex-grow" title={user?.email || ''}>{user?.email}</p>
          </div>
        </div>
        <nav className="flex-grow py-6 px-4 space-y-1">
          {[
            { id: 'hero', label: 'Hero Images', icon: ImageIcon },
            { id: 'sponsors', label: 'Sponsors', icon: Grid },
            { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
            { id: 'incharge', label: 'Incharges', icon: UserIcon },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'faqs', label: 'FAQs', icon: FileText },
            { id: 'gallery', label: 'Gallery', icon: Grid },
            { id: 'blogs', label: 'Blogs', icon: FileText },
            { id: 'cta', label: 'About Page CTA', icon: Grid },
            { id: 'certificates', label: 'Certificates', icon: Award },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all rounded-xl ${
                activeTab === item.id 
                  ? 'bg-baf-cyan text-slate-900 shadow-md shadow-baf-cyan/20 scale-[1.02]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white hover:scale-[1.01]'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5 bg-slate-950/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-medium rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 pt-24 md:p-12 md:pt-28 overflow-y-auto min-h-screen bg-slate-950">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'hero' && <HeroManager />}
          {activeTab === 'sponsors' && <GenericManager collectionName="sponsors" title="Trusted Sponsors" struct={{ name: '', logo: '' }} defaultItems={defaultSponsors} />}
          {activeTab === 'testimonials' && <GenericManager collectionName="testimonials" title="Testimonials" struct={{ name: '', role: '', speech: '', image: '' }} defaultItems={defaultTestimonials} />}
          {activeTab === 'incharge' && <InchargeManager />}
          {activeTab === 'faqs' && <GenericManager collectionName="faqs" title="FAQs" struct={{ question: '', answer: '' }} defaultItems={defaultFaqs} />}
          {activeTab === 'events' && <GenericManager collectionName="events" title="Events" struct={{ title: '', type: 'EVENT', date: '', time: '', venue: '', image: '', speaker: '', registrationLink: '' }} defaultItems={defaultEvents} />}
          {activeTab === 'team' && <GenericManager collectionName="team" title="Team Members" struct={{ name: '', role: '', image: '', year: '' }} defaultItems={defaultTeam} />}
          {activeTab === 'gallery' && <GenericManager collectionName="gallery" title="Gallery" struct={{ url: '', caption: '' }} defaultItems={defaultGallery} />}
          {activeTab === 'blogs' && <GenericManager collectionName="blogs" title="Blogs" struct={{ title: '', content: '', image: '', author: '', date: '', authorLinkedIn: '', authorPortfolio: '' }} isBlog={true} defaultItems={defaultBlogsData} />}
          {activeTab === 'cta' && <AboutCTAManager />}
          {activeTab === 'certificates' && <CertificateManager />}
        </div>
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Specific Managers
// ----------------------------------------------------------------------------

const defaultBgImages: string[] = [];

function HeroManager() {
  const [images, setImages] = useState<any[]>([]);
  const [url, setUrl] = useState('');
  
  const fetchImages = async () => {
    const { data, error } = await getDocs(query(collection(db, 'heroImages'), orderBy('createdAt', 'desc'))).then(snap => ({ data: snap.docs.map(d=>({ ...d.data(), id: d.id })), error: null }));
    if (error) handleFirestoreError(error, OperationType.GET, 'heroImages');
    else if (data) setImages(data);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleLoadDefaults = async () => {
    try {
      const inserts = defaultBgImages.map((url, i) => ({ id: `hero-default-${i}`, url, createdAt: Date.now() + i }));
      const promises = inserts.map(item => setDoc(doc(db, 'heroImages', item.id), item)); await Promise.all(promises); const error = null;
      if (error) throw error;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `heroImages`);
    }
    fetchImages();
  };

  const handleAdd = async () => {
    if (!url) return;
    if (images.length >= 7) {
      alert("Maximum 7 images allowed in Hero section.");
      return;
    }
    const id = `hero-${Date.now()}`;
    try {
      await setDoc(doc(db, 'heroImages', { id, url, createdAt: Date.now() }.id || Date.now().toString()), { id, url, createdAt: Date.now() }); const error = null;
      if (error) throw error;
      setUrl('');
      fetchImages();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `heroImages/${id}`);
    }
  };

  const handleDelete = async (id: string, url?: string) => {
    try {
      await deleteDoc(doc(db, 'heroImages', id));
      if (url) await deleteStorageFile(url);
      fetchImages();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `heroImages/${id}`);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold font-serif">Hero Images</h2>
        {images.length === 0 && (
          <button onClick={handleLoadDefaults} className="text-sm font-medium text-baf-cyan hover:text-white transition">Load Defaults</button>
        )}
      </div>

      <div className="bg-slate-900 shadow-xl border border-white/10 rounded-3xl p-6 mb-8 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Upload New Hero Image <span className="text-xs text-slate-500 ml-2">(Max 7 images)</span></label>
          <ImageUpload value={url} onChange={setUrl} label="Select Hero Image" aspectRatio="21/9" />
        </div>
        
        <div className="flex justify-between items-center border-t border-white/5 pt-4">
           <p className="text-sm text-slate-400">Currently showing: <span className="text-white font-medium">{images.length}/7</span></p>
           <button onClick={handleAdd} disabled={!url} className="bg-baf-cyan text-slate-900 font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-baf-cyan/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
             <Plus className="w-5 h-5" /> Add to Slider
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map(img => (
          <div key={img.id} className="bg-slate-900 rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg">
            <div className="aspect-[21/9] w-full bg-slate-950 flex flex-col justify-center items-center">
              <img src={img.url || undefined} alt="Hero" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent flex items-end justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleDelete(img.id, img.url)} className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 shadow-lg flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const defaultSponsors = [];

const defaultEvents = [];

const defaultTeam = [];

const defaultGallery: any[] = [];

const defaultBlogsData: any[] = [];

const defaultIncharges = [];

const defaultTestimonials = [];

const defaultFaqs = [];

function InchargeManager() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', role: '', speech: '', image: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchIncharges = async () => {
    const { data, error } = await getDocs(query(collection(db, 'incharges'), orderBy('createdAt', 'desc'))).then(snap => ({ data: snap.docs.map(d=>({ ...d.data(), id: d.id })), error: null }));
    if (error) {
      console.error(error);
      if (items.length === 0) setItems(defaultIncharges.map((d, i) => ({ id: `default-${i}`, ...d })));
    } else if (data) {
      if (data.length === 0 && defaultIncharges.length > 0) {
        setItems(defaultIncharges.map((d, i) => ({ id: `default-${i}`, ...d })));
      } else {
        setItems(data);
      }
    }
  };

  useEffect(() => {
    fetchIncharges();
  }, []);

  const handleLoadDefaults = async () => {
    try {
      const inserts = defaultIncharges.map((d, i) => ({ id: `incharge-default-${i}`, ...d, createdAt: Date.now() + i }));
      const promises = inserts.map(item => setDoc(doc(db, 'incharges', item.id), item)); await Promise.all(promises); const error = null;
      if (error) throw error;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `incharges`);
    }
    fetchIncharges();
  };

  const handleSave = async () => {
    if (!form.name || !form.role || !form.speech || !form.image) return alert("Fill all fields");
    try {
      const saveData = {
        name: form.name,
        role: form.role,
        speech: form.speech,
        image: form.image
      };
      if (editingId && !editingId.toString().startsWith('default-')) {
        await updateDoc(doc(db, 'incharges', editingId), { ...saveData, createdAt: Date.now() }); const error = null;
        if (error) throw error;
      } else {
        const id = `incharge-${Date.now()}`;
        await setDoc(doc(db, 'incharges', { id, ...saveData, createdAt: Date.now() }.id || Date.now().toString()), { id, ...saveData, createdAt: Date.now() }); const error = null;
        if (error) throw error;
      }
      setForm({ name: '', role: '', speech: '', image: '' });
      setEditingId(null);
      fetchIncharges();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `incharges`);
    }
  };

  const handleDelete = async (id: string) => {
    try { 
      await deleteDoc(doc(db, 'incharges', id)); const error = null; 
      if (error) throw error;
      fetchIncharges();
    }
    catch (e) { handleFirestoreError(e, OperationType.DELETE, `incharges/${id}`); }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-3xl font-bold font-serif">Incharges</h2>
         {(items.length === 0 || items.some(i => i.id?.toString().startsWith('default-'))) && (
            <button onClick={handleLoadDefaults} className="text-sm font-medium text-baf-cyan hover:text-white transition">Load Default Incharges</button>
         )}
      </div>
      <div className="bg-slate-900 shadow-xl border border-white/10 rounded-3xl p-6 lg:p-8 mb-8 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4 mb-4">{editingId ? 'Edit Incharge' : 'Add New Incharge'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
            <input className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all" placeholder="Role (e.g. CO-Moderator)" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Speech</label>
            <textarea className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 h-32 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all" placeholder="Speech" value={form.speech} onChange={e => setForm({...form, speech: e.target.value})} />
          </div>
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-slate-300 mb-2">Profile Image</label>
             <ImageUpload value={form.image} onChange={val => setForm({...form, image: val})} label="Select Profile Image" aspectRatio="1/1" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          {editingId && <button onClick={() => { setEditingId(null); setForm({ name: '', role: '', speech: '', image: '' }); }} className="px-6 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition">Cancel</button>}
          <button onClick={handleSave} className="bg-baf-cyan text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-baf-cyan/80 transition-all flex items-center gap-2">
             <Save className="w-5 h-5"/> {editingId ? 'Update Incharge' : 'Add New Incharge'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-slate-900 rounded-2xl p-6 border border-white/10 flex gap-4">
            <img src={item.image || undefined} className="w-24 h-24 object-cover rounded-xl" />
            <div className="flex-1">
              <h4 className="font-bold text-lg">{item.name}</h4>
              <p className="text-baf-cyan text-xs font-bold uppercase mb-2">{item.role}</p>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4">{item.speech}</p>
              <div className="flex gap-2">
                <button onClick={() => { setForm(item); setEditingId(item.id); }} className="bg-white/10 p-2 rounded-lg hover:bg-white/20"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500/40"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutCTAManager() {
  const [form, setForm] = useState({ title: '', subTitle: '', buttonText: '', image: '', logo: '' });
  const fetchCTA = async () => {
    const { data, error } = await getDocs(query(collection(db, 'singleton'), where('id', '==', 'aboutCTA'), limit(1))).then(snap => ({ data: snap.docs[0]?.data(), error: null }));
    if (data) setForm(data as any);
    if (error) handleFirestoreError(error, OperationType.GET, 'singleton/aboutCTA');
  };

  useEffect(() => {
    fetchCTA();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'singleton', { 
        id: 'aboutCTA',
        title: form.title || '',
        subTitle: form.subTitle || '',
        buttonText: form.buttonText || '',
        image: form.image || '',
        logo: form.logo || '',
        updatedAt: Date.now() 
      }.id), { 
        id: 'aboutCTA',
        title: form.title || '',
        subTitle: form.subTitle || '',
        buttonText: form.buttonText || '',
        image: form.image || '',
        logo: form.logo || '',
        updatedAt: Date.now() 
      }); const error = null;
      if (error) throw error;
      alert("Saved!");
      fetchCTA();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'singleton/aboutCTA');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold font-serif mb-6">About Page CTA</h2>
      <div className="bg-slate-900 shadow-xl border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <input className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">Sub Title</label>
            <input className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all" placeholder="Sub Title" value={form.subTitle} onChange={e => setForm({...form, subTitle: e.target.value})} />
          </div>
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-slate-300 mb-2">Button Text</label>
            <input className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all" placeholder="Button Text" value={form.buttonText} onChange={e => setForm({...form, buttonText: e.target.value})} />
          </div>
          <div className="md:col-span-1">
             <label className="block text-sm font-medium text-slate-300 mb-2">Background Image</label>
             <ImageUpload value={form.image} onChange={val => setForm({...form, image: val})} label="Select Background Image" aspectRatio="16/9" />
          </div>
          <div className="md:col-span-1">
             <label className="block text-sm font-medium text-slate-300 mb-2">Background Logo (Optional)</label>
             <ImageUpload value={form.logo || ''} onChange={val => setForm({...form, logo: val})} label="Select Logo" aspectRatio="1/1" />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-white/10">
          <button onClick={handleSave} className="bg-baf-cyan text-slate-900 font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-baf-cyan/80 transition-all">
            <Save className="w-5 h-5" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BlogContentEditor ──────────────────────────────────────────────────────
// Blog content textarea with hyperlink insertion helper.
// Admin "[text](url)" format → rendered as <a> in blog detail page.
function BlogContentEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [showLinkHelper, setShowLinkHelper] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Generic helper: wraps the current selection with a prefix/suffix pair,
  // or inserts a placeholder + prefix at the cursor if nothing is selected.
  // Used by the Bold/Heading/Subtitle/Quote quick-insert buttons.
  const insertWrap = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const ta = textareaRef.current;
    if (!ta) {
      onChange(value + prefix + placeholder + suffix);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end) || placeholder;
    const formatted = `${prefix}${selected}${suffix}`;
    const newVal = value.substring(0, start) + formatted + value.substring(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      // Select the inserted/placeholder text so the writer can type over it.
      ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  // Line-prefix helper for block-level syntax (##, ###, >) — always applies
  // at the start of the current line, not mid-line.
  const insertLinePrefix = (prefix: string, placeholder: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      onChange(value + `\n${prefix}${placeholder}\n`);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const selected = value.substring(start, end) || placeholder;
    const before = value.substring(0, lineStart);
    const after = value.substring(end);
    const formatted = `${prefix}${selected}`;
    const newVal = before + formatted + after;
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length + selected.length);
    }, 0);
  };

  const insertLink = () => {
    if (!linkText || !linkUrl) return;
    const formatted = `[${linkText}](${linkUrl})`;
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.substring(0, start) + formatted + value.substring(end);
      onChange(newVal);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + formatted.length, start + formatted.length);
      }, 0);
    } else {
      onChange(value + formatted);
    }
    setLinkText('');
    setLinkUrl('');
    setShowLinkHelper(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">Format:</span>
        <code className="text-xs bg-slate-800 text-baf-cyan px-2 py-0.5 rounded font-mono">## Heading</code>
        <code className="text-xs bg-slate-800 text-baf-cyan px-2 py-0.5 rounded font-mono">### Subtitle</code>
        <code className="text-xs bg-slate-800 text-baf-cyan px-2 py-0.5 rounded font-mono">**bold**</code>
        <code className="text-xs bg-slate-800 text-baf-cyan px-2 py-0.5 rounded font-mono">&gt; quote</code>
        <code className="text-xs bg-slate-800 text-baf-cyan px-2 py-0.5 rounded font-mono">[লেখা](https://url.com)</code>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => insertWrap('**', '**', 'bold text')}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 text-white hover:bg-white/10 transition border border-white/10"
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix('## ', 'Heading')}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 text-white hover:bg-white/10 transition border border-white/10"
        >
          Heading
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix('### ', 'Subtitle')}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 text-baf-cyan hover:bg-white/10 transition border border-white/10"
        >
          Subtitle
        </button>
        <button
          type="button"
          onClick={() => insertLinePrefix('> ', 'quoted line')}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 text-white hover:bg-white/10 transition border border-white/10"
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => setShowLinkHelper(h => !h)}
          className="ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-baf-cyan/10 text-baf-cyan hover:bg-baf-cyan/20 transition border border-baf-cyan/20"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1" /></svg>
          Insert Link
        </button>
      </div>

      {showLinkHelper && (
        <div className="bg-slate-800/60 border border-baf-cyan/20 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1 block">Link Text (দেখানো লেখা)</label>
            <input
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-baf-cyan outline-none"
              placeholder="যেমন: এখানে ক্লিক করুন"
              value={linkText}
              onChange={e => setLinkText(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1 block">URL (লিংক)</label>
            <input
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-baf-cyan outline-none"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={insertLink}
            disabled={!linkText || !linkUrl}
            className="bg-baf-cyan text-slate-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-baf-cyan/80 disabled:opacity-40 disabled:cursor-not-allowed transition whitespace-nowrap"
          >
            Insert
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 h-64 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all font-mono text-sm leading-relaxed"
        placeholder="Blog content লিখুন... ## Heading, ### Subtitle, **bold**, > quote, [লেখা](https://url.com)"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

function GenericManager({ collectionName, title, struct, isBlog = false, defaultItems }: { collectionName: string, title: string, struct: any, isBlog?: boolean, defaultItems?: any[] }) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState(struct);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const _snap = await getDocs(query(collection(db, String(collectionName)), orderBy('createdAt', 'desc')));
      const data = _snap.docs.map(d=>({ ...d.data(), id: d.id }));
      if (data.length === 0 && defaultItems && defaultItems.length > 0) {
        setItems(defaultItems.map((d, i) => ({ id: `default-${i}`, ...d })));
      } else {
        setItems(data);
      }
    } catch (error) {
      console.error(error);
      if (defaultItems && items.length === 0) setItems(defaultItems.map((d, i) => ({ id: `default-${i}`, ...d })));
    }
  };

  useEffect(() => {
    fetchItems();
  }, [collectionName]);

  const handleLoadDefaults = async () => {
    if (!defaultItems || defaultItems.length === 0) return;
    try {
      const inserts = defaultItems.map((d, i) => ({ id: `${collectionName}-default-${i}`, ...d, createdAt: Date.now() + i }));
      const promises = inserts.map((item: any) => setDoc(doc(db, String(collectionName), String(item.id)), item)); await Promise.all(promises); const error = null;
      if (error) throw error;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, collectionName);
    }
    fetchItems();
  };

  // Input length limits: prevent oversized content in Firestore docs
  const FIELD_LIMITS: Record<string, number> = {
    name: 200, title: 300, role: 200, question: 500, author: 200,
    caption: 300, speech: 2000, answer: 5000, content: 50000,
    description: 5000, url: 2048, image: 5000000, logo: 5000000,
    venue: 300, speaker: 200, registrationLink: 2048, year: 10,
    time: 50, date: 50, type: 50,
  };

  const handleSave = async () => {
    // Server-side style validation: enforce field limits before writing to Firestore
    for (const key of Object.keys(struct)) {
      const val = form[key] || '';
      const limit = FIELD_LIMITS[key] ?? 2000;
      if (typeof val === 'string' && val.length > limit) {
        alert(`"${key}" exceeds maximum allowed length of ${limit} characters.`);
        return;
      }
    }
    try {
      const saveData: any = {};
      Object.keys(struct).forEach(key => {
        // Sanitize: trim strings; reject any non-string non-null value for safety
        const raw = form[key];
        saveData[key] = typeof raw === 'string' ? raw.trim() : (raw ?? '');
      });

      if (editingId && !editingId.toString().startsWith('default-')) {
        await updateDoc(doc(db, String(collectionName), String(editingId)), { ...saveData, createdAt: Date.now() });
      } else {
        const id = `${collectionName}-${Date.now()}`;
        await setDoc(doc(db, String(collectionName), String(id)), { id, ...saveData, createdAt: Date.now() });
      }
      setForm(struct);
      setEditingId(null);
      fetchItems();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, collectionName);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete image from Firebase Storage if exists
      const item = items.find(i => i.id === id);
      if (item) {
        const imageUrl = item.image || item.url || item.logo;
        if (imageUrl) await deleteStorageFile(imageUrl);
      }
      await deleteDoc(doc(db, String(collectionName), String(id)));
      fetchItems();
    }
    catch (e) { handleFirestoreError(e, OperationType.DELETE, `${collectionName}/${id}`); }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold font-serif">{title}</h2>
        {(items.length === 0 || items.some(i => i.id?.toString().startsWith('default-'))) && defaultItems && (
           <button onClick={handleLoadDefaults} className="text-sm font-medium text-baf-cyan hover:text-white transition">Load Defaults</button>
        )}
      </div>
      
      <div className="bg-slate-900 shadow-xl border border-white/10 rounded-3xl p-6 lg:p-8 mb-8 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4 mb-4">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(struct).map(key => {
          if (key === 'content' || key === 'description' || key === 'speech' || key === 'answer') return (
            <div key={key} className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">{key}</label>
              {isBlog && key === 'content' ? (
                <BlogContentEditor value={form[key]} onChange={val => setForm({...form, [key]: val})} />
              ) : (
                <textarea className={`w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 ${isBlog ? 'h-64' : 'h-32'} focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all`} placeholder={`Enter ${key}...`} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
              )}
            </div>
          );
          if (key === 'image' || key === 'url' || key === 'logo') return (
            <div key={key} className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">{key}</label>
               <ImageUpload value={form[key]} onChange={val => setForm({...form, [key]: val})} label={`Upload ${key}`} />
            </div>
          );
          // Blog author social links
          if (isBlog && key === 'authorLinkedIn') return (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <span className="text-baf-cyan">in</span> Author LinkedIn URL <span className="text-slate-500 text-xs">(optional)</span>
              </label>
              <input className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all" placeholder="https://linkedin.com/in/username" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
            </div>
          );
          if (isBlog && key === 'authorPortfolio') return (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <span className="text-baf-cyan">🔗</span> Author Portfolio URL <span className="text-slate-500 text-xs">(optional)</span>
              </label>
              <input className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all" placeholder="https://yourportfolio.com" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
            </div>
          );
          // Blog date field: use date picker
          if (isBlog && key === 'date') return (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-baf-cyan" /> Publication Date
              </label>
              <input
                type="date"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all text-white [color-scheme:dark]"
                value={form[key]}
                onChange={e => setForm({...form, [key]: e.target.value})}
              />
            </div>
          );
          return (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">{key}</label>
              <input className={`w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all`} placeholder={`Enter ${key}...`} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
            </div>
          );
        })}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          {editingId && <button onClick={() => { setEditingId(null); setForm(struct); }} className="px-6 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition">Cancel</button>}
          <button onClick={handleSave} className="bg-baf-cyan text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-baf-cyan/80 transition-all flex items-center gap-2">
             <Save className="w-5 h-5"/> {editingId ? 'Update Item' : 'Add New Item'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-slate-900 shadow-lg rounded-3xl overflow-hidden border border-white/10 flex flex-col group">
            {(item.image || item.url || item.logo) && (
              <div className="aspect-video w-full bg-slate-950 flex flex-col justify-center items-center relative">
                <img src={item.image || item.url || item.logo || undefined} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            <div className="p-6 flex-grow flex flex-col gap-2">
              {item.title || item.name || item.caption || item.question ? <h4 className="font-bold text-lg text-white leading-snug">{item.title || item.name || item.caption || item.question}</h4> : null}
              {item.author || item.role ? <p className="text-baf-cyan text-xs font-bold uppercase tracking-wider">{item.author || item.role}</p> : null}
              {(item.content || item.description || item.speech || item.answer) && <p className="text-sm text-slate-400 line-clamp-3 mt-1 leading-relaxed">{item.content || item.description || item.speech || item.answer}</p>}
            </div>
            <div className="p-4 bg-slate-950/50 border-t border-white/5 flex gap-2 justify-end">
              <button title="Edit" onClick={() => { setForm(item); setEditingId(item.id); window.scrollTo({top: 0, behavior:'smooth'}) }} className="bg-slate-800 text-slate-300 p-2 rounded-xl hover:bg-slate-700 hover:text-white transition"><Edit className="w-4 h-4" /></button>
              <button title="Delete" onClick={() => handleDelete(item.id)} className="bg-red-500/10 text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificateManager() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold font-serif mb-6">E-Certificate Settings</h2>
      <div className="bg-slate-900 shadow-xl border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6">
        <p className="text-slate-300 leading-relaxed">
          Certificate submissions are now collected through the website. Google Form, Google Sheet, and AutoCrat configuration are managed externally.
        </p>
      </div>
    </div>
  );
}
