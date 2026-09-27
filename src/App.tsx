import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowRight,
  BatteryCharging,
  Check,
  Clock3,
  Coffee,
  Instagram,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Minus,
  Moon,
  Navigation,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  Utensils,
  Wifi,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type Category = 'Coffee' | 'Non-Coffee' | 'Main Course' | 'Snacks';
type MenuItem = {
  id: string;
  name: string;
  category: Category;
  description: string;
  price: number;
  bestSeller?: boolean;
  photo: string;
  tone: string;
};

const makePhoto = (name: string, color: string, accent: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 520"><rect width="720" height="520" fill="${color}"/><circle cx="590" cy="90" r="165" fill="${accent}" opacity=".26"/><circle cx="110" cy="460" r="210" fill="${accent}" opacity=".18"/><path d="M210 335c0-65 46-117 103-117s103 52 103 117" fill="#faf6ec" opacity=".94"/><path d="M204 334h218v18c0 54-40 98-109 98s-109-44-109-98z" fill="#faf6ec" opacity=".94"/><path d="M422 264h36c34 0 49 24 49 50s-16 49-49 49h-34" fill="none" stroke="#faf6ec" stroke-width="18" stroke-linecap="round"/><ellipse cx="312" cy="337" rx="109" ry="17" fill="${accent}" opacity=".75"/><text x="38" y="70" fill="#faf6ec" font-family="Georgia, serif" font-size="42" font-style="italic">${name}</text></svg>`)}`;

const menuItems: MenuItem[] = [
  { id: 'es-kopi-susu', name: 'Es Kopi Susu Noha', category: 'Coffee', description: 'Espresso, susu segar, dan gula aren. House classic yang selalu dicari.', price: 24000, bestSeller: true, photo: makePhoto('Noha', '#24483f', '#d66f3c'), tone: 'green' },
  { id: 'kopi-susu-pandan', name: 'Kopi Susu Pandan', category: 'Coffee', description: 'Creamy, wangi pandan, dengan espresso yang tetap berani.', price: 27000, bestSeller: true, photo: makePhoto('Pandan', '#346058', '#f0b87a'), tone: 'teal' },
  { id: 'americano', name: 'Americano', category: 'Coffee', description: 'Double shot espresso dan air mineral dingin atau panas.', price: 22000, photo: makePhoto('Black', '#3b2d28', '#bd6945'), tone: 'brown' },
  { id: 'cappuccino', name: 'Cappuccino', category: 'Coffee', description: 'Espresso dengan microfoam lembut dan taburan kakao.', price: 28000, photo: makePhoto('Foam', '#9d674c', '#f2cf9c'), tone: 'tan' },
  { id: 'matcha-cloud', name: 'Matcha Cloud', category: 'Non-Coffee', description: 'Uji matcha, susu segar, dan cloud foam yang ringan.', price: 29000, bestSeller: true, photo: makePhoto('Cloud', '#6f8b72', '#e6c779'), tone: 'sage' },
  { id: 'chocolate-noha', name: 'Chocolate Noha', category: 'Non-Coffee', description: 'Cokelat pekat, susu, sedikit garam laut. Comfort in a cup.', price: 27000, photo: makePhoto('Cocoa', '#5d3c34', '#d18a59'), tone: 'cocoa' },
  { id: 'lychee-tea', name: 'Lychee Tea', category: 'Non-Coffee', description: 'Teh melati dingin dengan leci dan citrus yang segar.', price: 23000, photo: makePhoto('Lychee', '#9f6f58', '#f1c4ab'), tone: 'rose' },
  { id: 'nasi-goreng-noha', name: 'Nasi Goreng Noha', category: 'Main Course', description: 'Nasi goreng kampung, telur mata sapi, ayam suwir, acar.', price: 38000, bestSeller: true, photo: makePhoto('Goreng', '#9a563e', '#f1c16f'), tone: 'orange' },
  { id: 'noha-chicken-rice', name: 'Noha Chicken Rice', category: 'Main Course', description: 'Ayam panggang madu, nasi wangi, telur, dan sambal matah.', price: 42000, photo: makePhoto('Chicken', '#6d5740', '#db9762'), tone: 'wood' },
  { id: 'beef-blackpepper', name: 'Beef Black Pepper', category: 'Main Course', description: 'Irisan beef lada hitam di atas nasi hangat dan sayur tumis.', price: 47000, photo: makePhoto('Beef', '#433d36', '#ce7b58'), tone: 'charcoal' },
  { id: 'pisang-cokelat', name: 'Pisang Cokelat Keju', category: 'Snacks', description: 'Pisang karamel, cokelat leleh, dan keju parut melimpah.', price: 26000, bestSeller: true, photo: makePhoto('Pisang', '#b47845', '#f5d58b'), tone: 'gold' },
  { id: 'noha-fries', name: 'Noha Fries', category: 'Snacks', description: 'Kentang renyah dengan garlic mayo dan bubuk cabai.', price: 25000, photo: makePhoto('Fries', '#70634b', '#eab569'), tone: 'olive' },
];

const categories: Category[] = ['Coffee', 'Non-Coffee', 'Main Course', 'Snacks'];
const formatIDR = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;
const WHATSAPP_NUMBER = '6281290004421';

function Home() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('kopi-noha-theme') === 'dark');
  const [activeCategory, setActiveCategory] = useState<Category>('Coffee');
  const [bestSellerOnly, setBestSellerOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('kopi-noha-cart') ?? '{}'); } catch { return {}; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [showReservation, setShowReservation] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('kopi-noha-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => { localStorage.setItem('kopi-noha-cart', JSON.stringify(cart)); }, [cart]);

  const cartItems = useMemo(
    () => menuItems.filter((item) => cart[item.id]).map((item) => ({ ...item, quantity: cart[item.id] })),
    [cart],
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const filteredItems = useMemo(() => menuItems.filter((item) => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch = `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch && (!bestSellerOnly || item.bestSeller);
  }), [activeCategory, bestSellerOnly, search]);

  const updateCart = (id: string, change: number) => {
    setCart((current) => {
      const next = Math.max(0, (current[id] ?? 0) + change);
      const copy = { ...current };
      if (next === 0) delete copy[id]; else copy[id] = next;
      return copy;
    });
    if (change > 0) {
      setNotice('Ditambahkan ke pesanan');
      window.setTimeout(() => setNotice(''), 1800);
    }
  };

  const whatsappOrder = () => {
    const lines = cartItems.map((item) => `• ${item.name} x${item.quantity} — ${formatIDR(item.price * item.quantity)}`);
    const message = `Halo Kopi Noha Kemanggisan, saya mau order:\n${lines.join('\n')}\n\nTotal: ${formatIDR(cartTotal)}\n\nMohon konfirmasi ya.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="grain min-h-[100dvh] overflow-x-hidden bg-background text-foreground transition-colors duration-500">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <button data-testid="button-logo-home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center gap-2 text-left">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm"><Coffee size={18} strokeWidth={2.5} /></span>
            <span><span className="block font-display text-[23px] leading-none">Kopi Noha</span><span className="font-mono-custom text-[9px] uppercase tracking-[.18em] text-muted-foreground">Kemanggisan / 24 jam</span></span>
          </button>
          <nav className="hidden items-center gap-7 md:flex">
            <button data-testid="button-nav-menu" onClick={() => scrollTo('menu')} className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">Menu</button>
            <button data-testid="button-nav-workspace" onClick={() => scrollTo('workspace')} className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">Workspace</button>
            <button data-testid="button-nav-location" onClick={() => scrollTo('location')} className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">Lokasi</button>
          </nav>
          <div className="flex items-center gap-2">
            <button data-testid="button-toggle-theme" aria-label={isDark ? 'Gunakan mode terang' : 'Gunakan mode gelap'} onClick={() => setIsDark((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:bg-secondary">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button data-testid="button-open-cart-header" onClick={() => setCartOpen(true)} className="relative hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-bold text-background sm:flex">
              <ShoppingBag size={16} /> Pesanan
              {cartCount > 0 && <span data-testid="badge-cart-count-header" className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{cartCount}</span>}
            </button>
            <button data-testid="button-mobile-menu" aria-label="Buka navigasi" onClick={() => setMobileMenuOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full border border-border md:hidden">
              {mobileMenuOpen ? <X size={19} /> : <MenuIcon size={19} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="border-t border-border bg-background px-5 py-4 md:hidden">
              <div className="flex flex-col gap-1">
                {['menu', 'workspace', 'location'].map((section) => <button key={section} data-testid={`button-mobile-nav-${section}`} onClick={() => scrollTo(section)} className="rounded-lg px-3 py-3 text-left text-sm font-semibold capitalize hover:bg-secondary">{section}</button>)}
                <button data-testid="button-mobile-cart" onClick={() => { setCartOpen(true); setMobileMenuOpen(false); }} className="mt-2 flex items-center justify-between rounded-lg bg-foreground px-3 py-3 text-sm font-bold text-background"><span className="flex items-center gap-2"><ShoppingBag size={16} /> Pesanan kamu</span><span>{cartCount} item</span></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="relative mx-auto grid min-h-[760px] max-w-[1240px] items-center gap-10 px-5 pb-16 pt-32 lg:grid-cols-[1.03fr_.97fr] lg:px-8 lg:pb-24 lg:pt-36">
          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }} className="mb-7 flex items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono-custom text-[10px] uppercase tracking-[.16em] text-primary"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Open 24 hours</span>
              <span className="font-mono-custom text-[10px] uppercase tracking-[.14em] text-muted-foreground">West Jakarta, ID</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .08 }} className="max-w-[660px] text-balance font-display text-[clamp(3.8rem,9vw,7.8rem)] leading-[.82] tracking-[-.04em]">
              24/7 Workspace <span className="text-primary">&</span><br /><em className="text-muted-foreground">Specialty Coffee</em><br />in Kemanggisan
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .35 }} className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">Tempat favorit buat nugas, nongkrong, dan ngopi kapan aja.</motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45 }} className="mt-9 flex flex-wrap items-center gap-3">
              <button data-testid="button-hero-menu" onClick={() => scrollTo('menu')} className="group flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">Lihat Menu &amp; Order <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></button>
              <button data-testid="button-hero-reservation" onClick={() => setShowReservation(true)} className="flex items-center gap-2 rounded-full border border-border px-5 py-3.5 text-sm font-bold transition-colors hover:bg-secondary"><MessageCircle size={17} className="text-accent" /> Reservasi Tempat / WhatsApp</button>
            </motion.div>
            <div className="mt-14 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-5">
              <div data-testid="highlight-hours"><Clock3 size={18} className="mb-3 text-primary" /><p className="font-display text-xl">Open 24 Hours</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Selalu ada, bahkan saat deadline datang.</p></div>
              <div data-testid="highlight-wifi"><Wifi size={18} className="mb-3 text-accent" /><p className="font-display text-xl">Fast Wi-Fi &amp; Power Outlets</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Stabil untuk kerja dan kelas online.</p></div>
              <div data-testid="highlight-power"><Zap size={18} className="mb-3 text-primary" /><p className="font-display text-xl">Indoor &amp; Outdoor Spot</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Pilih spot yang pas buat fokus atau santai.</p></div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: .94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: .8, delay: .15 }} className="relative min-h-[390px] lg:min-h-[590px]">
            <div className="absolute right-0 top-0 h-[86%] w-[83%] overflow-hidden rounded-[48%_48%_12%_12%/28%_28%_10%_10%] bg-[#b86948] shadow-2xl shadow-[#9c583d]/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_38%,rgba(246,213,158,.65),transparent_18%),linear-gradient(135deg,rgba(41,57,49,.12),rgba(255,221,177,.12))]" />
              <div className="absolute left-[22%] top-[27%] h-40 w-40 rounded-full border-[18px] border-[#f5d69d]/80 bg-[#7f4c35] shadow-[inset_0_-16px_0_rgba(32,26,20,.25)] sm:h-56 sm:w-56" />
              <div className="absolute left-[28%] top-[33%] h-28 w-28 rounded-full bg-[#e8bd7e] opacity-40 blur-md sm:h-40 sm:w-40" />
              <div className="absolute bottom-[9%] right-[11%] rounded-full bg-[#253f38] px-5 py-3 font-display text-xl italic text-[#f8e6c2]">stay a little longer.</div>
            </div>
            <div className="absolute bottom-[1%] left-0 w-[52%] rounded-2xl border border-border bg-card p-4 shadow-xl shadow-foreground/10 sm:p-5">
              <div className="mb-6 flex items-center justify-between"><span className="font-mono-custom text-[10px] uppercase tracking-[.15em] text-muted-foreground">House pour</span><Coffee size={18} className="text-primary" /></div>
              <p className="font-display text-3xl">good coffee<br /><span className="text-primary">after dark.</span></p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-accent" /> Espresso bar is on</div>
            </div>
            <div className="absolute right-[4%] top-[4%] grid h-20 w-20 rotate-12 place-items-center rounded-full border border-primary bg-background font-mono-custom text-center text-[10px] uppercase leading-tight tracking-[.12em] text-primary shadow-lg">kopi<br />nugas<br />ulang</div>
          </motion.div>
        </section>

        <section id="workspace" className="border-y border-border bg-secondary/35">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-20 lg:grid-cols-[.75fr_1.25fr] lg:px-8 lg:py-28">
            <div>
              <p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-primary">THE LATE-NIGHT ADVANTAGE</p>
              <h2 className="mt-4 max-w-sm font-display text-5xl leading-[.9] sm:text-6xl">WFC-friendly,<br /><em className="text-muted-foreground">no excuses.</em></h2>
              <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">Bukan cuma tempat ngopi. Noha dibuat buat kamu yang butuh meja, koneksi, dan suasana yang tetap hidup sampai pagi.</p>
              <button data-testid="button-workspace-reserve" onClick={() => setShowReservation(true)} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">Booking spot untuk malam ini <ArrowDownRight size={16} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Wifi, title: 'High-speed Wi-Fi & Power Plugs', body: 'Kerja, meeting, dan upload tugas tanpa menatap ikon loading.', color: 'text-accent' },
                { icon: Clock3, title: 'Open 24/7', body: 'Datang jam 11 malam atau 4 pagi. Lampu kami tetap menyala.', color: 'text-primary' },
                { icon: Utensils, title: 'Specialty Coffee & Heavy Meals', body: 'Menu yang mengenyangkan, bukan sekadar teman untuk foto kopi.', color: 'text-primary' },
                { icon: Wind, title: 'Outdoor Smoking & Air-Conditioned Indoor Area', body: 'Pilih udara terbuka untuk rehat atau ruangan sejuk untuk fokus.', color: 'text-accent' },
              ].map((item, index) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-1">
                  <item.icon size={23} className={item.color} />
                  <h3 className="mt-10 font-display text-2xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="menu" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 py-20 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div><p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-primary">THE MENU / PILIH MOOD</p><h2 className="mt-3 font-display text-6xl leading-none sm:text-7xl">Makan dulu,<br /><em className="text-muted-foreground">baru lanjut.</em></h2></div>
            <div className="max-w-xs text-sm leading-relaxed text-muted-foreground">Dari espresso buat kickstart sampai nasi goreng buat shift panjang. Harga sudah termasuk service.</div>
          </div>
          <div className="sticky top-[70px] z-20 -mx-5 mt-10 border-y border-border bg-background/90 px-5 py-3 backdrop-blur-xl lg:-mx-8 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((category) => <button key={category} data-testid={`button-category-${category.toLowerCase().replace(' ', '-')}`} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${activeCategory === category ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>{category}</button>)}
              </div>
              <div className="flex gap-2">
                <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 lg:w-48 lg:flex-none"><Search size={16} className="shrink-0 text-muted-foreground" /><input data-testid="input-menu-search" aria-label="Cari menu" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari menu..." className="min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label>
                <button data-testid="button-filter-best-seller" onClick={() => setBestSellerOnly((value) => !value)} className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition-colors ${bestSellerOnly ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground'}`}><Sparkles size={14} /> Best Seller</button>
              </div>
            </div>
          </div>
          <AnimatePresence mode="popLayout">
            {filteredItems.length > 0 ? (
              <motion.div layout className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item, index) => <MenuCard key={item.id} item={item} quantity={cart[item.id] ?? 0} onAdd={() => updateCart(item.id, 1)} onDecrease={() => updateCart(item.id, -1)} index={index} />)}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-9 rounded-3xl border border-dashed border-border bg-secondary/30 px-5 py-20 text-center"><Search size={25} className="mx-auto text-muted-foreground" /><p data-testid="status-no-results" className="mt-4 font-display text-3xl">Menu-nya ngumpet?</p><p className="mt-2 text-sm text-muted-foreground">Coba kata lain atau matikan filter Best Seller.</p><button data-testid="button-reset-menu-filter" onClick={() => { setSearch(''); setBestSellerOnly(false); }} className="mt-5 text-sm font-bold text-primary hover:underline">Reset filter</button></motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="relative overflow-hidden bg-[#263f38] text-[#f8e7c8]">
          <div className="absolute -right-20 top-[-110px] h-80 w-80 rounded-full border-[50px] border-[#d67348]/25" />
          <div className="mx-auto grid max-w-[1240px] gap-9 px-5 py-20 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-24">
            <div><p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-[#d99a69]">KOPI NOHA AFTER HOURS</p><h2 className="mt-4 max-w-2xl font-display text-6xl leading-[.88] sm:text-8xl">Tempat pulang<br /><em className="text-[#d99a69]">sebelum pulang.</em></h2><p className="mt-7 max-w-md leading-relaxed text-[#d7d3bd]/80">Ada jam-jam ketika rumah terlalu sunyi dan coworking space sudah tutup. Di sini, kamu tidak perlu menjelaskan kenapa masih bangun.</p></div>
            <div className="flex flex-col items-start gap-4 lg:items-end"><div className="rounded-full border border-[#d99a69]/60 px-4 py-2 font-mono-custom text-[10px] uppercase tracking-[.15em] text-[#d99a69]">Open all night / every day</div><button data-testid="button-dark-reservation" onClick={() => setShowReservation(true)} className="flex items-center gap-3 rounded-full bg-[#d67348] px-6 py-3.5 text-sm font-bold text-[#281c17] transition-transform hover:-translate-y-0.5">Reservasi meja <ArrowRight size={17} /></button></div>
          </div>
        </section>

        <section id="location" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-primary">FIND US WHENEVER</p><h2 className="mt-4 font-display text-6xl leading-[.88]">Dekat dari<br /><em className="text-muted-foreground">mana-mana.</em></h2><div className="mt-8 flex gap-3"><MapPin className="mt-1 shrink-0 text-primary" size={20} /><div><p data-testid="text-location-address" className="font-semibold">Jl. Kemanggisan Raya</p><p className="text-sm text-muted-foreground">Jakarta Barat, DKI Jakarta 11480</p><a data-testid="link-open-maps" href="https://maps.google.com/?q=Kopi+Noha+Kemanggisan" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">Buka di Google Maps <Navigation size={14} /></a></div></div><div className="mt-10 flex items-center gap-3 border-t border-border pt-5"><Instagram size={18} className="text-primary" /><a data-testid="link-instagram" href="https://instagram.com/kopinoha.kemanggisan" target="_blank" rel="noreferrer" className="font-mono-custom text-sm hover:text-primary">@kopinoha.kemanggisan</a></div></div>
            <div data-testid="map-placeholder" className="relative min-h-[330px] overflow-hidden rounded-[2rem] border border-border bg-[#d5cbb4] dark:bg-[#33433d]">
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(32deg,transparent_47%,hsl(var(--primary))_48%,transparent_50%),linear-gradient(110deg,transparent_45%,hsl(var(--accent))_46%,transparent_49%),linear-gradient(5deg,transparent_62%,hsl(var(--foreground)/.2)_63%,transparent_64%)] [background-size:150px_150px,220px_180px,180px_200px]" />
              <div className="absolute left-[48%] top-[42%] grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg"><MapPin size={23} fill="currentColor" /></div>
              <div className="absolute bottom-5 left-5 rounded-xl border border-border/50 bg-background/90 px-4 py-3 backdrop-blur"><p className="font-mono-custom text-[9px] uppercase tracking-[.16em] text-primary">MAP PLACEHOLDER</p><p className="mt-1 text-sm font-bold">Kopi Noha Kemanggisan</p></div>
              <div className="absolute right-5 top-5 rounded-full bg-background/85 px-3 py-1.5 font-mono-custom text-[9px] uppercase tracking-[.14em] backdrop-blur">24.00 / 7.00</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-secondary/35">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between lg:px-8"><div><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"><Coffee size={15} /></span><span className="font-display text-2xl">Kopi Noha</span></div><p className="mt-3 max-w-xs text-sm text-muted-foreground">Tempat nugas, nongkrong, dan ngopi kapan aja.</p></div><div className="text-left sm:text-right"><p className="font-mono-custom text-[10px] uppercase tracking-[.14em] text-muted-foreground">Custom IT Solutions powered by <span className="text-foreground">Northstar Studio</span></p><p className="mt-2 text-xs text-muted-foreground">© 2024 Kopi Noha Kemanggisan. Made for the night owls.</p></div></div>
      </footer>

      {cartCount > 0 && !cartOpen && <motion.button initial={{ y: 80 }} animate={{ y: 0 }} data-testid="button-floating-cart" onClick={() => setCartOpen(true)} className="fixed bottom-5 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-full bg-foreground px-5 py-3.5 text-background shadow-2xl shadow-foreground/20 sm:left-auto sm:right-5 sm:w-auto sm:translate-x-0"><span className="flex items-center gap-2 text-sm font-bold"><ShoppingBag size={17} /><span data-testid="text-floating-cart-count">{cartCount} item di pesanan</span></span><span className="font-mono-custom text-xs">{formatIDR(cartTotal)}</span></motion.button>}

      <AnimatePresence>
        {cartOpen && <CartDrawer items={cartItems} total={cartTotal} onClose={() => setCartOpen(false)} onChange={updateCart} orderHref={whatsappOrder()} />}
        {showReservation && <ReservationModal onClose={() => setShowReservation(false)} />}
        {notice && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} data-testid="status-cart-notice" className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-xl">{notice}</motion.div>}
      </AnimatePresence>
    </div>
  );
}

function MenuCard({ item, quantity, onAdd, onDecrease, index }: { item: MenuItem; quantity: number; onAdd: () => void; onDecrease: () => void; index: number }) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ delay: index * .04 }} data-testid={`card-menu-${item.id}`} className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl hover:shadow-foreground/5">
      <div className="relative aspect-[1.45] overflow-hidden"><img data-testid={`img-menu-${item.id}`} src={item.photo} alt={`${item.name} — Kopi Noha`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />{item.bestSeller && <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 font-mono-custom text-[9px] uppercase tracking-[.1em] text-primary backdrop-blur"><Sparkles size={11} /> Best seller</span>}</div>
      <div className="p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><h3 data-testid={`text-menu-name-${item.id}`} className="font-display text-2xl leading-none">{item.name}</h3><p className="mt-2 max-w-[245px] text-xs leading-relaxed text-muted-foreground">{item.description}</p></div><span data-testid={`text-menu-price-${item.id}`} className="shrink-0 font-mono-custom text-xs font-medium text-primary">{formatIDR(item.price)}</span></div><div className="mt-5 flex items-center justify-between">{quantity > 0 ? <div className="flex items-center gap-3 rounded-full bg-secondary px-2 py-1"><button data-testid={`button-decrease-${item.id}`} aria-label={`Kurangi ${item.name}`} onClick={onDecrease} className="grid h-7 w-7 place-items-center rounded-full hover:bg-background"><Minus size={14} /></button><span data-testid={`text-quantity-${item.id}`} className="min-w-4 text-center text-sm font-bold">{quantity}</span><button data-testid={`button-increase-${item.id}`} aria-label={`Tambah ${item.name}`} onClick={onAdd} className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background"><Plus size={14} /></button></div> : <button data-testid={`button-add-${item.id}`} onClick={onAdd} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground">Tambah <Plus size={14} /></button>}<span className="font-mono-custom text-[9px] uppercase tracking-[.1em] text-muted-foreground">{item.category}</span></div></div>
    </motion.article>
  );
}

