import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  async function handleLogin() {
    setErro("");

    if (!username || !password) {
      setErro("Preencha nome e senha 😊");
      return;
    }

    try {
      await login(username, password);
      navigate("/home");
    } catch {
      setErro("Nome ou senha inválidos 💙");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F3F4F6",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "'Nunito', sans-serif"
    }}>
      
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background-color: #fff;
          border-radius: 35px;
          box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);
          overflow: hidden;
          animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @media (min-width: 768px) {
          .auth-card {
            max-width: 900px;
            width: 90%;
          }
        }
      `}</style>

      <div className="auth-card">

        {/* HEADER */}
        <div style={{
          background: "linear-gradient(135deg, #4facfe, #00f2fe)",
          padding: "30px 25px 50px 25px",
          color: "white",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontWeight: "800" }}>
            Bem-vindo de volta 🦷
          </h2>
        </div>

        {/* CONTEÚDO */}
        <div style={{
          backgroundColor: "#fff",
          marginTop: "-25px",
          borderRadius: "30px 30px 0 0",
          padding: "25px"
        }}>

          {erro && (
            <div style={{
              background: "#FEE2E2",
              color: "#991B1B",
              padding: "10px",
              borderRadius: "12px",
              marginBottom: "15px",
              textAlign: "center",
              fontWeight: "600"
            }}>
              {erro}
            </div>
          )}

          <input
            placeholder="Nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, marginTop: "12px" }}
          />

          <button onClick={handleLogin} style={buttonStyle}>
            Entrar
          </button>

          <p style={{ textAlign: "center", marginTop: "15px" }}>
            Não tem conta?{" "}
            <Link to="/register" style={linkStyle}>
              Crie aqui
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "2px solid #E5E7EB",
  fontSize: "0.95rem",
  boxSizing: "border-box"
};

const buttonStyle = {
  width: "100%",
  marginTop: "15px",
  padding: "12px",
  background: "linear-gradient(90deg, #8B5CF6, #6366F1)",
  color: "white",
  border: "none",
  borderRadius: "15px",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 5px 15px rgba(139, 92, 246, 0.3)"
};

const linkStyle = {
  color: "#8B5CF6",
  fontWeight: "700",
  textDecoration: "none"
};