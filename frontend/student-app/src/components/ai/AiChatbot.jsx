import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Loader2,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { aiApi } from '../../services/api';

const ACTION_MAP = {
  start_mock_interview: { label: 'Start Mock Interview', route: '/dashboard/interview' },
  open_dsa_practice: { label: 'Practice DSA', route: '/dashboard/interview' },
  view_jobs: { label: 'Browse Jobs', route: '/dashboard/jobs' },
  open_resume_review: { label: 'Resume Review', route: '/dashboard/profile' },
  view_progress: { label: 'My Progress', route: '/dashboard/analytics' },
  open_learning_module: { label: 'Learning Module', route: '/dashboard/roadmap' },
  view_roadmap: { label: 'Career Roadmap', route: '/dashboard/roadmap' },
};

const QUICK_PROMPTS = ['Practice DSA', 'Mock Interview', 'Find Jobs', 'My Progress'];

function buildContext(user) {
  if (!user) return null;
  return {
    name: user.fullName || null,
    branch: user.branch || null,
    cgpa: user.cgpa || null,
    skills: user.skills || null,
    weak_areas: user.weakAreas || null,
    mock_score: user.lastMockScore ?? null,
    applications_this_week: user.applicationsThisWeek ?? null,
    readiness_score: user.readinessScore ?? null,
  };
}

function detectIntent(message = '') {
  const text = message.toLowerCase();
  if (/\b(hi|hey|hello|hii)\b/.test(text)) return 'greeting';
  if (/\b(practice|dsa|leetcode|coding|algorithm|problem)\b/.test(text)) return 'practice';
  if (/\b(job|jobs|apply|company|opening)\b/.test(text)) return 'jobs';
  if (/\b(progress|score|weak|readiness|performance)\b/.test(text)) return 'progress';
  if (/\b(resume|cv|portfolio|ats)\b/.test(text)) return 'resume';
  if (/\b(interview|mock|hr|lld|hld|system design)\b/.test(text)) return 'interview';
  return 'general';
}

function buildLocalMentorReply(message, user) {
  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const weak = user?.weakAreas?.[0] || 'DSA';
  const intent = detectIntent(message);

  const replies = {
    greeting: {
      message: `Hey ${firstName}, great to see you. Your fastest win today is 30 minutes of ${weak} followed by one mock round.`,
      suggestions: [`Practice ${weak}`, 'Start mock interview'],
      actions: ['open_dsa_practice', 'start_mock_interview'],
    },
    practice: {
      message: `Perfect. Start with 2 medium ${weak} questions and write time complexity before coding each answer.`,
      suggestions: ['Practice now', 'Track your progress'],
      actions: ['open_dsa_practice', 'view_progress'],
    },
    jobs: {
      message: 'Let us focus on momentum: shortlist 5 relevant roles and apply to 2 high-fit openings today.',
      suggestions: ['Browse open jobs', 'Polish resume'],
      actions: ['view_jobs', 'open_resume_review'],
    },
    progress: {
      message: `Your current bottleneck is ${weak}. Improve consistency this week with one mock plus daily problem solving.`,
      suggestions: ['View progress', 'Start mock interview'],
      actions: ['view_progress', 'start_mock_interview'],
    },
    resume: {
      message: 'Your resume should show measurable outcomes. Add impact metrics and role-specific keywords for each target job.',
      suggestions: ['Open resume section', 'Browse matching jobs'],
      actions: ['open_resume_review', 'view_jobs'],
    },
    interview: {
      message: `Let us run a focused interview prep cycle: ${weak} fundamentals, one mock, and quick revision notes after the session.`,
      suggestions: ['Start mock interview', 'Practice DSA'],
      actions: ['start_mock_interview', 'open_dsa_practice'],
    },
    general: {
      message: `I can guide you on practice strategy, job applications, interview prep, and progress tracking. What should we tackle first, ${firstName}?`,
      suggestions: ['Practice DSA', 'Browse open jobs'],
      actions: ['open_dsa_practice', 'view_jobs'],
    },
  };

  return replies[intent] || replies.general;
}

