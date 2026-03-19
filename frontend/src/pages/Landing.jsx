// src/pages/Landing.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Shield, Monitor, Mouse, Network, ClipboardList,
  FileText, BarChart2, CheckCircle, UserPlus, Menu, X,
  Users, Cpu, Wrench, Check, ChevronRight,
  LogIn, LayoutDashboard, Phone, Mail, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

/* ─────────────────────────── helpers ─────────────────────── */
function useCountUp(target, isInView, duration = 1500) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!isInView || started.current) return;
    started.current = true;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [isInView, target, duration]);

  return count;
}

/* ─────────────────────────── Stat Counter ─────────────────── */
function StatCounter({ value, label, suffix = '+' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericTarget = parseInt(value.replace(/\D/g, ''), 10);
  const count = useCountUp(numericTarget, isInView);
  const hasPercent = value.includes('%');

  return (
    <div ref={ref} className="flex flex-col items-center">
      <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
        {count}{hasPercent ? '%' : suffix}
      </span>
      <span className="text-indigo-200 text-xs md:text-sm mt-2 text-center font-medium">{label}</span>
    </div>
  );
}

/* ─────────────────────────── Feature Card ─────────────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const iconColors = [
  'bg-indigo-100 text-indigo-600',
  'bg-emerald-100 text-emerald-600',
  'bg-blue-100 text-blue-600',
  'bg-amber-100 text-amber-600',
  'bg-purple-100 text-purple-600',
  'bg-rose-100 text-rose-600',
];

function FeatureCard({ icon: Icon, title, desc, index }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }}
      className="bg-white dark:bg-surface-900 border border-slate-100 dark:border-surface-800 rounded-2xl p-6 cursor-default transition-shadow"
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${iconColors[index]}`}>
        <Icon size={22} />
      </div>
      <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ═══════════════════════════ LANDING PAGE ══════════════════════════ */
export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Navbar scroll effect */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Smart login handler */
  const handleLogin = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  /* ═══════════ NAVBAR ═══════════ */
  const Navbar = (
    <motion.nav
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'backdrop-blur-md bg-white/90 dark:bg-surface-950/90 shadow-sm border-b border-slate-100 dark:border-surface-800'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-indigo-500/20">
              <img src="/logo.png" alt="PCMS Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
            </div>
            <span className={`font-bold text-lg md:text-xl transition-colors group-hover:text-indigo-500 ${isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
              PCMS
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/submit-request')}
              className={`text-sm font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-slate-200 hover:text-white'
                }`}
            >
              Submit Request
            </button>
            <ThemeToggle className={isScrolled ? "" : "text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/10"} />
            <button
              onClick={handleLogin}
              className="btn-primary-premium text-sm px-6 py-2"
            >
              Login
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1 flex items-center gap-2"
          >
            <ThemeToggle className={isScrolled ? "" : "text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/10"} />
            {mobileOpen ? <X size={22} className={isScrolled ? 'text-slate-800 dark:text-white' : 'text-white'} /> : <Menu size={22} className={isScrolled ? 'text-slate-800 dark:text-white' : 'text-white'} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-surface-950 border-t border-slate-100 dark:border-surface-800 px-4 py-4 flex flex-col gap-3"
          >
            <button
              onClick={() => { navigate('/submit-request'); setMobileOpen(false); }}
              className="text-slate-700 dark:text-slate-300 text-sm font-medium text-left"
            >
              Submit Request
            </button>
            <button
              onClick={() => { handleLogin(); setMobileOpen(false); }}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg text-left"
            >
              Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );

  /* ═══════════ HERO ═══════════ */
  const Hero = (
    <section className="relative min-h-screen flex items-center overflow-hidden animate-gradient pt-16">
      {/* Animated blobs */}
      {[
        { className: 'w-96 h-96 bg-indigo-500', style: { top: '10%', left: '5%' } },
        { className: 'w-80 h-80 bg-blue-600', style: { top: '50%', right: '5%' } },
        { className: 'w-72 h-72 bg-indigo-400', style: { bottom: '10%', left: '35%' } },
      ].map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute ${blob.className} rounded-full blur-[120px]`}
          style={{ ...blob.style, opacity: 0.2 }}
          animate={{ x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center min-h-[calc(100vh-100px)]">
        {/* Left content */}
        <div className="z-10">
          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight"
          >
            VENTECH COMPANY<br className="hidden sm:block" />
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-slate-200 text-sm md:text-base lg:text-lg leading-relaxed mb-6 max-w-lg"
          >
            Complete IT infrastructure management for computers, accessories, network devices,
            and support requests, all managed in one powerful platform.
          </motion.p>

          {/* CTA buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-wrap gap-4 mb-4"
          >
            <button
              onClick={handleLogin}
              className="btn-primary-premium flex items-center gap-2 px-8 py-3.5 text-base group"
            >
              Enter System <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate('/submit-request')}
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold px-7 py-3 rounded-2xl transition-all"
            >
              Submit Request
            </button>
          </motion.div>
        </div>

        {/* Right – Hero Image with Parallax & Floating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block relative perspective-1000"
        >
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotateZ: [0, 0.5, 0, -0.5, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            className="relative hero-glow"
          >
            {/* Main Image */}
            <img 
              src="/images/coding.jpg" 
              alt="Professional IT Management" 
              className="w-full aspect-[1/1.1] sm:aspect-[4/3] object-cover object-top rounded-[2.5rem] shadow-2xl border border-white/20"
            />
            
            {/* Decorative background glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full" />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-[1px] h-10 bg-gradient-to-b from-indigo-500 to-transparent" />
      </motion.div>
    </section>
  );

  /* ═══════════ STATS BAR ═══════════ */
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  const StatsBar = (
    <section ref={statsRef} className="bg-indigo-600 relative overflow-hidden">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '500+', label: 'Computers Managed' },
            { value: '98%', label: 'Uptime Maintained' },
            { value: '150+', label: 'ICT Requests Resolved' },
            { value: '20+', label: 'Active Technicians' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center relative">
              <StatCounter value={stat.value} label={stat.label} />
              {i < 3 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-indigo-400/40" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  /* ═══════════ FEATURES ═══════════ */
  const features = [
    {
      icon: Monitor,
      title: 'PC Management',
      desc: 'Track all desktop computers by location, status, RAM, storage, OS and assigned technician.',
    },
    {
      icon: Mouse,
      title: 'Accessory Tracking',
      desc: 'Manage mice, keyboards, monitors, projectors, printers and all peripheral devices.',
    },
    {
      icon: Network,
      title: 'Network Devices',
      desc: 'Monitor routers, switches, access points and firewalls across your organization.',
    },
    {
      icon: ClipboardList,
      title: 'ICT Support Requests',
      desc: 'Employees submit requests without login. Admins assign technicians and track resolution.',
    },
    {
      icon: FileText,
      title: 'Maintenance Reports',
      desc: 'Technicians document every repair, replacement and maintenance activity.',
    },
    {
      icon: BarChart2,
      title: 'Dashboard Analytics',
      desc: 'Real-time statistics, charts and technician workload overview for management.',
    },
  ];

  const Features = (
    <section className="bg-white dark:bg-surface-950 py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 px-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Everything You Need <br className="hidden sm:block" /> to Manage IT
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            One platform to track, assign, report, and resolve all your ICT needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );

  /* ═══════════ HOW IT WORKS ═══════════ */
  const steps = [
    {
      number: '01',
      title: 'Submit Request',
      icon: ClipboardList,
      color: 'bg-indigo-600',
      desc: 'Any employee submits an ICT support request with their details and description of the issue. No login required.',
    },
    {
      number: '02',
      title: 'Admin Assigns',
      icon: UserPlus,
      color: 'bg-emerald-600',
      desc: 'The Administrator reviews the request, selects an available technician, and assigns them with one click.',
    },
    {
      number: '03',
      title: 'Tech Resolves',
      icon: CheckCircle,
      color: 'bg-blue-600',
      desc: 'The technician fixes the issue, updates the request status, and creates a detailed maintenance report.',
    },
  ];

  const HowItWorks = (
    <section className="bg-slate-50 dark:bg-surface-900 py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Three simple steps from request to resolution</p>
        </motion.div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-10 md:gap-0">
          {/* Dashed connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-0 right-0 h-px border-dashed border-t-2 border-slate-300 z-0 mx-24" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="relative z-10 flex flex-col items-center text-center max-w-xs mx-auto md:mx-0 flex-1"
            >
              <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mb-5 shadow-lg`}>
                <step.icon size={28} className="text-white" />
              </div>
              <div className="bg-white dark:bg-surface-800 text-xs font-bold text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-surface-700 mb-3">
                STEP {step.number}
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-3">{step.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  /* ═══════════ USER ROLES ═══════════ */
  const adminFeatures = [
    'Manage all computers and devices',
    'View and assign all ICT requests',
    'Register and manage technicians',
    'Access complete dashboard analytics',
    'Delete and update any equipment',
    'Monitor technician workload',
  ];

  const techFeatures = [
    'View equipment assigned to you',
    'Update ICT request status',
    'Create maintenance reports',
    'View personal dashboard stats',
    'Manage your own profile',
    'Track your repair history',
  ];

  const UserRoles = (
    <section className="bg-white dark:bg-surface-950 py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 px-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Built for Your Entire IT Team
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
            Different roles, different access levels, same powerful platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Admin card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl shadow-indigo-500/20"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
              <Shield size={26} className="text-white" />
            </div>
            <h3 className="text-2xl font-extrabold mb-1">Administrator</h3>
            <p className="text-indigo-200 text-sm mb-6">Full system control</p>
            <ul className="space-y-3 mb-8">
              {adminFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <Check size={16} className="text-indigo-300 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleLogin}
              className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Login as Administrator
            </button>
          </motion.div>

          {/* Technician card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="bg-white border-2 border-indigo-100 rounded-2xl p-8 shadow-xl"
          >
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mb-5">
              <Wrench size={26} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">Technician</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Field operations access</p>
            <ul className="space-y-3 mb-8">
              {techFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <Check size={16} className="text-indigo-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Login as Technician
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );

  /* ═══════════ CTA BANNER ═══════════ */
  const CTABanner = (
    <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-6 text-center"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
          Ready to streamline your <br className="hidden sm:block" /> IT management?
        </h2>
        <p className="text-indigo-100 text-base md:text-lg lg:text-xl mb-10 opacity-90">
          Join your team on the PCM System and experience modern efficiency today.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <button
            onClick={handleLogin}
            className="btn-primary-premium bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-10 py-4 w-full sm:w-auto text-lg"
          >
            Enter System
          </button>
          <button
            onClick={() => navigate('/submit-request')}
            className="bg-transparent border-2 border-white/30 hover:border-white hover:bg-white/5 text-white font-bold px-8 py-3.5 rounded-2xl transition-all w-full sm:w-auto"
          >
            Submit a Request
          </button>
        </div>
      </motion.div>
    </section>
  );

  /* ═══════════ FOOTER ═══════════ */
  const Footer = (
    <footer className="bg-slate-900 dark:bg-surface-950 pt-16 pb-8 border-t border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Shield size={20} className="text-white" />
              </div>
              <span className="text-white font-bold text-xl uppercase tracking-tight">PCMS</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Complete Personal Computer Maintenance  (PCMS) for modern organizations. Built for efficiency and reliability.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <button onClick={handleLogin} className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-3 group">
                  <LogIn size={16} className="text-indigo-500" />
                  <span>Login</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/submit-request')} className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-3 group">
                  <ClipboardList size={16} className="text-indigo-500" />
                  <span>Submit Request</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-3 group">
                  <LayoutDashboard size={16} className="text-indigo-500" />
                  <span>Dashboard</span>
                </button>
              </li>
            </ul>
          </div>

          {/* System Info */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Contact Information</h4>
            <ul className="space-y-4">
              {[
                { label: 'Tel', value: '+250 799 375 874', icon: Phone },
                { label: 'Email', value: 'venustendikumana2003@gmail.com', icon: Mail },
                { label: 'Location', value: 'Kigali, Rwanda', icon: MapPin }
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 bg-slate-800 rounded-lg">
                    <item.icon size={14} className="text-indigo-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</span>
                    <span className="text-slate-300 text-sm mt-0.5">{item.value}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-slate-500 text-xs font-medium tracking-wide">&copy; 2026 PCMS. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-[10px] uppercase font-bold tracking-widest">Built By</span>
            <span className="text-indigo-400 text-xs font-bold hover:text-indigo-300 transition-colors cursor-default">Venuste NDIKUMANA</span>
          </div>
        </div>
      </div>
    </footer>
  );

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="min-h-screen font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {Navbar}
      <main>
        {Hero}
        {StatsBar}
        {Features}
        {HowItWorks}
        {UserRoles}
        {CTABanner}
      </main>
      {Footer}
    </div>
  );
}
