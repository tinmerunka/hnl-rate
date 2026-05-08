import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getClubs } from '../../services/clubService';
import { getMatches } from '../../services/matchService';
import { getPlayers } from '../../services/playerService';
import { getReferees } from '../../services/refereeService';
import { getAdminStats } from '../../services/userAdminService';

// ─── Count-up hook ───────────────────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return count;
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, subtext, icon, accent, loading, delay = 0 }) {
  const displayed = useCountUp(loading ? 0 : value);
  return (
    <div
      className="relative bg-hnl-card rounded-2xl overflow-hidden border border-white/[0.06] p-6 flex flex-col gap-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Accent glow top-left */}
      <div
        className="absolute -top-10 -left-10 w-32 h-32 rounded-full opacity-[0.07] blur-2xl pointer-events-none"
        style={{ background: accent }}
      />
      {/* Top row: icon + label */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
      </div>
      {/* Number */}
      <div className="flex items-end gap-2">
        <span
          className="text-[42px] font-black font-display leading-none tabular-nums tracking-tight text-white"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {loading ? '—' : displayed}
        </span>
      </div>
      {/* Subtext */}
      {subtext && (
        <p className="text-[12px] text-white/30 leading-relaxed -mt-1">{subtext}</p>
      )}
      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-40"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />
    </div>
  );
}

// ─── Club logo ───────────────────────────────────────────────────────────────
function ClubLogo({ club, size = 7 }) {
  const cls = `w-${size} h-${size} object-contain shrink-0`;
  if (club?.logoUrl) {
    return (
      <img src={club.logoUrl} alt={club.name} className={cls}
        onError={(e) => { e.target.style.display = 'none'; }} />
    );
  }
  return (
    <div className={`w-${size} h-${size} bg-white/[0.06] rounded-lg flex items-center justify-center text-white/20 text-[11px] font-bold shrink-0`}>
      {club?.name?.[0] ?? '?'}
    </div>
  );
}

// ─── Format date ─────────────────────────────────────────────────────────────
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : '—';

// ─── Main ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [clubs, matches, players, referees, adminStats] = await Promise.all([
        getClubs(), getMatches(), getPlayers(), getReferees(), getAdminStats(),
      ]);
      setData({ clubs, matches, players, referees, activeSessions: adminStats.activeSessions });
    } catch (_) {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const finished = data?.matches.filter(m => m.finished) ?? [];
  const upcoming = data?.matches
    .filter(m => !m.finished)
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
    .slice(0, 6) ?? [];
  const recent = finished
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, 6);

  // Today's date in Croatian
  const todayStr = new Date().toLocaleDateString('hr-HR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const todayCap = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  const stats = [
    {
      label: 'Klubovi',
      value: data?.clubs.length ?? 0,
      accent: '#e63946',
      subtext: 'U ligi',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M10 2a1 1 0 01.894.553l2.184 4.424 4.883.71a1 1 0 01.554 1.706l-3.534 3.443.834 4.863a1 1 0 01-1.451 1.054L10 16.347l-4.364 2.294a1 1 0 01-1.451-1.054l.834-4.863L1.485 9.393a1 1 0 01.554-1.706l4.883-.71L9.106 2.553A1 1 0 0110 2z"/>
        </svg>
      ),
    },
    {
      label: 'Utakmice',
      value: data?.matches.length ?? 0,
      accent: '#38bdf8',
      subtext: `${finished.length} odigranih · ${(data?.matches.length ?? 0) - finished.length} zakazanih`,
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
        </svg>
      ),
    },
    {
      label: 'Igrači',
      value: data?.players.length ?? 0,
      accent: '#a78bfa',
      subtext: 'Registrirani igrači',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
        </svg>
      ),
    },
    {
      label: 'Suci',
      value: data?.referees.length ?? 0,
      accent: '#fb923c',
      subtext: 'Aktivni suci',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
        </svg>
      ),
    },
    {
      label: 'Prijavljeni',
      value: data?.activeSessions ?? 0,
      accent: '#34d399',
      subtext: 'Aktivne sesije',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-full p-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-hnl-red mb-2">
            Pregled
          </p>
          <h1 className="text-[32px] font-black font-display text-white tracking-tight leading-none mb-2">
            Dashboard<span className="text-hnl-red">.</span>
          </h1>
          <p className="text-[13px] text-white/30">{todayCap}</p>
        </div>

        <div className="flex items-center gap-2 bg-hnl-card border border-white/[0.06] rounded-full px-4 py-2 mt-1">
          <span className="text-[12px] font-medium text-white/35">SuperSport HNL · 2025</span>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} loading={loading} delay={i * 60} />
        ))}
      </div>

      {/* ── Bottom section ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_360px] gap-4">

        {/* Upcoming matches */}
        <div className="bg-hnl-card rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-4 rounded-full bg-hnl-red" />
              <h2 className="text-[14px] font-bold text-white">Nadolazeće utakmice</h2>
            </div>
            <Link to="/dashboard/matches"
              className="text-[11px] font-semibold text-white/30 hover:text-hnl-red transition-colors">
              Sve utakmice →
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-white/[0.04]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="h-5 w-14 rounded bg-white/[0.06] animate-pulse shrink-0" />
                  <div className="flex-1 flex justify-end gap-2">
                    <div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" />
                    <div className="h-6 w-6 rounded-md bg-white/[0.06] animate-pulse" />
                  </div>
                  <div className="w-14 flex justify-center">
                    <div className="h-3 w-8 rounded bg-white/[0.06] animate-pulse" />
                  </div>
                  <div className="flex-1 flex gap-2">
                    <div className="h-6 w-6 rounded-md bg-white/[0.06] animate-pulse" />
                    <div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-white/20">
              <p className="text-sm">Nema zakazanih utakmica.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {upcoming.map((m) => (
                <div key={m.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors group">
                  {/* Kolo */}
                  <span className="text-[11px] font-bold text-white/20 bg-white/[0.04] rounded px-2 py-0.5 tabular-nums w-14 text-center shrink-0">
                    Kolo {m.round}
                  </span>

                  {/* Home */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-[13px] font-semibold text-white/80 text-right">{m.homeClub?.name ?? '—'}</span>
                    <ClubLogo club={m.homeClub} size={6} />
                  </div>

                  {/* vs */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0 w-14">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">vs</span>
                    <span className="text-[10px] text-white/20">{fmtDate(m.date)}</span>
                  </div>

                  {/* Away */}
                  <div className="flex items-center gap-2 flex-1">
                    <ClubLogo club={m.awayClub} size={6} />
                    <span className="text-[13px] font-semibold text-white/80">{m.awayClub?.name ?? '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent results */}
        <div className="bg-hnl-card rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-4 rounded-full bg-[#38bdf8]" />
              <h2 className="text-[14px] font-bold text-white">Nedavni rezultati</h2>
            </div>
          </div>

          {loading ? (
            <div className="divide-y divide-white/[0.04]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex justify-end">
                      <div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" />
                    </div>
                    <div className="h-6 w-16 rounded-lg bg-white/[0.06] animate-pulse shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" />
                    </div>
                  </div>
                  <div className="flex justify-center mt-1.5">
                    <div className="h-3 w-28 rounded bg-white/[0.06] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-white/20">
              <p className="text-sm">Nema odigranih utakmica.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recent.map((m) => (
                <div key={m.id} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Home */}
                    <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                      <span className="text-[12px] font-semibold text-white/70 truncate text-right">{m.homeClub?.name ?? '—'}</span>
                      <ClubLogo club={m.homeClub} size={5} />
                    </div>

                    {/* Score */}
                    <div
                      className="text-[13px] font-black tabular-nums text-white shrink-0 px-2.5 py-0.5 rounded-lg"
                      style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}
                    >
                      {m.result ?? '? : ?'}
                    </div>

                    {/* Away */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <ClubLogo club={m.awayClub} size={5} />
                      <span className="text-[12px] font-semibold text-white/70 truncate">{m.awayClub?.name ?? '—'}</span>
                    </div>
                  </div>

                  <div className="flex justify-center mt-1">
                    <span className="text-[10px] text-white/20 tabular-nums">
                      Kolo {m.round} · {fmtDate(m.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
