import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Ranking() {
  const { user } = useContext(AuthContext);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Fonte Nunito
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    async function fetchRanking() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access");
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(
          `http://127.0.0.1:8000/api/game/ranking/?page=${page}`,
          { headers }
        );

        if (response.ok) {
          const data = await response.json();
          setRanking(data.results || []);
          setTotalPages(data.num_pages || 1);
        } else {
          console.error("Erro ao buscar ranking:", response.status);
          alert("Não foi possível carregar o ranking.");
        }
      } catch (error) {
        console.error("Erro ao buscar ranking", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, [page]);

  const top3 = useMemo(() => ranking.slice(0, 3), [ranking]);
  const rest = useMemo(() => ranking.slice(3), [ranking]);

  const usernameLower = (user?.username || "").toLowerCase();

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#8BA26E",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Nunito', sans-serif",
          color: "rgba(255,255,255,0.95)",
          fontWeight: 900,
          fontSize: "1.1rem",
          textShadow: "0 4px 0 rgba(0,0,0,0.12), 0 12px 22px rgba(0,0,0,0.12)",
        }}
      >
        Carregando ranking...
      </div>
    );

  return (
    <div className="page">
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .page{
          min-height: 100vh;
          background: #8BA26E;
          font-family: 'Nunito', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 18px;
          box-sizing: border-box;
          overflow-x: hidden;
          position: relative;
        }

        .card{
          width: 100%;
          max-width: 980px;
          background: rgba(255,255,255,0.20);
          border: 6px solid rgba(255,255,255,0.55);
          border-radius: 34px;
          box-shadow: 0 16px 0 rgba(255,255,255,0.12), 0 26px 50px rgba(0,0,0,0.18);
          overflow: hidden;
          position: relative;
          animation: popIn 0.55s cubic-bezier(0.2,0.9,0.2,1);
          backdrop-filter: blur(6px);
        }

        .header{
        padding: 26px 22px 18px 22px;
        position: relative;
        color: rgba(255,255,255,0.95);
        text-align: center;
        background: #3A5A40; /* <-- AQUI */
        }

        .title{
          margin: 0;
          font-weight: 900;
          letter-spacing: 0.5px;
          font-size: 2.2rem;
          text-shadow: 2px 2px 0 rgba(0,0,0,0.14), 0 6px 0px rgba(0,0,0,0.14);
        }

        .subtitle{
          margin: 6px 0 0 0;
          font-weight: 800;
          opacity: 0.92;
          font-size: 0.95rem;
        }

        .body{
          background: rgba(255,255,255,0.92);
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
          padding: 18px;
          box-sizing: border-box;
        }

        /* PÓDIO */
        .podium{
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          align-items: end;
          margin-top: 8px;
          margin-bottom: 18px;
        }

        .podiumCard{
          border-radius: 22px;
          padding: 14px 12px;
          box-shadow: 0 10px 18px rgba(0,0,0,0.08);
          border: 2px solid rgba(0,0,0,0.06);
          position: relative;
          overflow: hidden;
        }

        .podiumCard::after{
          content: "";
          position: absolute;
          inset: -80px -80px auto auto;
          width: 160px;
          height: 160px;
          background: radial-gradient(circle, rgba(255,255,255,0.55) 0, transparent 60%);
          transform: rotate(12deg);
          opacity: 0.55;
        }

        .podium1{ background: #FFF7D1; min-height: 210px; }
        .podium2{ background: #E8F2FF; min-height: 180px; }
        .podium3{ background: #FFE7F2; min-height: 168px; }

        .podiumTop{
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .medal{
          font-size: 1.7rem;
        }

        .pos{
          font-weight: 900;
          font-size: 0.9rem;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(0,0,0,0.06);
          color: rgba(0,0,0,0.65);
        }

        .podiumAvatar{
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .podiumAvatar img{
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 2px solid rgba(0,0,0,0.12);
        }

        .name{
          font-weight: 900;
          color: rgba(0,0,0,0.78);
          font-size: 1.02rem;
          line-height: 1.05;
        }

        .mini{
          margin-top: 6px;
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .pill{
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 900;
          background: rgba(0,0,0,0.06);
          color: rgba(0,0,0,0.65);
        }

        .pts{
          margin-top: 10px;
          font-weight: 900;
          font-size: 1.25rem;
          color: rgba(0,0,0,0.75);
        }

        /* LISTA */
        .list{
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 6px;
        }

        .row{
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 8px 14px rgba(0,0,0,0.04);
          background: white;
        }

        .row.me{
          background: #FFFBEB;
          border: 3px solid #FCD34D;
          box-shadow: 0 10px 0 rgba(245,158,11,0.20), 0 18px 24px rgba(245,158,11,0.18);
        }

        .rankNum{
          width: 42px;
          text-align: center;
          font-weight: 900;
          color: rgba(0,0,0,0.55);
        }

        .avatar{
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid rgba(0,0,0,0.10);
        }

        .info{
          flex: 1;
          min-width: 0;
        }

        .info .n{
          font-weight: 900;
          color: rgba(0,0,0,0.75);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .info .sub{
          margin-top: 4px;
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .badge{
          font-size: 0.75rem;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 999px;
          background: #E0F2FE;
          color: #0369A1;
        }

        .points{
          text-align: right;
          font-weight: 900;
          color: #16A34A;
        }

        .points small{
          display: block;
          font-size: 0.65rem;
          color: rgba(0,0,0,0.35);
          font-weight: 900;
          letter-spacing: 0.4px;
        }

        .pagination{
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 14px;
          margin-top: 18px;
          padding-bottom: 6px;
        }

        .btn{
          border: 3px solid rgba(0,0,0,0.08);
          padding: 12px 18px;
          border-radius: 999px;
          font-weight: 900;
          cursor: pointer;
          background: #E0F2FE;
          color: #0369A1;
          box-shadow: 0 6px 0 rgba(0,0,0,0.10), 0 12px 18px rgba(0,0,0,0.10);
          transition: transform 120ms ease, box-shadow 120ms ease;
        }
        .btn:active{
        transform: translateY(2px);
        box-shadow: 0 4px 0 rgba(0,0,0,0.10), 0 10px 14px rgba(0,0,0,0.10);
        }

        .btn:hover{ transform: translateY(-1px); }

        .btn:disabled{
          cursor: not-allowed;
          background: #E5E7EB;
          color: #9CA3AF;
          transform: none;
          box-shadow: none;
        }

        .pageCount{
          font-weight: 900;
          color: rgba(0,0,0,0.55);
          background: rgba(255,255,255,0.9);
          padding: 8px 12px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.06);
        }

        @media (max-width: 760px){
          .podium{
            grid-template-columns: 1fr;
            align-items: stretch;
          }
          .podium1, .podium2, .podium3{
            min-height: auto;
          }
          .title{ font-size: 1.8rem; }
        }
      `}</style>

      <div className="card">
        <div className="header">
          <h2 className="title"> Ranking Global </h2>
          <p className="subtitle">Os melhores do jogo!</p>
        </div>

        <div className="body">
          {/* PÓDIO TOP 3 */}
          {top3.length > 0 ? (
            <div className="podium">
              {/* 2º */}
              <Podium
                variant="podium2"
                medal="🥈"
                posLabel="2º"
                jogador={top3[1]}
                usernameLower={usernameLower}
              />

              {/* 1º */}
              <Podium
                variant="podium1"
                medal="🥇"
                posLabel="1º"
                jogador={top3[0]}
                usernameLower={usernameLower}
              />

              {/* 3º */}
              <Podium
                variant="podium3"
                medal="🥉"
                posLabel="3º"
                jogador={top3[2]}
                usernameLower={usernameLower}
              />
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px", color: "rgba(0,0,0,0.55)", fontWeight: 900 }}>
              Nenhum jogador encontrado.
            </div>
          )}

          {/* LISTA RESTANTE */}
          <div className="list">
            {rest.map((jogador) => {
              const isCurrentUser =
                (jogador?.nome || "").toLowerCase() === usernameLower && usernameLower.length > 0;

              return (
                <div key={jogador.posicao} className={`row ${isCurrentUser ? "me" : ""}`}>
                  <div className="rankNum">#{jogador.posicao}</div>

                  <img
                    className="avatar"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      jogador.nome
                    )}&background=random&color=fff&size=42&bold=true`}
                    alt="Avatar"
                  />

                  <div className="info">
                    <div className="n">
                      {jogador.nome} {isCurrentUser && "(Você)"}
                    </div>
                    <div className="sub">
                      <span className="badge">Lvl {jogador.nivel}</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "rgba(0,0,0,0.50)" }}>
                        {jogador.badge}
                      </span>
                    </div>
                  </div>

                  <div className="points">
                    ⭐ {jogador.pontos}
                    <small>PTS</small>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINAÇÃO */}
          <div className="pagination">
            <button className="btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              ⬅
            </button>

            <span className="pageCount">
              {page} / {totalPages}
            </span>

            <button
              className="btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ➡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Podium({ variant, medal, posLabel, jogador, usernameLower }) {
  if (!jogador) {
    return (
      <div className={`podiumCard ${variant}`} style={{ opacity: 0.65 }}>
        <div className="podiumTop">
          <div className="medal">{medal}</div>
          <div className="pos">{posLabel}</div>
        </div>
        <div style={{ marginTop: 12, fontWeight: 900, color: "rgba(0,0,0,0.60)" }}>
          Vazio por enquanto...
        </div>
      </div>
    );
  }

  const isMe =
    (jogador?.nome || "").toLowerCase() === usernameLower && usernameLower.length > 0;

  return (
    <div className={`podiumCard ${variant}`} style={isMe ? { outline: "3px solid #FCD34D" } : null}>
      <div className="podiumTop">
        <div className="medal">{medal}</div>
        <div className="pos">{posLabel}</div>
      </div>

      <div className="podiumAvatar">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            jogador.nome
          )}&background=random&color=fff&size=46&bold=true`}
          alt="Avatar"
        />
        <div style={{ minWidth: 0 }}>
          <div className="name">
            {jogador.nome} {isMe && "(Você)"}
          </div>
          <div className="mini">
            <span className="pill">Lvl {jogador.nivel}</span>
            <span className="pill">{jogador.badge}</span>
          </div>
        </div>
      </div>

      <div className="pts">⭐ {jogador.pontos} pts</div>
    </div>
  );
}