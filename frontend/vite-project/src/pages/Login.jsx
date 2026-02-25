import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const toothRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);  // Para controlar a tela de carregamento

  // Piscar junto
  const [isBlinking, setIsBlinking] = useState(false);

  async function handleLogin() {
    setErro("");

    if (!username || !password) {
      setErro("Preencha nome e senha 😊");
      return;
    }

    setLoading(true);  // Mostrar a tela de carregamento enquanto processa

    try {
      await login(username, password);
      
      // Aguarda alguns segundos antes de ir para a página de Home
      setTimeout(() => {
        navigate("/carregamento");  // Direciona para a página de carregamento
        setTimeout(() => {
          navigate("/home");  // Depois de um tempo, vai para a página home
        }, 3000);  // 3 segundos no carregamento (ajuste conforme necessário)
      }, 1000); // Aqui você pode ajustar o tempo de espera para ir para o carregamento

    } catch {
      setErro("Nome ou senha inválidos 💙");
      setLoading(false);  // Esconde o carregamento se der erro
    }
  }

  // ===== Pupila seguindo o mouse =====
  useEffect(() => {
    const tooth = toothRef.current;
    if (!tooth) return;

    const max = 10;

    const onMove = (e) => {
      const rect = tooth.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + 180;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = (dx / dist) * Math.min(max, dist / 20);
      const ny = (dy / dist) * Math.min(max, dist / 20);

      tooth.style.setProperty("--px", `${nx.toFixed(2)}px`);
      tooth.style.setProperty("--py", `${ny.toFixed(2)}px`);
    };

    const onLeave = () => {
      tooth.style.setProperty("--px", "0px");
      tooth.style.setProperty("--py", "0px");
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // ===== Piscar os dois olhos juntos =====
  useEffect(() => {
    let timerId;

    const schedule = () => {
      const ms = 2500 + Math.random() * 2200; // 2.5s a 4.7s
      timerId = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 130);
        schedule();
      }, ms);
    };

    schedule();

    return () => clearTimeout(timerId);
  }, []);

  return (
    <div className="login-page">
      <style>{css}</style>

      <div className="wrap">
        <header className="headline">
          <h1>Bem-vindo(a) de volta,</h1>
          <p>Vamos continuar nossa jornada pelo Reino dos Dentes.</p>
        </header>

        <section
          ref={toothRef}
          className="monster tooth"
          aria-label="Área de login"
        >
          {/* bochechas */}
          <div className="cheeks" aria-hidden="true">
            <span className="cheek" />
            <span className="cheek" />
          </div>

          {/* olhos */}
          <div className={`eyes ${isBlinking ? "blink" : ""}`} aria-hidden="true">
            <span className="eye">
              <span className="pupil" />
            </span>
            <span className="eye">
              <span className="pupil" />
            </span>
          </div>

          {/* "barriga" com inputs */}
          <div className="belly">
            {erro && <div className="error">{erro}</div>}

            <div className="field">
              <input
                placeholder="Nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-label="Nome de usuário"
              />
            </div>

            <div className="field">
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Senha"
              />
            </div>

            <button className="go" onClick={handleLogin} aria-label="Entrar">
              entrar
            </button>

            <p className="signup">
              Não tem conta?{" "}
              <Link to="/register" className="signup-link">
                Crie aqui
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const css = `
:root{
  --blue: #4facfe;
  --green: #00f2fe;
  --amber: #E9B463;
  --red: #E15148;
  --ink: #0f172a;
  --muted: rgba(255,255,255,0.85);
}

.login-page{
  min-height: 100vh;
  width: 100vw;
  background: #4facfe; 
  display:flex;
  justify-content:center;
  padding: 42px 18px 60px;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  font-family:  "Fredoka", "Quicksand", "Nunito", system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
}

.wrap{
  width: 100%;
  max-width: 860px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap: 22px;
}

.headline{
  text-align:center;
  color: white;
}

.headline h1{
  margin:0;
  font-family: "Baloo 2", system-ui, -apple-system, "Segoe UI", Arial, sans-serif !important;
  font-size: clamp(44px, 6vw, 86px);
  font-weight: 700; /* Baloo fica lindo com 700/800 */
  letter-spacing: 0.5px;
  line-height: 0.95;
}

.headline p{
  margin: 10px 0 0;
  font-size: clamp(19px, 2.5vw, 22px);
  font-weight: 300;
  opacity: 0.95;
}

/* ===== PERSONAGEM: DENTE ===== */
.monster.tooth{
  width: 100%;
  max-width: 720px;
  min-height: 550px;

  background: linear-gradient(180deg, #ffffff 0%, #f4fbff 60%, #ffffff 100%);
  border-radius: 190px 190px 400px 400px;

  position: relative;
  overflow: visible; 
  box-shadow: 0 24px 60px rgba(0,0,0,0.18);
  outline: 10px solid rgba(255,255,255,0.12);

  --px: 0px;
  --py: 0px;
}

/* raízes do dente */
.monster.tooth::before,
.monster.tooth::after{
  content:"";
  position:absolute;
  bottom: -80px;
  width: 205px;
  height: 165px;

  background: linear-gradient(180deg, #ffffff 0%, #f4fbff 100%);
  border-radius: 999px;
  box-shadow: 0 18px 35px rgba(0,0,0,0.10);
  z-index: 0;
}

.monster.tooth::before{
  left: 160px;
  max-width: 250px;
  min-height: 170px;
  transform: rotate(12deg);
}

.monster.tooth::after{
  right: 170px;
  max-width: 250px;
  min-height: 170px;
  transform: rotate(-12deg);
}

/* bochechas */
.cheeks{
  position:absolute;
  top: 190px;
  left: 0;
  right: 0;
  display:flex;
  justify-content: space-between;
  padding: 0 160px;
  z-index: 2;
  pointer-events:none;
}
.cheek{
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: rgba(225,81,72,0.28);
}

/* olhos */
.eyes{
  position:absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display:flex;
  gap: 26px;
  z-index: 2;
}

.eye{
  width: 150px;
  height: 150px;
  border-radius: 999px;
  background: white;
  display:grid;
  place-items:center;
  box-shadow: 0 10px 20px rgba(0,0,0,0.12);

  transform-origin: center;
  transition: transform 80ms ease;
}

/* piscar junto */
.eyes.blink .eye{
  transform: scaleY(0.12);
}

.pupil{
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: #111827;

  transform: translate(var(--px), var(--py));
  transition: transform 60ms linear;
}

/* barriga com formulário */
.belly{
  position:absolute;
  left: 50%;
  top: 235px;
  transform: translateX(-50%);
  width: min(520px, 86%);
  background: rgba(255,255,255,0.9);
  border-radius: 16px;
  padding: 18px 16px 16px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.14);
  z-index: 3;
}

.error{
  background: rgba(225,81,72,0.14);
  color: var(--red);
  border: 1px solid rgba(225,81,72,0.22);
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 800;
  text-align:center;
  margin-bottom: 12px;
}

.field{
  background: white;
  border: 2px solid rgba(15,23,42,0.12);
  border-radius: 12px;
  overflow:hidden;
  margin-bottom: 12px;
}

.field input{
  width:100%;
  border:0;
  outline:0;
  padding: 12px 14px;
  font-size: 15px;
  background: transparent;
  color: var(--ink);
}

.field input::placeholder{
  color: rgba(15,23,42,0.35);
}

.field input:focus{
  box-shadow: inset 0 0 0 2px rgba(44,118,163,0.25);
}

/* botão */
.go{
  width: 120px;
  margin: 8px auto 0;
  display:block;
  border: 0;
  border-radius: 12px;
  padding: 12px 14px;

  background: var(--blue);     /* <- normal: azul */
  color: white;

  font-weight: 900;
  text-transform: lowercase;
  cursor: pointer;

  box-shadow: 0 14px 26px rgba(44,118,163,0.28);
  transition: background 180ms ease, transform 120ms ease, box-shadow 180ms ease;
}

.go:hover{
  background: var(--red);      /* <- hover: vermelho */
  box-shadow: 0 14px 26px rgba(225,81,72,0.28);
}

.go:active{
  transform: translateY(1px);
}
.go:active{ transform: translateY(1px); }

.signup{
  margin: 10px 0 0;
  text-align:center;
  font-weight: 700;
  color: rgba(15,23,42,0.65);
  font-size: 14px;
}
.signup-link{
  color: var(--blue);
  font-weight: 900;
  text-decoration: none;
}
.signup-link:hover{
  text-decoration: underline;
}

/* responsivo */
@media (max-width: 560px){
  .monster.tooth{
    min-height: 500px;
    border-radius: 220px 220px 80px 80px;
  }

  .monster.tooth::before{
    left: 70px;
    width: 170px;
    height: 140px;
  }
  .monster.tooth::after{
    right: 70px;
    width: 170px;
    height: 140px;
  }

  .eye{ width: 72px; height: 72px; }
  .pupil{ width: 14px; height: 14px; }

  .eyes{ top: 155px; }
  .belly{ top: 230px; }

  .cheeks{ padding: 0 90px; top: 220px; }
}
`;