function CartDrawer({ items, total, onClose, onChange, orderHref }: { items: Array<MenuItem & { quantity: number }>; total: number; onClose: () => void; onChange: (id: string, change: number) => void; orderHref: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 27, stiffness: 250 }} onClick={(event) => event.stopPropagation()} className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-5"><div><p className="font-mono-custom text-[10px] uppercase tracking-[.16em] text-primary">YOUR ORDER</p><h2 className="mt-1 font-display text-3xl">Pesanan kamu</h2></div><button data-testid="button-close-cart" aria-label="Tutup pesanan" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-secondary"><X size={18} /></button></div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{items.length === 0 ? <div data-testid="empty-cart" className="flex h-full flex-col items-center justify-center text-center"><div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground"><ShoppingBag size={25} /></div><h3 className="mt-5 font-display text-3xl">Keranjang masih kosong</h3><p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">Tambahkan kopi atau makanan favoritmu dari menu.</p><button data-testid="button-empty-cart-back" onClick={onClose} className="mt-5 text-sm font-bold text-primary hover:underline">Kembali ke menu</button></div> : <div className="space-y-3">{items.map((item) => <div key={item.id} data-testid={`row-cart-${item.id}`} className="flex gap-3 rounded-xl border border-border bg-card p-3"><img src={item.photo} alt="" className="h-16 w-20 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-display text-xl">{item.name}</p><p className="mt-1 font-mono-custom text-xs text-primary">{formatIDR(item.price * item.quantity)}</p><div className="mt-2 flex items-center gap-2"><button data-testid={`button-cart-decrease-${item.id}`} onClick={() => onChange(item.id, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-secondary"><Minus size={12} /></button><span className="text-xs font-bold">{item.quantity}</span><button data-testid={`button-cart-increase-${item.id}`} onClick={() => onChange(item.id, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-background"><Plus size={12} /></button></div></div></div>)}</div>}</div>
        <div className="border-t border-border bg-secondary/40 px-5 py-5">{items.length > 0 && <><div className="mb-4 flex items-center justify-between"><span className="text-sm text-muted-foreground">Estimasi total</span><strong data-testid="text-cart-total" className="font-mono-custom text-lg">{formatIDR(total)}</strong></div><a data-testid="link-whatsapp-order" href={orderHref} target="_blank" rel="noreferrer" onClick={onClose} className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"><MessageCircle size={17} /> Order via WhatsApp</a><p className="mt-3 text-center text-[10px] leading-relaxed text-muted-foreground">Pesanan akan dikirim ke WhatsApp Kopi Noha untuk dikonfirmasi.</p></>}</div>
      </motion.aside>
    </motion.div>
  );
}

function ReservationModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [people, setPeople] = useState('2 orang');
  const [sent, setSent] = useState(false);
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Halo Kopi Noha, saya ${name || '[nama]'} mau reservasi meja untuk ${people}. Apakah masih tersedia?`)}`;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[55] grid place-items-center bg-foreground/45 px-5 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 16, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between"><div><p className="font-mono-custom text-[10px] uppercase tracking-[.16em] text-primary">BOOK A SPOT</p><h2 className="mt-2 font-display text-4xl">Malam ini di Noha?</h2></div><button data-testid="button-close-reservation" aria-label="Tutup reservasi" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-border"><X size={17} /></button></div>
        {sent ? <div className="py-10 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground"><Check size={24} /></div><h3 className="mt-5 font-display text-3xl">Siap, lanjut di WhatsApp.</h3><p className="mt-2 text-sm text-muted-foreground">Pesan reservasi kamu sudah disiapkan.</p><a data-testid="link-whatsapp-reservation" href={href} target="_blank" rel="noreferrer" onClick={onClose} className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground"><MessageCircle size={16} /> Buka WhatsApp</a></div> : <div className="mt-7 space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama</span><input data-testid="input-reservation-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama kamu" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-4" /></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Jumlah orang</span><select data-testid="select-reservation-people" value={people} onChange={(event) => setPeople(event.target.value)} className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none"><option>1 orang</option><option>2 orang</option><option>3–4 orang</option><option>5+ orang</option></select></label><button data-testid="button-submit-reservation" onClick={() => setSent(true)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground">Siapkan reservasi <ArrowRight size={16} /></button><p className="text-center text-[11px] text-muted-foreground">Kami akan balas secepatnya. Noha buka 24 jam.</p></div>}
      </motion.div>
    </motion.div>
  );
}

function Router() {
  return <ErrorBoundary resetKey={window.location.pathname}><Switch><Route path="/" component={Home} /><Route component={() => <NotFound />} /></Switch></ErrorBoundary>;
}

function NotFound() {
  const [, setLocation] = useLocation();
  return <div className="grid min-h-[100dvh] place-items-center bg-background px-5 text-center"><div><Coffee className="mx-auto text-primary" size={30} /><h1 className="mt-5 font-display text-6xl">404</h1><p className="mt-2 text-muted-foreground">Halaman ini tidak ada.</p><button data-testid="button-not-found-home" onClick={() => setLocation('/')} className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Kembali ke Noha</button></div></div>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;