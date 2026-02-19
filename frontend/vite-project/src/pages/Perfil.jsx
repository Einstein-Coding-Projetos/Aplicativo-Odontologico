import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

// Componente visual simples para as Barras de Progresso (inspirado na imagem)
const StatBar = ({ label, value, max, color, showMax = false }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.85rem", color: "#6B7280", fontWeight: "600" }}>
        <span>{label}</span>
        <span>{value}{showMax ? ` / ${max}` : ""}</span>
      </div>
      <div style={{ width: "100%", height: "8px", backgroundColor: "#F3F4F6", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: color, borderRadius: "10px", transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </div>
    </div>
  );
};

// Componente para renderizar estrelas proporcionais ao nível
const MAX_LEVEL = 10; // Define o nível máximo para o cálculo (Nível 10 = 5 estrelas)

const StarRating = ({ level }) => {
  // Garante que o nível esteja dentro dos limites (1 a MAX_LEVEL)
  const safeLevel = Math.max(1, Math.min(level, MAX_LEVEL));
  
  // Calcula a porcentagem de preenchimento (0% a 100%)
  // Fórmula: (Nível Atual - 1) / (Total de Níveis - 1)
  const percentage = ((safeLevel - 1) / (MAX_LEVEL - 1)) * 100;

  return (
    <div style={{ position: "relative", display: "inline-block", fontSize: "1.2rem", lineHeight: 1 }}>
      {/* Estrelas de Fundo (Cinza) */}
      <div style={{ color: "#D1D5DB" }}>★★★★★</div>
      
      {/* Estrelas de Frente (Douradas) - Recortadas pela largura */}
      <div style={{ position: "absolute", top: 0, left: 0, width: `${percentage}%`, overflow: "hidden", color: "#FCD34D", whiteSpace: "nowrap" }}>
        ★★★★★
      </div>
    </div>
  );
};

export default function Perfil() {
  const { user, logout } = useContext(AuthContext);
  const [perfil, setPerfil] = useState(null);
  const [erro, setErro] = useState(null);
  const [showBadges, setShowBadges] = useState(false);
  const [showEdit, setShowEdit] = useState(false); // Modal de edição
  const [editType, setEditType] = useState(""); // "email" ou "senha"

  useEffect(() => {
    // Injeta a fonte Nunito (Google Fonts) dinamicamente para garantir o visual arredondado
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    async function fetchPerfil() {
      if (!user) return;
      
      const usuarioReal = user.user || user;
      const userId = usuarioReal.id || usuarioReal.user_id || usuarioReal.pk || usuarioReal.sub;
      let username = typeof usuarioReal === "string" ? usuarioReal : (usuarioReal.username || usuarioReal.name);

      if (!username) username = localStorage.getItem("username");
      if (username === "null" || username === "undefined") username = null;

      const identificador = userId || username;

      if (!identificador) {
        setErro("Não foi possível identificar o usuário logado.");
        return;
      }
      
      const url = `http://127.0.0.1:8000/api/game/obter-perfil/?user=${encodeURIComponent(identificador)}`;
      const token = localStorage.getItem("access");

      try {
        const response = await fetch(url, {
          headers: { "Authorization": `Bearer ${token}` },
          cache: "no-store" // Garante que sempre busque os dados mais recentes
        }); 
        if (response.ok) {
          const data = await response.json();
          setPerfil(data);
          setErro(null);
        } else {
          setErro("Erro ao carregar perfil.");
        }
      } catch (error) {
        setErro("Erro de conexão com o servidor.");
      }
    }

    fetchPerfil();
  }, [user]);

  // Estilos de erro mantidos, mas suavizados
  if (erro) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F3F4F6', fontFamily: "'Nunito', sans-serif" }}>
       <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#EF4444', margin: 0 }}>Ops!</h3>
          <p style={{ color: '#6B7280' }}>{erro}</p>
          <button onClick={logout} style={{ marginTop: '15px', padding: '10px 20px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
       </div>
    </div>
  );

  if (!perfil) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F3F4F6', color: '#8B5CF6', fontFamily: "'Nunito', sans-serif", fontWeight: 'bold' }}>Carregando seu perfil...</div>;

  // Lógica de XP para o Frontend
  const XP_POR_NIVEL = 100;
  const isMaxLevel = perfil.nivel >= 10;
  const xpAtual = isMaxLevel ? XP_POR_NIVEL : (perfil.pontos_totais % XP_POR_NIVEL);

  // Função para salvar alterações
  const handleUpdate = async (e) => {
    e.preventDefault();
    const valor = e.target.valor.value;
    const token = localStorage.getItem("access");
    
    const body = editType === "email" ? { email: valor } : { senha: valor };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/game/atualizar-usuario/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        alert("Atualizado com sucesso!");
        setShowEdit(false);
        window.location.reload(); // Recarrega para atualizar dados
      } else {
        alert("Erro ao atualizar.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  // --- LAYOUT E ESTILOS INSPIRADOS NA IMAGEM ---
  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#F3F4F6", // Fundo cinza suave para destacar o cartão
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "'Nunito', sans-serif"
    }}>
      
      {/* Estilos de Animação Injetados */}
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      
      {/* Container Principal (O "Celular" da imagem) */}
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        backgroundColor: "#fff", 
        borderRadius: "35px", 
        boxShadow: "0 20px 40px rgba(139, 92, 246, 0.15)", // Sombra roxa suave
        overflow: "hidden",
        position: "relative",
        animation: "slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)" // Animação suave de entrada
      }}>

        {/* 1. Header Roxo (Gradiente igual ao da imagem) */}
        <div style={{ 
          background: "linear-gradient(135deg, #4facfe, #00f2fe)", 
          padding: "30px 25px 50px 25px",
          color: "white",
          textAlign: "center",
          position: "relative"
        }}>
          {/* Avatar com "Glow" */}
          <div style={{ 
            width: "100px", 
            height: "100px", 
            margin: "0 auto 15px", 
            padding: "4px",
            background: "rgba(255,255,255,0.2)", // Anel translúcido
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(perfil.nome)}&background=FCD34D&color=B45309&size=128&bold=true`} 
              alt="Avatar" 
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "3px solid white" }} 
            />
          </div>

          <h2 style={{ margin: "0", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "0.5px" }}>
            {perfil.nome}
          </h2>

          <p style={{ margin: "5px 0 0", fontSize: "0.85rem", opacity: 0.9, fontWeight: "600" }}>
            {perfil.email || "Sem e-mail cadastrado"}
          </p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginTop: "5px", alignItems: "center" }}>
             <span style={{ fontSize: "0.9rem", opacity: 0.9 }}>Nível {perfil.nivel}</span>
             <StarRating level={perfil.nivel} />
          </div>
        </div>

        {/* 2. Conteúdo Principal (Sobrepondo o Header com border-radius) */}
        <div style={{ 
          backgroundColor: "#fff", 
          marginTop: "-25px", 
          borderRadius: "30px 30px 0 0", 
          padding: "25px", 
          position: "relative"
        }}>
          
          {/* Badge Principal (Inspirado no título "Characters" da imagem) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
             <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#1F2937", fontWeight: "800" }}>Estatísticas</h3>

             <span style={{ 
               background: "#FEF3C7", color: "#D97706", padding: "4px 12px", borderRadius: "20px", 
               fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" 
             }}>
               {perfil.badges.length > 0 ? perfil.badges[perfil.badges.length - 1] : "Novato"}
             </span>
          </div>

          {/* Card de Stats (Estilo "Zelda" da imagem) */}
          <div style={{ 
            padding: "20px", 
            borderRadius: "20px", 
            backgroundColor: "#fff", 
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)", // Sombra bem leve (neumorfismo)
            border: "1px solid #F3F4F6",
            marginBottom: "30px"
          }}>
            {/* Transformando seus dados em Barras Visuais */}
            <StatBar 
              label={isMaxLevel ? "Nível Máximo Alcançado!" : `XP para o Nível ${perfil.nivel + 1}`} 
              value={xpAtual} 
              max={XP_POR_NIVEL} 
              color={isMaxLevel ? "#F59E0B" : "#8B5CF6"} // Dourado se Max, senão Roxo
              showMax={true}
            />

            {/* Barra para o Próximo Badge */}
            {perfil.proximo_badge ? (
              <StatBar 
                label={`Próxima Conquista: ${perfil.proximo_badge.nome}`} 
                value={perfil.pontos_totais} 
                max={perfil.proximo_badge.pontos} 
                color="#10B981" // Verde Esmeralda
                showMax={true}
              />
            ) : (
               <StatBar 
                label="Todas as conquistas desbloqueadas!" 
                value={100} 
                max={100} 
                color="#F59E0B" 
                showMax={false}
              />
            )}

            <StatBar 
              label="Partidas Jogadas" 
              value={perfil.historico ? perfil.historico.length : 0} 
              max={50} 
              color="#3B82F6" // Azul
            />

            <StatBar 
              label="Medalhas Conquistadas" 
              value={perfil.badges.length} 
              max={10} 
              color="#EC4899" // Rosa
            />

            <button 
              onClick={() => setShowBadges(true)}
              style={{
              width: "100%",
              marginTop: "15px",
              padding: "12px",
              background: "linear-gradient(90deg, #F59E0B 0%, #F97316 100%)", // Botão gradiente Laranja (igual o "BELI" da imagem)
              color: "white",
              border: "none",
              borderRadius: "15px",
              fontWeight: "800",
              fontSize: "0.9rem",
              boxShadow: "0 5px 15px rgba(249, 115, 22, 0.3)",
              cursor: "pointer"
            }}>
              VER CONQUISTAS
            </button>
          </div>

          {/* Lista de Histórico (Estilo a lista de baixo da imagem) */}
          <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem", color: "#1F2937", fontWeight: "800" }}>Histórico Recente</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", paddingBottom: "20px" }}>
            {perfil.historico && perfil.historico.length > 0 ? (
                perfil.historico.slice(0, 3).map((partida, index) => (
                  <div key={index} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    padding: "10px", 
                    borderRadius: "18px",
                    backgroundColor: "#fff",
                    border: "1px solid #F3F4F6",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
                  }}>
                    {/* Ícone do Jogo (Quadrado arredondado) */}
                    <div style={{ 
                      width: "50px", height: "50px", borderRadius: "12px", 
                      backgroundColor: "#ECFDF5", color: "#10B981",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.5rem", marginRight: "15px"
                    }}>
                      🦠
                    </div>
                    
                    {/* Texto */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "700", color: "#374151", fontSize: "0.95rem" }}>Jogo dos Germes</div>
                      <div style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>{partida.data}</div>
                    </div>

                    {/* Pontuação */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "800", color: "#8B5CF6" }}>+{partida.pontos}</div>
                      <div style={{ fontSize: "0.7rem", color: "#D1D5DB", fontWeight: "600" }}>PTS</div>
                    </div>
                  </div>
                ))
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "#9CA3AF", fontSize: "0.9rem" }}>
                Nenhuma partida recente.
              </div>
            )}
          </div>

            {/* Opções de Conta */}
            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button 
                onClick={() => { setEditType("email"); setShowEdit(true); }}
                style={{ flex: 1, padding: "10px", backgroundColor: "#F3F4F6", border: "none", borderRadius: "10px", color: "#4B5563", fontWeight: "bold", cursor: "pointer" }}
              >
                Alterar E-mail
              </button>
              <button 
                onClick={() => { setEditType("senha"); setShowEdit(true); }}
                style={{ flex: 1, padding: "10px", backgroundColor: "#F3F4F6", border: "none", borderRadius: "10px", color: "#4B5563", fontWeight: "bold", cursor: "pointer" }}
              >
                Redefinir Senha
              </button>
            </div>

            <button 
              onClick={logout}
              style={{ width: "100%", marginTop: "15px", padding: "12px", backgroundColor: "#EF4444", color: "white", border: "none", borderRadius: "15px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)" }}
            >
              SAIR DA CONTA
            </button>

        </div>
      </div>

      {/* Modal de Conquistas */}
      {showBadges && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 1000,
          backdropFilter: "blur(5px)"
        }} onClick={() => setShowBadges(false)}>
          <div style={{
            backgroundColor: "white", padding: "25px", borderRadius: "25px",
            maxWidth: "320px", width: "90%", textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            animation: "slideUpFade 0.3s ease-out"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#1F2937", marginTop: 0, fontSize: "1.5rem" }}>🏅 Suas Conquistas</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", margin: "20px 0" }}>
              {perfil.badges.length > 0 ? perfil.badges.map((badge, i) => (
                <div key={i} style={{ backgroundColor: "#FEF3C7", color: "#D97706", padding: "8px 12px", borderRadius: "15px", fontWeight: "bold", fontSize: "0.9rem", border: "2px solid #FCD34D" }}>
                  {badge}
                </div>
              )) : <p style={{ color: "#6B7280" }}>Jogue mais para desbloquear conquistas!</p>}
            </div>
            <button onClick={() => setShowBadges(false)} style={{ padding: "10px 25px", backgroundColor: "#EF4444", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}>Fechar</button>
          </div>
        </div>
      )}

      {/* Modal de Edição (Email/Senha) */}
      {showEdit && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 1000,
          backdropFilter: "blur(5px)"
        }} onClick={() => setShowEdit(false)}>
          <div style={{
            backgroundColor: "white", padding: "25px", borderRadius: "25px",
            maxWidth: "320px", width: "90%", textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            animation: "slideUpFade 0.3s ease-out"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#1F2937", marginTop: 0, fontSize: "1.3rem" }}>
              {editType === "email" ? "Novo E-mail" : "Nova Senha"}
            </h3>
            <form onSubmit={handleUpdate}>
              <input 
                name="valor" 
                type={editType === "senha" ? "password" : "email"} 
                placeholder={editType === "email" ? "Digite o novo e-mail" : "Digite a nova senha"}
                required
                style={{ width: "100%", padding: "12px", margin: "15px 0", borderRadius: "10px", border: "2px solid #E5E7EB", fontSize: "1rem", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowEdit(false)} style={{ flex: 1, padding: "10px", backgroundColor: "#E5E7EB", color: "#374151", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: "10px", backgroundColor: "#10B981", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}