import { useEffect, useState } from "react";

// 👉 troque por chamada real quando o client.js existir
// import { apiGet } from "../api/client";

const Tooth = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7.5 3.5c-2.2 0-4 1.8-4 4 0 6.3 2.3 8.5 3.6 9.6.5.4 1.2.2 1.5-.4l1.2-2.5c.3-.6 1.2-.6 1.5 0l1.2 2.5c.3.6 1 .8 1.5.4C18.2 16 20.5 13.8 20.5 7.5c0-2.2-1.8-4-4-4-1.7 0-3.2.8-4.5 2-1.3-1.2-2.8-2-4.5-2Z" fill="#0ea5a8"/>
  </svg>
);

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MOCK provisório — depois troque por:
    // const data = await apiGet("/me/profile");
    const data = {
      email: "juju@odontoplay.com",
      total_points: 820,
      sessions: [
        { id: 3, score: 260, duration_sec: 70, played_at: "2025-11-05T08:40:00Z" },
        { id: 2, score: 300, duration_sec: 90, played_at: "2025-11-04T19:10:00Z" },
        { id: 1, score: 260, duration_sec: 60, played_at: "2025-11-03T15:30:00Z" },
      ],
    };
    setTimeout(() => { setProfile(data); setLoading(false); }, 400);
  }, []);

  if (loading) return <div className="op-container"><div className="op-card"><div className="op-skeleton"/></div></div>;
  if (!profile) return null;

  return (
    <div className="op-container">
      {/* Header */}
      <div className="op-hero">
        <div className="op-hero-left">
          <div className="op-logo"><Tooth size={34}/></div>
          <div>
            <h1 className="op-title">OdontoPlay</h1>
            <p className="op-subtle">{profile.email}</p>
          </div>
        </div>

        <div className="op-score">
          <span className="op-score-label">Pontos totais</span>
          <span className="op-score-value">{profile.total_points}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="op-card op-badges">
        {computeBadges(profile.total_points).map(b => (
          <span key={b.code} className="op-badge">{b.icon} {b.label}</span>
        ))}
        {computeBadges(profile.total_points).length === 0 && (
          <span className="op-subtle">Jogue para desbloquear conquistas!</span>
        )}
      </div>

      {/* Histórico */}
      <div className="op-card">
        <div className="op-card-head">
          <h2>Histórico de jogos</h2>
          <span className="op-chip">{profile.sessions.length} partidas</span>
        </div>

        {profile.sessions.length === 0 ? (
          <div className="op-empty">
            <Tooth/><p>Nenhuma partida ainda. Abra a boca 😄 e comece a caçar germes!</p>
          </div>
        ) : (
          <div className="op-table">
            <div className="op-thead">
              <div>Data</div><div>Pontuação</div><div>Duração</div>
            </div>
            <div className="op-tbody">
              {profile.sessions.map(s => (
                <div key={s.id} className="op-row">
                  <div>{new Date(s.played_at).toLocaleString()}</div>
                  <div className="op-strong">{s.score}</div>
                  <div>{s.duration_sec ? `${s.duration_sec}s` : "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function computeBadges(total) {
  const defs = [
    { code: "start", min: 1,    label: "Primeira Limpeza", icon: "🪥" },
    { code: "100",   min: 100,  label: "Anti-Placa 100+", icon: "🧼" },
    { code: "500",   min: 500,  label: "Sorriso Saudável 500+", icon: "😄" },
    { code: "1k",    min: 1000, label: "Mestre da Higiene 1k+", icon: "🏆" },
  ];
  return defs.filter(b => total >= b.min);
}
