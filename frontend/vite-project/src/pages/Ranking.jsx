import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Ranking() {
  const { user } = useContext(AuthContext);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Injeta a fonte Nunito (Google Fonts)
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    async function fetchRanking() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access");
        const headers = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`http://127.0.0.1:8000/api/game/ranking/?page=${page}`, {
             headers: headers
        });
        if (response.ok) {
          const data = await response.json();
          setRanking(data.results);
          setTotalPages(data.num_pages);
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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F3F4F6', color: '#8B5CF6', fontFamily: "'Nunito', sans-serif", fontWeight: 'bold' }}>Carregando ranking...</div>;

  return (
    <div className="page-container">
      {/* Estilos de Animação */}
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .page-container {
          min-height: 100vh;
          background-color: #F3F4F6;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Nunito', sans-serif;
          box-sizing: border-box;
          padding: 0; /* Mobile: Full screen */
          overflow-x: hidden;
        }

        .ranking-card {
          width: 100%;
          min-height: 100vh; /* Mobile: Altura total */
          background-color: #fff;
          border-radius: 0;
          box-shadow: none;
          overflow: hidden;
          position: relative;
          animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        @media (min-width: 768px) {
          .page-container { padding: 20px; }
          .ranking-card {
            min-height: auto;
            max-width: 900px; /* Maior no PC */
            width: 90%;
            border-radius: 35px;
            box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);
          }
        }
      `}</style>
      
      <div className="ranking-card">
        
        {/* Header */}
        <div style={{ 
          background: "linear-gradient(135deg, #4facfe, #00f2fe)", 
          padding: "30px 25px 50px 25px",
          color: "white",
          textAlign: "center",
          position: "relative"
        }}>
          <h2 style={{ margin: "0", fontSize: "1.8rem", fontWeight: "800", letterSpacing: "0.5px" }}>
             Ranking Global
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: "0.9rem", opacity: 0.9, fontWeight: "600" }}>
            Os melhores do jogo!
          </p>
        </div>

        {/* Conteúdo */}
        <div style={{ 
          backgroundColor: "#fff", 
          marginTop: "-25px", 
          borderRadius: "30px 30px 0 0", 
          padding: "25px", 
          position: "relative",
          minHeight: "400px",
          flex: 1 // Preenche o espaço restante
        }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {ranking.length > 0 ? (
              ranking.map((jogador) => {
                const isCurrentUser = user?.username?.toLowerCase() === jogador.nome?.toLowerCase();
                return (
                  <div key={jogador.posicao} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    padding: "12px", 
                    borderRadius: "18px",
                    backgroundColor: isCurrentUser ? "#FFFBEB" : "#fff", 
                    border: isCurrentUser ? "2px solid #FCD34D" : "1px solid #F3F4F6",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
                  }}>
                    
                    {/* Posição */}
                    <div style={{ 
                      width: "35px", 
                      textAlign: "center", 
                      fontWeight: "800", 
                      fontSize: "1.1rem", 
                      color: "#6B7280",
                      marginRight: "10px"
                    }}>
                      {jogador.posicao === 1 ? "🥇" : jogador.posicao === 2 ? "🥈" : jogador.posicao === 3 ? "🥉" : `#${jogador.posicao}`}
                    </div>

                    {/* Avatar */}
                    <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=random&color=fff&size=40&bold=true`} 
                        alt="Avatar" 
                        style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "12px", border: "2px solid #E5E7EB" }} 
                    />

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "700", color: "#374151", fontSize: "0.95rem" }}>
                        {jogador.nome} {isCurrentUser && "(Você)"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#9CA3AF", display: "flex", gap: "5px", alignItems: "center" }}>
                        <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "2px 6px", borderRadius: "10px", fontWeight: "bold" }}>
                          Lvl {jogador.nivel}
                        </span>
                        <span>{jogador.badge}</span>
                      </div>
                    </div>

                    {/* Pontos */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "800", color: "#10B981" }}>{jogador.pontos}</div>
                      <div style={{ fontSize: "0.65rem", color: "#D1D5DB", fontWeight: "600" }}>PTS</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                Nenhum jogador encontrado.
              </div>
            )}
          </div>

          {/* Paginação */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "30px" }}>
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => p - 1)}
              style={{ 
                padding: "10px 15px", 
                borderRadius: "12px", 
                border: "none",
                backgroundColor: page === 1 ? "#F3F4F6" : "#E0F2FE", 
                color: page === 1 ? "#9CA3AF" : "#0284C7",
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontWeight: "bold"
              }}
        >
              ⬅
        </button>
            <span style={{ fontWeight: "bold", color: "#4B5563", fontSize: "0.9rem" }}>
              {page} / {totalPages}
            </span>
        <button 
          disabled={page === totalPages} 
          onClick={() => setPage(p => p + 1)}
              style={{ 
                padding: "10px 15px", 
                borderRadius: "12px", 
                border: "none",
                backgroundColor: page === totalPages ? "#F3F4F6" : "#E0F2FE", 
                color: page === totalPages ? "#9CA3AF" : "#0284C7",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                fontWeight: "bold"
              }}
        >
              ➡
        </button>
          </div>

        </div>
      </div>
    </div>
  );
}