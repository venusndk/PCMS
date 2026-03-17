// src/pages/Landing.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Shield, Monitor, Mouse, Network, ClipboardList,
  FileText, BarChart2, CheckCircle, UserPlus, Menu, X,
  Users, Cpu, Wrench, Check, ChevronRight
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
      <span className="text-4xl font-extrabold text-white">
        {count}{hasPercent ? '%' : suffix}
      </span>
      <span className="text-indigo-200 text-sm mt-1 text-center">{label}</span>
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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className={`font-bold text-lg ${isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
              PCM System
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/submit-request')}
              className={`text-sm font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-slate-200 hover:text-white'
                }`}
            >
              Submit ICT Request
            </button>
            <ThemeToggle className={isScrolled ? "" : "text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/10"} />
            <button
              onClick={handleLogin}
              className="btn-primary-premium text-sm px-6 py-2"
            >
              Login to System
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
              Submit ICT Request
            </button>
            <button
              onClick={() => { handleLogin(); setMobileOpen(false); }}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg text-left"
            >
              Login to System
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );

  /* ═══════════ HERO ═══════════ */
  const Hero = (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-16">
      {/* Animated blobs */}
      {[
        { className: 'w-96 h-96 bg-indigo-600', style: { top: '10%', left: '5%' } },
        { className: 'w-80 h-80 bg-purple-700', style: { top: '50%', right: '5%' } },
        { className: 'w-72 h-72 bg-cyan-700', style: { bottom: '10%', left: '35%' } },
      ].map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute ${blob.className} rounded-full blur-3xl`}
          style={{ ...blob.style, opacity: 0.15 }}
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-14 items-center">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >


          {/* Subtitle */}
          <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
            Complete IT infrastructure management for computers, accessories, network devices,
            and ICT support requests — all managed in one powerful platform.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={handleLogin}
              className="btn-primary-premium flex items-center gap-2 px-8 py-4 text-base"
            >
              Enter System <ChevronRight size={18} />
            </button>
            <button
              onClick={() => navigate('/submit-request')}
              className="bg-transparent border border-white/40 hover:border-white/70 text-white font-medium px-7 py-3.5 rounded-xl transition-colors"
            >
              Submit ICT Request
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-5">
            {['Role-based access', 'Real-time dashboard', 'JWT secured'].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-slate-400 text-sm">
                <CheckCircle size={14} className="text-emerald-400" /> {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right – Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-5 shadow-2xl"
          >
            {/* Window top bar */}
            <div className="flex items-center gap-2 mb-5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-slate-400 text-xs">PCM System — Dashboard</span>
            </div>

            {/* Stat cards 2×2 */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'PCs', value: '124', icon: Monitor, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                { label: 'Requests', value: '38', icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Fixed', value: '92', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Technicians', value: '12', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg leading-none">{value}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fake bar chart */}
            <div className="bg-slate-700/30 rounded-xl p-4">
              <div className="text-slate-400 text-xs mb-3">Monthly Repairs</div>
              <div className="flex items-end gap-2 h-24">
                {[40, 65, 50, 80, 55, 90, 70, 85, 60, 75, 95, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${h}%`,
                      background: i % 3 === 0
                        ? 'rgb(99,102,241)'
                        : i % 3 === 1
                          ? 'rgb(16,185,129)'
                          : 'rgb(139,92,246)',
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
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
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Everything You Need to Manage IT
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
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
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Built for Your Entire IT Team
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
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
    <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 py-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto px-4 text-center"
      >
        <h2 className="text-4xl font-extrabold text-white mb-4">
          Ready to streamline your IT management?
        </h2>
        <p className="text-indigo-200 text-lg mb-10">
          Join your team on the PCM System today
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handleLogin}
            className="btn-primary-premium bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-10 py-4"
          >
            Enter System
          </button>
          <button
            onClick={() => navigate('/submit-request')}
            className="bg-transparent border border-white/50 hover:border-white text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">PCM System</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Personal Computer Maintenance Management System
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={handleLogin} className="text-slate-400 hover:text-white text-sm transition-colors">
                  Staff Login
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/submit-request')} className="text-slate-400 hover:text-white text-sm transition-colors">
                  Submit ICT Request
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white text-sm transition-colors">
                  Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* System Info */}
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2">
              {['Tel: +250799375874', 'Email: venustendikumana2003@gmail.com', 'Location: Kigali, Rwanda'].map((item) => (
                <li key={item} className="text-slate-400 text-sm">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-slate-500 text-xs">&copy; 2026 PCM System. All rights reserved.</p>
          <p className="text-slate-500 text-xs">Built By: Venuste NDIKUMANA</p>
        </div>
      </div>
    </footer>
  );

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="min-h-screen font-sans">
      {Navbar}
      {Hero}
      {StatsBar}
      {Features}
      {HowItWorks}
      {UserRoles}
      {CTABanner}
      {Footer}
    </div>
  );
}