function normalizeReplyPayload(payload) {
  const body = payload?.data ?? payload;
  const message = body?.message || body?.content;
  if (!message) return null;
  return {
    message,
    suggestions: Array.isArray(body?.suggestions) ? body.suggestions : [],
    actions: Array.isArray(body?.actions) ? body.actions : [],
  };
}

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAiOnline, setIsAiOnline] = useState(true);

  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const firstName = user?.fullName?.split(' ')[0] || 'there';
      const weak = user?.weakAreas?.[0] || 'DSA';
      const score = user?.lastMockScore;
      setMessages([
        {
          role: 'bot',
          content:
            `Hey ${firstName}! I am your AI Placement Mentor.` +
            (score != null
              ? ` Your last mock score was ${score}% and we can push it higher this week.`
              : ` Your weakest area looks like ${weak}. Ready to improve it today?`),
          suggestions: [`Practice ${weak}`, 'Browse open jobs'],
          actions: ['open_dsa_practice', 'view_jobs'],
        },
      ]);
    }
  }, [isOpen, messages.length, user]);

  const handleSend = async (messageOverride = null) => {
    const userMsg = (messageOverride ?? input).trim();
    if (!userMsg || isTyping) return;

    if (!messageOverride) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const history = messages.slice(-6).map(m => ({
      role: m.role === 'bot' ? 'assistant' : 'user',
      content: m.content,
    }));

    try {
      const { data } = await aiApi.chat(userMsg, history, buildContext(user));
      const parsed = normalizeReplyPayload(data);
      if (!parsed) throw new Error('Invalid AI payload');

      setIsAiOnline(true);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          content: parsed.message,
          suggestions: parsed.suggestions,
          actions: parsed.actions,
        },
      ]);
    } catch {
      const local = buildLocalMentorReply(userMsg, user);
      setIsAiOnline(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          content: local.message,
          suggestions: local.suggestions,
          actions: local.actions,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/20 bg-gradient-to-br from-cyan-500 via-blue-500 to-emerald-500 p-4 text-white shadow-[0_18px_60px_rgba(14,116,144,0.45)] transition-all hover:scale-105 hover:shadow-[0_22px_70px_rgba(8,145,178,0.58)]"
        aria-label="Open AI placement mentor"
      >
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-300/40 via-white/20 to-emerald-300/40 blur-sm" />
        <div className="relative">
          <Bot size={28} />
        </div>
      </button>
    );
  }

  return (
    <div ref={chatRef} className="fixed bottom-4 right-4 z-50 flex h-[76vh] w-[calc(100vw-2rem)] max-w-[430px] flex-col overflow-hidden rounded-3xl border border-cyan-200/40 bg-gradient-to-b from-[#f8fdff] via-[#effafc] to-[#ecf9f1] shadow-[0_30px_90px_rgba(8,47,73,0.28)] backdrop-blur-xl sm:bottom-6 sm:right-6 sm:h-[620px] sm:w-[430px]">

      <div className="pointer-events-none absolute -left-14 -top-16 h-40 w-40 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-emerald-300/35 blur-3xl" />

      <div className="relative border-b border-cyan-300/30 bg-gradient-to-r from-[#075985] via-[#0369a1] to-[#0f766e] px-5 py-4 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_55%)]" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-white/25 bg-white/15 p-2 shadow-inner">
              <BrainCircuit size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wide">AI Placement Mentor</h3>
              <p className="text-[10px] text-cyan-100/90">Powered by Placify Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                isAiOnline
                  ? 'border-emerald-200/70 bg-emerald-300/25 text-emerald-50'
                  : 'border-amber-100/70 bg-amber-300/25 text-amber-50'
              }`}
            >
              {isAiOnline ? 'Live AI' : 'Smart Local Mode'}
            </span>
            <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 transition-colors hover:bg-white/20">
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs ${
                msg.role === 'bot'
                  ? 'border border-cyan-200/70 bg-cyan-100 text-cyan-700'
                  : 'border border-slate-200 bg-white text-slate-600'
              }`}
            >
              {msg.role === 'bot' ? <Bot size={15} /> : <User size={15} />}
            </div>
            <div className="flex max-w-[84%] flex-col gap-1.5">
              <div
                className={`rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-[0_10px_24px_rgba(8,145,178,0.32)]'
                    : 'rounded-tl-sm border border-white/70 bg-white/90 text-slate-700 backdrop-blur-md'
                }`}
              >
                {msg.content}
              </div>

              {msg.suggestions?.length > 0 && (
                <div className="mt-0.5 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((s, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 rounded-full border border-cyan-200/70 bg-cyan-50/85 px-2.5 py-1 text-[11px] text-cyan-700"
                    >
                      <Sparkles size={10} />
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {msg.actions?.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {msg.actions
                    .filter(action => ACTION_MAP[action])
                    .map((action, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(ACTION_MAP[action].route)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-700/20 bg-gradient-to-r from-cyan-600 to-teal-600 px-3 py-2 text-xs font-medium text-white shadow-[0_8px_20px_rgba(8,145,178,0.26)] transition-all hover:translate-y-[-1px] hover:brightness-105"
                      >
                        <ArrowRight size={12} />
                        {ACTION_MAP[action].label}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200/70 bg-cyan-100 text-cyan-700">
              <Bot size={14} />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-white/70 bg-white/90 p-3 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 overflow-x-auto border-t border-cyan-200/45 bg-white/70 px-4 py-2.5">
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt}
            onClick={() => {
              setInput(prompt);
              handleSend(prompt);
            }}
            className="whitespace-nowrap rounded-full border border-cyan-100 bg-white px-2.5 py-1 text-[11px] text-slate-600 transition-colors hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="border-t border-cyan-200/45 bg-white/80 p-4">
        <div className="relative flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask your mentor..."
            className="flex-1 rounded-xl border border-cyan-200/80 bg-white/90 py-3 pl-4 pr-12 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            autoComplete="off"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-cyan-700 transition-colors hover:bg-cyan-50 disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between px-1">
          <span className="text-[10px] text-slate-500">Mentor focus: personalized placement strategy</span>
          <div className="flex items-center gap-2 text-cyan-700">
            <BriefcaseBusiness size={12} />
            <BarChart3 size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
