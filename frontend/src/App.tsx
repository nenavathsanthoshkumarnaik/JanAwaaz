import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  LogIn,
  Menu,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCircle2,
  Workflow,
} from 'lucide-react'
import { Link, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'

import { API_BASE_URL, getIntegrationStatus, getProfile, getServiceRequirements, loginWithSupabase, saveProfile, signUpWithSupabase } from './services/api'

const servicesByCategory = [
  {
    category: 'Education',
    items: ['Student Scholarships', 'Education Assistance'],
  },
  {
    category: 'Agriculture',
    items: ['Farmer Subsidies', 'Crop Insurance'],
  },
  {
    category: 'Certificates',
    items: ['Income Certificate', 'Caste Certificate', 'Residence Certificate'],
  },
  {
    category: 'Employment',
    items: ['Employment Registration', 'Skill Development'],
  },
  {
    category: 'Transport',
    items: ['Driving Licence Services'],
  },
]

const dashboardStats = [
  { label: 'Total Applications', tone: 'bg-slate-900' },
  { label: 'In Progress', tone: 'bg-sky-600' },
  { label: 'Submitted', tone: 'bg-emerald-600' },
  { label: 'Awaiting User Action', tone: 'bg-amber-500' },
]

const chatMessages = [
  { role: 'assistant', text: 'Hello! I can help you discover the right government service, review eligibility, prepare forms, and explain required documents.' },
  { role: 'user', text: 'I am looking for scholarship opportunities.' },
  { role: 'assistant', text: 'I can help with that. I will first review your profile, then suggest relevant scholarship categories and identify any missing documents.' },
]

const suggestions = ['Find scholarships for me', 'Help me understand government schemes', 'Which documents are required?', 'Help me prepare an application']

function readStoredUser() {
  try {
    const raw = window.localStorage.getItem('janawaaz_user')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStoredUser(user: Record<string, unknown>) {
  const existing = readStoredUser()
  const next = { ...existing, ...user }
  window.localStorage.setItem('janawaaz_user', JSON.stringify(next))
  return next
}

const navLinks = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Assistant', to: '/assistant', icon: MessageSquareText },
  { label: 'Government Services', to: '/services', icon: Building2 },
  { label: 'My Applications', to: '/applications', icon: FileText },
  { label: 'Documents', to: '/documents', icon: FolderOpen },
  { label: 'AI Agent Activity', to: '/agent', icon: Workflow },
  { label: 'My Profile', to: '/profile', icon: UserCircle2 },
  { label: 'Settings', to: '/settings', icon: ShieldCheck },
]

const steps = [
  'Tell JanAwaaz what you need.',
  'AI discovers relevant government services.',
  'Your agent prepares the application.',
  'Review, approve and track.',
]

const features = [
  { icon: MessageSquareText, title: 'Intelligent AI Chatbot', description: 'Natural conversational support, service discovery, and eligibility guidance.' },
  { icon: Workflow, title: 'Portal Assistance', description: 'Review official portal links and complete submissions yourself; automated portal access is not enabled.' },
  { icon: Upload, title: 'Document Organization', description: 'Upload demo files to local backend storage. Cloud storage and automatic extraction are not configured.' },
  { icon: Bell, title: 'Application Drafts', description: 'Create temporary draft records; durable database storage is not configured.' },
  { icon: ShieldCheck, title: 'Citizen Profile', description: 'Profile settings are available in demo mode; Supabase authentication and access policies are not configured.' },
  { icon: Sparkles, title: 'Guided Preparation', description: 'Review service references and organize information before visiting the official portal.' },
]

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/dashboard/services" element={<ServicesPage />} />
        <Route path="/dashboard/assistant" element={<AssistantPage />} />
        <Route path="/dashboard/applications" element={<ApplicationsPage />} />
        <Route path="/dashboard/agent" element={<AgentPage />} />
        <Route path="/dashboard/documents" element={<DocumentsPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102A43] text-sm font-bold text-white shadow-lg shadow-sky-900/20">J</div>
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900">JanAwaaz</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#home" className="transition hover:text-slate-900">Home</a>
            <a href="#how-it-works" className="transition hover:text-slate-900">How It Works</a>
            <a href="#services" className="transition hover:text-slate-900">Services</a>
            <a href="#about" className="transition hover:text-slate-900">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 sm:inline-flex">Sign In</Link>
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-[#102A43] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/20 transition hover:bg-[#163A5F]">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102A43] text-sm font-bold text-white">J</div>
              <span className="text-xl font-bold text-slate-900">JanAwaaz</span>
            </div>
            <p className="max-w-md text-sm text-slate-600">Government services, made easier to explore. JanAwaaz links to public portals and helps citizens organize service information and application preparation.</p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Company</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#about" className="hover:text-slate-900">About</a></li>
              <li><a href="#services" className="hover:text-slate-900">Services</a></li>
              <li><a href="#how-it-works" className="hover:text-slate-900">How it works</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Resources</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-slate-900">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-slate-900">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-slate-900">Security</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Support</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-slate-900">Help & Support</a></li>
              <li><a href="#" className="hover:text-slate-900">Contact</a></li>
              <li><a href="#" className="hover:text-slate-900">Status</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

function LandingPage() {
  return (
    <div id="home">
      <section className="relative overflow-hidden bg-[#F8FAFC]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.10),transparent_25%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-[#2563EB]/20 bg-[#2563EB]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">AI-POWERED PUBLIC SERVICE ASSISTANT</span>
              <h1 className="mt-6 max-w-xl text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl lg:text-6xl">Government Services, Simplified by AI.</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Explore public service portals, organize your documents, and prepare applications with clear guidance. Portal submission remains with you.</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-[#102A43] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/20 transition hover:bg-[#163A5F]">Get Started <ArrowRight size={18} /></Link>
                <a href="#services" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Explore Services</a>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-25px_rgba(15,23,42,0.25)]">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102A43] text-white shadow-md"><Bot size={18} /></div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">JanAwaaz AI</div>
                        <div className="text-xs text-amber-700">Preview · live AI not configured</div>
                      </div>
                    </div>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-700">Preview</span>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-900 p-4 text-sm text-slate-100">
                      <p className="font-medium text-slate-100">I am looking for scholarship opportunities.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                      <div className="mb-2 flex items-center gap-2 text-[#2563EB]">
                        <Sparkles size={14} />
                        <span className="font-semibold">Service discovery</span>
                      </div>
                      <p>Use the National Scholarship Portal to review current schemes, eligibility, and deadlines. JanAwaaz does not fetch or verify scheme details yet.</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Profile</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">Not verified</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Portal</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">Reference only</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">Ready</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2563EB]">How It Works</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">From question to approved application</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#102A43] text-sm font-bold text-white">0{index + 1}</div>
              <p className="text-base font-semibold text-slate-900">{step}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2563EB]">Features</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything citizens need in one secure workspace</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102A43] text-white"><Icon size={20} /></div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2563EB]">Services</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Verified public service categories</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {servicesByCategory.map(({ category, items }) => (
            <div key={category} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-full bg-[#102A43]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#102A43]">{category}</div>
              <ul className="space-y-3 text-sm text-slate-700">
                {items.map((item) => (
                  <li key={item} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span>{item}</span>
                    <ChevronRight size={15} className="text-slate-400" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="bg-[#102A43] py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#93C5FD]">Trust & Security</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Citizen-controlled, transparent and secure</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              'Citizen-controlled information.',
              'Secure storage and strict access control.',
              'Transparent browser automation with explicit consent.',
              'Official-source verification before guidance is shared.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white"><CheckCircle2 size={18} /></div>
                <p className="text-sm leading-6 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true)
    setStatus('')

    try {
      const action = mode === 'signup' ? signUpWithSupabase : loginWithSupabase
      const response = await action({
        full_name: fullName,
        email,
        password,
      })

      if (response.status === 'ok' || response.status === 'signed_in' || response.status === 'saved_locally') {
        writeStoredUser({
          full_name: fullName || email.split('@')[0],
          email,
          user_id: response.user_id || 'demo-user',
        })
        setStatus(response.message)
        navigate('/dashboard')
        return
      }

      setStatus(response.message || 'Authentication failed.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to authenticate right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-78px)] max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.3)] lg:grid-cols-2">
        <div className="bg-[#102A43] p-8 text-white lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">Secure access</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">Welcome to JanAwaaz</h2>
          <p className="mt-4 max-w-md text-slate-200">A citizen-first platform for understanding public services, preparing documents, and tracking important government workflows with clarity.</p>

          <div className="mt-10 space-y-4">
            {[
              'Profile setup with state, district and address details.',
              'Document upload and secure storage guidance.',
              'Official portal reference links and application preparation guidance.',
            ].map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-white"><CheckCircle2 size={14} /></div>
                <p className="text-sm text-slate-200">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 lg:p-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102A43] text-white"><LogIn size={18} /></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{mode === 'signup' ? 'Create account' : 'Sign in'}</div>
            </div>
          </div>

          <div className="mb-5 flex rounded-full border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-[#102A43] text-white' : 'text-slate-600'}`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'signin' ? 'bg-[#102A43] text-white' : 'text-slate-600'}`}
            >
              Sign in
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <input
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#2563EB] focus:bg-white"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#2563EB] focus:bg-white"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#2563EB] focus:bg-white"
                placeholder="Password"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" /> Remember me</label>
              <a href="#" className="font-semibold text-[#2563EB]">Forgot password?</a>
            </div>
            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center rounded-full bg-[#102A43] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#163A5F] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Continue to dashboard'}
            </button>
          </form>

          {status && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {status}
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            Supabase and OpenAI remain configuration-driven. Once credentials are added, this flow will create the real auth session and store the citizen profile.
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardLayout() {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('janawaaz_user') || '{}')
    } catch {
      return {}
    }
  })()

  const userName = storedUser.full_name || 'Citizen'
  const userInitial = String(userName).trim().charAt(0).toUpperCase() || 'C'

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102A43] text-sm font-bold text-white">J</div>
            <div className="text-xl font-bold text-slate-900">JanAwaaz</div>
          </div>

          <nav className="space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? 'bg-[#102A43] text-white shadow-lg shadow-sky-900/10' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white lg:hidden">
                  <Menu size={18} />
                </button>
                <div className="relative w-full max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white" placeholder="Search" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"><Bell size={18} /></button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"><HelpCircle size={18} /></button>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#102A43] text-xs font-bold text-white">{userInitial}</div>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-semibold text-slate-900">{userName}</div>
                    <div className="text-[11px] text-slate-500">Citizen</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

function DashboardPage() {
  const { data: applicationData, isLoading: applicationsLoading, isError: applicationsError } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/applications`)
      if (!response.ok) {
        throw new Error('Failed to load applications')
      }
      return response.json()
    },
  })

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('janawaaz_user') || '{}')
    } catch {
      return {}
    }
  })()

  const displayName = storedUser.full_name || 'Citizen'
  const applications: Array<Record<string, unknown>> = applicationData?.items ?? []
  const applicationCounts: Record<string, number> = {
    'Total Applications': applications.length,
    'In Progress': applications.filter((application) => application.status === 'in_progress').length,
    Submitted: applications.filter((application) => application.status === 'submitted').length,
    'Awaiting User Action': applications.filter((application) => application.status === 'awaiting_user_action').length,
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Overview</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Welcome back, {displayName}</h1>
        <p className="mt-2 text-sm text-slate-600">Your secure government service workspace is ready. Start with a new service request or review your applications.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map(({ label, tone }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-4 inline-flex h-2.5 w-2.5 rounded-full ${tone}`} />
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{applicationsLoading ? '—' : applicationCounts[label]}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Applications</h2>
            <Link to="/dashboard/applications" className="text-sm font-semibold text-[#2563EB]">View all</Link>
          </div>
          {applicationsError && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Applications could not be loaded. Check your connection and try again.</div>}
          {applicationsLoading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Loading applications...</div>}
          {!applicationsLoading && applications.length > 0 && (
            <div className="space-y-3">
              {applications.slice(0, 3).map((application) => (
                <div key={String(application.id)} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="font-semibold text-slate-900">{String(application.service_name || 'Government service')}</div>
                    <div className="mt-1 text-xs text-slate-500">Reference: {String(application.tracking_reference || '—')}</div>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">{String(application.status || 'draft').replaceAll('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
          {!applicationsLoading && !applicationsError && applications.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#102A43] text-white"><FileText size={22} /></div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No applications yet</h3>
            <p className="mt-2 text-sm text-slate-600">Draft applications you create will appear here.</p>
            <Link to="/dashboard/services" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#102A43] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#163A5F]">Discover Services</Link>
          </div>}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Recommended Government Services</h2>
            <div className="mt-4 space-y-3">
              {['Scholarships', 'Employment registration', 'Income certificate'].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                  <span>{item}</span>
                  <ChevronRight size={15} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Ask AI Assistant', to: '/dashboard/assistant', icon: MessageSquareText },
                { label: 'Discover Services', to: '/dashboard/services', icon: Building2 },
                { label: 'Start Application', to: '/dashboard/applications', icon: FileText },
                { label: 'Upload Documents', to: '/dashboard/documents', icon: Upload },
              ].map(({ label, to, icon: Icon }) => (
                <Link key={label} to={to} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#102A43]"><Icon size={16} /></div>
                    {label}
                  </div>
                  <ChevronRight size={15} className="text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServicesPage() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  type ServiceRecord = {
    id: string
    service_name: string
    category: string
    department: string
    source_status: string
    portal: string
    official_source_name?: string
    source_url?: string
    description?: string
    last_verified_at?: string
  }

  const { data, isLoading, isError } = useQuery<{ items: ServiceRecord[]; count: number; source_status: string }>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/services`)
      if (!response.ok) {
        throw new Error('Failed to load services')
      }
      return response.json()
    },
  })

  const services = data?.items ?? []
  const activeServiceId = selectedServiceId ?? services[0]?.id ?? null

  const { data: requirementsData, isLoading: requirementsLoading, isError: requirementsError } = useQuery({
    queryKey: ['service-requirements', activeServiceId],
    enabled: Boolean(activeServiceId),
    queryFn: () => {
      if (!activeServiceId) {
        throw new Error('Select a service to load requirements')
      }
      return getServiceRequirements(activeServiceId)
    },
  })

  const selectedService = services.find((service) => service.id === activeServiceId) ?? null
  const getStatusClasses = (status: string) => {
    if (status === 'connected') return 'bg-emerald-50 text-emerald-700'
    if (status === 'reference_only') return 'bg-sky-50 text-sky-700'
    return 'bg-amber-50 text-amber-700'
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Discover Government Services</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Find the right service and access the official public source behind it.</h1>
      </div>

      {isLoading && <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading official service references...</div>}
      {isError && <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">The service catalog could not be loaded right now.</div>}

      {!isLoading && !isError && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedServiceId(service.id)}
                className={`rounded-3xl border p-6 text-left shadow-sm transition ${selectedService?.id === service.id ? 'border-[#102A43] bg-[#102A43] text-white shadow-lg shadow-sky-900/10' : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'}`}
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${selectedService?.id === service.id ? 'bg-white/10 text-white' : 'bg-[#102A43]/5 text-[#102A43]'}`}>
                    {service.category}
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${getStatusClasses(service.source_status)}`}>
                    {service.source_status === 'reference_only' ? 'Official reference' : service.source_status}
                  </span>
                </div>
                <div className="font-semibold">{service.service_name}</div>
                <p className={`mt-2 text-sm ${selectedService?.id === service.id ? 'text-slate-200' : 'text-slate-600'}`}>{service.department}</p>
                <div className={`mt-4 rounded-2xl border p-3 text-sm ${selectedService?.id === service.id ? 'border-white/20 bg-white/5 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  {service.official_source_name || service.portal}
                </div>
                {service.source_url && (
                  <a
                    href={service.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${selectedService?.id === service.id ? 'bg-white text-[#102A43]' : 'bg-[#102A43] text-white'}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    Official source
                  </a>
                )}
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {requirementsLoading && <div className="text-sm text-slate-600">Loading service requirements...</div>}
            {requirementsError && <div className="text-sm text-red-700">The service requirements could not be loaded.</div>}
            {!requirementsLoading && !requirementsError && requirementsData && (
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Requirements</div>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">{requirementsData.service_name}</h2>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${getStatusClasses(requirementsData.source_status)}`}>
                    {requirementsData.source_status === 'reference_only' ? 'Official reference' : requirementsData.source_status}
                  </span>
                </div>

                {requirementsData.description && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {requirementsData.description}
                  </div>
                )}

                {requirementsData.official_source_name && requirementsData.source_url && (
                  <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Official source</div>
                    <div className="mt-2 text-sm font-semibold text-slate-800">{requirementsData.official_source_name}</div>
                    <a href={requirementsData.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-medium text-sky-700 underline-offset-2 hover:underline">
                      Open public source
                    </a>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Eligibility</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{requirementsData.eligibility}</p>
                </div>

                <div className="mt-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Required documents</div>
                  <ul className="mt-3 space-y-3">
                    {requirementsData.required_documents.length > 0 ? requirementsData.required_documents.map((document) => (
                      <li key={document} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">{document}</li>
                    )) : <li className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">No required documents are listed until the official source is connected.</li>}
                  </ul>
                </div>

                <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#102A43] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">Start application</button>
              </div>
            )}
            {!requirementsData && !requirementsLoading && !requirementsError && (
              <div className="text-sm text-slate-600">Choose a service to review its requirements and official public-source details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AssistantPage() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [thread, setThread] = useState<Array<{ role: string; text: string }>>(chatMessages)
  const [loading, setLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState<{ status: string; message: string }>({ status: 'not_configured', message: 'OpenAI credentials are not configured yet.' })

  useEffect(() => {
    const loadPastConversation = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/chat/conversations`)
        const data = await response.json()
        const latest = data.items?.[0]
        if (latest && Array.isArray(latest.messages) && latest.messages.length > 0) {
          setConversationId(latest.id)
          setThread(latest.messages.map((message: Record<string, unknown>) => ({
            role: String(message.role || 'assistant'),
            text: String(message.content || ''),
          })))
        }
      } catch {
        // keep the default greeting if no chat history is available yet
      }
    }

    const loadIntegrationStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/integrations/status`)
        const data = await response.json()
        const openAi = data.integrations?.find((item: Record<string, unknown>) => item.provider === 'OpenAI')
        if (openAi) {
          setAiStatus({
            status: String(openAi.status || 'not_configured'),
            message: String(openAi.message || 'OpenAI credentials are not configured yet.'),
          })
        }
      } catch {
        // keep the default status if the integrations endpoint is temporarily unavailable
      }
    }

    void loadPastConversation()
    void loadIntegrationStatus()
  }, [])

  const ensureConversation = async () => {
    if (conversationId) return conversationId

    const created = await fetch(`${API_BASE_URL}/api/chat/conversations`, { method: 'POST' })
    const data = await created.json()
    setConversationId(data.conversation_id)
    return data.conversation_id
  }

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim()
    if (!trimmed || loading) return
    setLoading(true)
    const currentConversationId = await ensureConversation()
    setThread((prev) => [...prev, { role: 'user', text: trimmed }])
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${currentConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      const payload = await response.json()
      setThread((prev) => [...prev, { role: 'assistant', text: payload.message || 'The assistant could not answer at the moment.' }])
    } catch (error) {
      setThread((prev) => [...prev, { role: 'assistant', text: error instanceof Error ? error.message : 'The assistant is unavailable right now.' }])
    } finally {
      setInput('')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">AI Assistant</div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">JanAwaaz AI Assistant</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${aiStatus.status === 'connected' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-amber-200 bg-amber-50 text-amber-700'}`}>
              {aiStatus.status === 'connected' ? 'AI Connected' : 'AI Not Configured'}
            </span>
            <button
              type="button"
              onClick={() => {
                setConversationId(null)
                setThread([{ role: 'assistant', text: 'Hello! I can help you discover government services, understand eligibility, prepare applications and track your requests. What would you like help with today?' }])
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
            >
              New chat
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="min-h-[620px] border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="space-y-4 p-5">
            {thread.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-6 ${msg.role === 'user' ? 'bg-[#102A43] text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">Thinking…</div></div>}
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">{suggestion}</button>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void sendMessage(input)
                  }
                }}
                placeholder="Ask JanAwaaz about your service needs..."
                className="flex-1 border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button type="button" onClick={() => void sendMessage(input)} className="rounded-full bg-[#102A43] px-4 py-2 text-sm font-semibold text-white">Send</button>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><ShieldCheck size={16} /> Source reliability</div>
            <p className="text-sm leading-6 text-slate-600">{aiStatus.message}</p>
          </div>

          <div className="mt-5 space-y-3">
            {[
              'Official organization',
              'Official source URL',
              'Last verified date',
              'Relevant information',
            ].map((label) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">{label}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ApplicationsPage() {
  const [serviceId, setServiceId] = useState('student-scholarships')
  const [status, setStatus] = useState('')
  const [creating, setCreating] = useState(false)

  const { data: serviceData } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/services`)
      if (!response.ok) {
        throw new Error('Failed to load services')
      }
      return response.json()
    },
  })

  const { data: applicationData, isLoading, refetch } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/applications`)
      if (!response.ok) {
        throw new Error('Failed to load applications')
      }
      return response.json()
    },
  })

  const applications = applicationData?.items ?? []
  const services = serviceData?.items ?? []

  const createApplication = async () => {
    const selectedService = services.find((item: Record<string, unknown>) => item.id === serviceId) as Record<string, unknown> | undefined
    if (!selectedService) {
      setStatus('Select a valid service before creating an application.')
      return
    }

    setCreating(true)
    setStatus('Creating draft application...')

    try {
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: String(selectedService.id),
          service_name: String(selectedService.service_name),
          user_id: readStoredUser().user_id || 'demo-user',
        }),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.detail || 'Unable to create application')
      }
      setStatus(payload.message || 'Application draft created.')
      await refetch()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to create application.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">My Applications</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Application history</h1>
          </div>
          <div className="flex items-center gap-3">
            <select value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none focus:border-[#2563EB]">
              {services.map((item: Record<string, unknown>) => (
                <option key={String(item.id)} value={String(item.id)}>{String(item.service_name)}</option>
              ))}
            </select>
            <button type="button" onClick={() => void createApplication()} disabled={creating} className="rounded-full bg-[#102A43] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {creating ? 'Creating...' : 'New application'}
            </button>
          </div>
        </div>
      </div>

      {status && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{status}</div>}

      {isLoading && <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading applications...</div>}

      {!isLoading && applications.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#102A43] text-white"><FileText size={22} /></div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">No records yet</h2>
          <p className="mt-2 text-sm text-slate-600">Your submitted or draft applications will appear here as soon as a service is created and linked to a verified source.</p>
        </div>
      )}

      {!isLoading && applications.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {applications.map((application: Record<string, unknown>) => (
            <div key={String(application.id)} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{String(application.status || 'draft')}</div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${String(application.status) === 'draft' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {String(application.status || 'draft')}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{String(application.service_name || 'Government Service')}</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-3">Reference: {String(application.tracking_reference || '—')}</div>
                <div className="rounded-2xl bg-slate-50 p-3">Created: {String(application.created_at || '—')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AgentPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Autonomous AI Agent</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Execution monitoring</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Selected service</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-3">Service: Not selected</div>
            <div className="rounded-2xl bg-slate-50 p-3">Application ID: —</div>
            <div className="rounded-2xl bg-slate-50 p-3">Citizen summary: Not available</div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Live execution</h3>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Browser automation is not configured. Once an authorized portal and credentials are added, this panel will show actual status, page activity and execution logs.
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Form-field mapping</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-3">Field mapping status: Awaiting portal configuration</div>
            <div className="rounded-2xl bg-slate-50 p-3">Validation results: Not available</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('identity')
  const [status, setStatus] = useState(import.meta.env.DEV ? 'Ready to upload your documents.' : 'Uploads are disabled in this hosted demo.')
  const [uploading, setUploading] = useState(false)

  const { data: documents = [], isLoading: documentsLoading, isError: documentsError, refetch: refetchDocuments } = useQuery<Array<Record<string, unknown>>>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/documents`)
      if (!response.ok) {
        throw new Error('Failed to load documents')
      }
      const payload = await response.json()
      return Array.isArray(payload.items) ? payload.items : []
    },
  })

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!import.meta.env.DEV) {
      setStatus('Uploads are disabled until secure cloud storage and authentication are configured.')
      return
    }
    if (!selectedFile) {
      setStatus('Select a file before uploading.')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setStatus('Document size must be 10 MB or less.')
      return
    }

    setUploading(true)
    setStatus('Uploading document...')
    const user = readStoredUser()
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('document_type', documentType)
    formData.append('user_id', user.user_id || 'demo-user')

    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.detail || 'Upload failed')
      }
      setStatus(payload.message || 'Document uploaded successfully.')
      setSelectedFile(null)
      await refetchDocuments()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to upload document right now.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Documents</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Document workspace</h1>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          {import.meta.env.DEV
            ? 'Local demo only: uploads are stored on the backend host without production access controls. Use only non-sensitive test files; maximum size is 10 MB.'
            : 'Uploads are disabled in this hosted preview until secure cloud storage and authentication are configured. Do not upload sensitive documents.'}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Upload a file</h2>
          <form onSubmit={handleUpload} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Document type</label>
              <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white">
                <option value="identity">Identity proof</option>
                <option value="income">Income proof</option>
                <option value="residence">Residence proof</option>
                <option value="education">Education proof</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Select document</label>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={!import.meta.env.DEV} onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} className="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-[#102A43] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white disabled:cursor-not-allowed disabled:opacity-60" />
            </div>

            <button type="submit" disabled={!import.meta.env.DEV || uploading || !selectedFile} className="inline-flex items-center justify-center rounded-full bg-[#102A43] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {uploading ? 'Uploading...' : 'Upload document'}
            </button>
            <p className="text-sm text-slate-600">{status}</p>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Uploaded files</h2>
          <div className="mt-5 space-y-3">
            {documentsLoading && <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Loading uploaded files...</div>}
            {documentsError && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Uploaded files could not be loaded. Check your connection and try again.</div>}
            {!documentsLoading && !documentsError && documents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#102A43] text-white"><Upload size={22} /></div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No files uploaded yet</h3>
                <p className="mt-2 text-sm text-slate-600">Upload identity, income, residence, and education documents only after the required service has been selected.</p>
              </div>
            ) : !documentsLoading && !documentsError ? (
              documents.map((document) => (
                <div key={String(document.id)} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-800">{String(document.file_name || 'Document')}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{String(document.document_type || 'other')}</div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">{String(document.status || 'uploaded')}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">Uploaded at {String(document.uploaded_at || '—')}</div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfilePage() {
  const storedUser = readStoredUser()
  const displayName = storedUser.full_name || 'Citizen'
  const [profile, setProfile] = useState({
    full_name: storedUser.full_name || '',
    email: storedUser.email || '',
    mobile_number: '',
    state: '',
    district: '',
    address: '',
    pin_code: '',
    date_of_birth: '',
    educational_qualification: '',
  })
  const [status, setStatus] = useState('Loading profile...')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = storedUser.user_id || 'demo-user'
        const response = await getProfile(userId)
        const profileData = (response.profile || {}) as Record<string, unknown>
        const nextProfile = {
          full_name: String(profileData.full_name || storedUser.full_name || ''),
          email: String(profileData.email || storedUser.email || ''),
          mobile_number: String(profileData.mobile_number || ''),
          state: String(profileData.state || ''),
          district: String(profileData.district || ''),
          address: String(profileData.address || ''),
          pin_code: String(profileData.pin_code || ''),
          date_of_birth: String(profileData.date_of_birth || ''),
          educational_qualification: String(profileData.educational_qualification || ''),
        }
        setProfile(nextProfile)
        writeStoredUser(nextProfile)
        setStatus(response.integration_status === 'connected' ? 'Connected to real profile storage.' : 'Demo profile mode active; connect Supabase to persist data in the cloud.')
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Profile could not be loaded.')
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [storedUser.email, storedUser.full_name, storedUser.user_id])

  const handleSave = async () => {
    setSaving(true)
    setStatus('Saving profile...')
    try {
      const payload = {
        user_id: storedUser.user_id || 'demo-user',
        ...profile,
      }
      const response = await saveProfile(payload)
      writeStoredUser({
        full_name: profile.full_name || storedUser.full_name || 'Citizen',
        email: profile.email || storedUser.email || '',
        user_id: storedUser.user_id || 'demo-user',
      })
      setStatus(response.message || 'Profile saved successfully.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const completion = Math.min(100, [
    profile.full_name,
    profile.email,
    profile.mobile_number,
    profile.state,
    profile.district,
    profile.address,
    profile.pin_code,
    profile.date_of_birth,
    profile.educational_qualification,
  ].filter(Boolean).length * 12)

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">My Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Citizen information</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#102A43] text-lg font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="text-xl font-bold text-slate-900">{displayName}</div>
              <div className="text-sm text-slate-500">Citizen profile</div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Date of Birth', profile.date_of_birth || '—'],
              ['Email', profile.email || '—'],
              ['Mobile Number', profile.mobile_number || '—'],
              ['State', profile.state || '—'],
              ['District', profile.district || '—'],
              ['PIN Code', profile.pin_code || '—'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
                <div className="mt-2 text-sm font-medium text-slate-700">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Profile details</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Full name</label>
              <input value={profile.full_name} onChange={(event) => setProfile((current) => ({ ...current, full_name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</label>
                <input type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Mobile</label>
                <input value={profile.mobile_number} onChange={(event) => setProfile((current) => ({ ...current, mobile_number: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">State</label>
                <input value={profile.state} onChange={(event) => setProfile((current) => ({ ...current, state: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">District</label>
                <input value={profile.district} onChange={(event) => setProfile((current) => ({ ...current, district: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Address</label>
              <textarea value={profile.address} onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))} className="min-h-[100px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">PIN code</label>
                <input value={profile.pin_code} onChange={(event) => setProfile((current) => ({ ...current, pin_code: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Date of birth</label>
                <input type="date" value={profile.date_of_birth} onChange={(event) => setProfile((current) => ({ ...current, date_of_birth: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Education</label>
              <input value={profile.educational_qualification} onChange={(event) => setProfile((current) => ({ ...current, educational_qualification: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white" />
            </div>
            <button type="button" onClick={() => void handleSave()} disabled={saving || loading} className="inline-flex items-center justify-center rounded-full bg-[#102A43] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Saving...' : 'Save profile'}
            </button>
            <p className="text-sm text-slate-600">{status}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Profile completion</h2>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <div className="mb-2 flex justify-between text-sm font-medium text-slate-700"><span>Completion</span><span>{completion}%</span></div>
          <div className="h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-[#2563EB]" style={{ width: `${completion}%` }} />
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">Complete your profile to streamline eligibility checks and reduce the number of missing fields in future government applications.</p>
      </div>
    </div>
  )
}

function SettingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['integrations'],
    queryFn: getIntegrationStatus,
  })

  const integrations = data?.integrations ?? []

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Settings</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Account preferences</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Connection status</h2>
          <div className="mt-4 space-y-3">
            {isLoading && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Loading connection status...</div>}
            {isError && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to fetch integration status.</div>}
            {!isLoading && !isError && integrations.length > 0 && integrations.map((integration) => (
              <div key={integration.provider} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-800">{integration.provider}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${integration.status === 'connected' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {integration.status}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5">{integration.message ?? 'No additional details are available.'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Privacy and security</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-3"><ShieldCheck size={16} className="text-[#2563EB]" /> Access control with verified citizen scopes.</li>
            <li className="flex items-center gap-3"><ShieldCheck size={16} className="text-[#2563EB]" /> Secure storage and signed document access.</li>
            <li className="flex items-center gap-3"><ShieldCheck size={16} className="text-[#2563EB]" /> Explicit consent before automated actions.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
