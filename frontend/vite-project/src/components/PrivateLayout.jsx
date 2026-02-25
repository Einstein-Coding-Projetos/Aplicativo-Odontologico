import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logoHJE from "../assets/HJE2.ico";

export default function PrivateLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [temNotificacao, setTemNotificacao] = useState(false);
  const location = useLocation();

  useEffect(() => {
    function verificarNotificacao() {
      const notif = localStorage.getItem("notificacao_personagem");
      setTemNotificacao(notif === "true");
    }

    verificarNotificacao();

    window.addEventListener("storage", verificarNotificacao);

    return () => {
      window.removeEventListener("storage", verificarNotificacao);
    };
  }, []);

  useEffect(() => {
    const notif = localStorage.getItem("notificacao_personagem");
    setTemNotificacao(notif === "true");
  }, [location]);

  useEffect(() => {
    function atualizar() {
      const notif = localStorage.getItem("notificacao_personagem");
      setTemNotificacao(notif === "true");
    }

    window.addEventListener("notificacaoAtualizada", atualizar);

    return () => {
      window.removeEventListener("notificacaoAtualizada", atualizar);
    };
  }, []);

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      fontFamily: "'Nunito', sans-serif", 
      backgroundColor: "#f9fafb" 
    }}>
      
      {/* Estilos Responsivos para a Navbar (CSS-in-JS) */}
      <style>{`
        @media (min-width: 768px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile-btn { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
        @media (max-width: 767px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        @media (min-width: 768px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile-btn { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>

      {/* Navbar Horizontal Fixa */}
      <header style={{ 
        backgroundColor: "white", 
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
        position: "sticky", 
        top: 0, 
        zIndex: 50 
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          padding: "0 20px", 
          height: "70px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between" 
        }}>
            {/* Logo com fonte Baloo 2 */}
            <div style={{ 
              fontSize: "2.0rem", 
              fontWeight: "800", 
              color: "#0ea5e9",
              fontFamily: "'Baloo 2', sans-serif"  // Alteração para Baloo 2
            }}>
                OdontoGame
            </div>

            {/* Menu Desktop (Horizontal) */}
            <nav className="nav-desktop" style={{ gap: "30px", alignItems: "center" }}>
                <Link to="/home" style={navLinkStyle}>Home</Link>
                <Link to="/jogo" style={navLinkStyle}>Jogo</Link>
                <Link to="/questionario" style={navLinkStyle}>Questionário</Link>
                <Link to="/ranking" style={navLinkStyle}>Ranking</Link>
                <Link to="/perfil" style={navLinkStyle}>Perfil</Link>
                <div style={{ position: "relative" }}>
                  <Link to="/personagens" style={navLinkStyle}>
                    Personagens
                  </Link>

                    {temNotificacao && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-10px",
                          width: "10px",
                          height: "10px",
                          backgroundColor: "#EF4444",
                          borderRadius: "50%",
                          boxShadow: "0 0 0 2px white",
                          animation: "pulse 1.2s infinite"
                        }}
                      />
                    )}
                  </div>
            </nav>

            {/* Botão Hamburguer Mobile */}
            <button 
                className="nav-mobile-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  fontSize: "1.8rem", 
                  cursor: "pointer", 
                  color: "#334155",
                  padding: "5px"
                }}
            >
                {isMenuOpen ? "✕" : "☰"}
            </button>
        </div>

        {/* Menu Mobile (Dropdown) */}
        {isMenuOpen && (
            <div className="nav-mobile-menu" style={{ 
              backgroundColor: "white", 
              borderTop: "1px solid #f1f5f9", 
              padding: "20px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
                <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <Link to="/home" onClick={() => setIsMenuOpen(false)} style={mobileNavLinkStyle}>Home</Link>
                    <Link to="/jogo" onClick={() => setIsMenuOpen(false)} style={mobileNavLinkStyle}>Jogo</Link>
                    <Link to="/questionario" onClick={() => setIsMenuOpen(false)} style={mobileNavLinkStyle}>Questionário</Link>
                    <Link to="/ranking" onClick={() => setIsMenuOpen(false)} style={mobileNavLinkStyle}>Ranking</Link>
                    <Link to="/perfil" onClick={() => setIsMenuOpen(false)} style={mobileNavLinkStyle}>Perfil</Link>
                    <div style={{ position: "relative" }}>
                      <Link 
                        to="/personagens" 
                        onClick={() => setIsMenuOpen(false)} 
                        style={mobileNavLinkStyle}
                      >
                        Personagens
                      </Link>

                      {temNotificacao && (
                        <span
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "12px",
                            width: "10px",
                            height: "10px",
                            backgroundColor: "#EF4444",
                            borderRadius: "50%"
                          }}
                        />
                      )}
                    </div>
                </nav>
            </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main style={{ 
        flex: 1, 
        width: "100%", 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "20px" 
      }}>
        <Outlet />
      </main>

      {/* Rodapé */}
      <footer style={{ 
        backgroundColor: "white", 
        borderTop: "1px solid #e5e7eb", 
        padding: "20px", 
        textAlign: "center" 
      }}>
         <div style={{ opacity: 0.6, fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#64748b" }}>
            <span>Desenvolvido por Healthtech Júnior Einstein</span>
            <img src={logoHJE} alt="HJE" style={{ height: "24px" }} />
         </div>
      </footer>
    </div>
  );
}

// Estilos para os links
const navLinkStyle = {
    textDecoration: "none",
    color: "#E15148",
    fontWeight: "600",
    fontSize: "1.4rem",
    transition: "color 0.2s",
    fontFamily: "'Baloo 2', sans-serif" // Alterando fonte para Baloo 2
};

const mobileNavLinkStyle = {
    textDecoration: "none",
    color: "#334155",
    fontWeight: "600",
    fontSize: "1.1rem",
    display: "block",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#f1f5f9",
    textAlign: "center",
    fontFamily: "'Baloo 2', sans-serif" // Alterando fonte para Baloo 2
};