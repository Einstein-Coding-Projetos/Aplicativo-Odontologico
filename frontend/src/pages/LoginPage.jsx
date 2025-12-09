import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * LoginPage.jsx — Nome + CPF (com modo convidado)
 * - Identifica por CPF (salva apenas HASH) e Nome
 * - Se existe: atualiza lastLogin/entries e entra em /home
 * - Se não existe: pede confirmação para criar e entra
 * - Modo Convidado: sessão temporária sem CPF
 * - Acessibilidade: labels, aria-live, foco correto
 */

// ===== CONFIG BÁSICA =====
const SALT = "odontoplay_v1_salt"; // TODO: mover para env
const STORAGE_KEYS = {
  players: "odonto_players",
  session: "odonto_session",
};

// ===== HELPERS: CPF =====
const onlyDigits = (s) => (s || "").replace(/\D+/g, "");

const maskCPF = (digits11) => {
  const d = onlyDigits(digits11).padEnd(11, " ");
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`.replace(/\s/g, "");
};

const maskCPFForDisplay = (digits11) => {
  const d = onlyDigits(digits11);
  if (d.length !== 11) return "***.***.***-**";
  return `***.***.***-${d.slice(9, 11)}`;
};

const isRepeatedSequence = (d) => /^(\d)\1{10}$/.test(d);

// Validação de CPF
const isValidCPF = (cpfDigits) => {
  const d = onlyDigits(cpfDigits);
  if (d.length !== 11) return false;
  if (isRepeatedSequence(d)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  let dv1 = (sum * 10) % 11;
  if (dv1 === 10) dv1 = 0;
  if (dv1 !== Number(d[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i);
  let dv2 = (sum * 10) % 11;
  if (dv2 === 10) dv2 = 0;
  return dv2 === Number(d[10]);
};

// ===== HELPERS: Nome =====
const normalizeName = (name) => {
  if (!name) return "";
  const trimmed = name.trim().replace(/\s+/g, " ");
  return trimmed
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
};

// ===== HELPERS: Hash (Web Crypto) =====
async function hashCPF(cpfDigits) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${SALT}:${onlyDigits(cpfDigits)}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ===== HELPERS: Storage =====
const loadPlayers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.players);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const savePlayers = (players) => {
  localStorage.setItem(STORAGE_KEYS.players, JSON.stringify(players));
};

const setSession = (session) => {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
};

const getSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ===== COMPONENTE =====
export default function LoginPage() {
  const navigate = useNavigate?.() ?? ((path) => console.log("NAVIGATE:", path));

  const [tab, setTab] = useState("login"); // "login" | "sobre"

  const [name, setName] = useState("");
  const [cpfRaw, setCpfRaw] = useState("");
  const cpfDigits = useMemo(() => onlyDigits(cpfRaw), [cpfRaw]);

  const [errors, setErrors] = useState({ name: "", cpf: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingHash, setPendingHash] = useState("");

  // Se já houver sessão, mandar para /home
  useEffect(() => {
    const s = getSession();
    if (s?.userId) {
      try {
        navigate("/home");
      } catch {}
    }
  }, [navigate]);

  // Validações
  const validateName = (n) => {
    const nn = normalizeName(n);
    if (nn.length < 2 || nn.length > 60) return "Digite nome e sobrenome (ex.: Maria Silva)";
    const parts = nn.split(" ").filter(Boolean);
    if (parts.length < 2 || parts.some((p) => p.length < 2)) return "Digite nome e sobrenome (ex.: Maria Silva)";
    if (/\d/.test(nn)) return "O nome não pode ter números!";
    return "";
  };

  const validateCPFField = (d) => {
    if (d.length === 0) return "";
    if (d.length < 11) return "CPF incompleto";
    if (!isValidCPF(d)) return "Confira o CPF! Parece que um dígito está errado.";
    return "";
  };

  // Handlers
  const onChangeName = (e) => {
    const raw = (e.target.value || "").replace(/\d+/g, "");
    setName(raw);
    setErrors((old) => ({ ...old, name: raw ? validateName(raw) : "" }));
  };
  const onBlurName = () => setName((n) => normalizeName(n));

  const onChangeCPF = (e) => {
    const digits = onlyDigits(e.target.value).slice(0, 11);
    setCpfRaw(maskCPF(digits));
    setErrors((old) => ({ ...old, cpf: validateCPFField(digits) }));
  };

  const canSubmit = useMemo(() => {
    return normalizeName(name).length >= 2 && cpfDigits.length === 11 && isValidCPF(cpfDigits) && !isSubmitting;
  }, [name, cpfDigits, isSubmitting]);

  const proceedToApp = (userId, { guest = false, firstTime = false, name = "" } = {}) => {
    const niceName = normalizeName(name);
    const welcome = firstTime ? `Bem-vindo(a), ${niceName}, ao Jogo Odontológico!` : `Bem-vindo(a) de volta, ${niceName}!`;
    setSession({ userId, guest, at: new Date().toISOString(), welcome });
    try {
      navigate("/home");
    } catch {}
  };

  const createOrUpdatePlayer = (players, hash, displayCPF, userName) => {
    const now = new Date().toISOString();
    if (!players[hash]) {
      players[hash] = {
        cpfMasked: maskCPFForDisplay(displayCPF),
        name: normalizeName(userName),
        createdAt: now,
        lastLogin: now,
        entries: 1,
        points: 0,
        badges: [],
      };
    } else {
      players[hash].lastLogin = now;
      players[hash].entries = (players[hash].entries || 0) + 1;
    }
    savePlayers(players);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const nameErr = validateName(name);
    const cpfErr = validateCPFField(cpfDigits);
    setErrors({ name: nameErr, cpf: cpfErr });
    if (nameErr || cpfErr) return;

    setIsSubmitting(true);
    try {
      const hash = await hashCPF(cpfDigits);
      const players = loadPlayers();
      if (players[hash]) {
        createOrUpdatePlayer(players, hash, cpfDigits, name);
        proceedToApp(hash, { guest: false, firstTime: false, name });
      } else {
        setPendingHash(hash);
        setShowCreateModal(true);
      }
    } catch (err) {
      console.error(err);
      setErrors((old) => ({ ...old, cpf: "Algo deu errado na validação. Tente novamente." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmCreate = () => {
    const players = loadPlayers();
    createOrUpdatePlayer(players, pendingHash, cpfDigits, name);
    proceedToApp(pendingHash, { guest: false, firstTime: true, name });
  };

  const cancelCreate = () => {
    setShowCreateModal(false);
    setPendingHash("");
  };

  const handleGuest = () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    proceedToApp(guestId, { guest: true, firstTime: true, name: "Convidado(a)" });
  };

  // ===== RENDER =====
  return (
    <div style={styles.page}>
      <div className="login-card" style={styles.card}>
        {/* Topo ondulado */}
        <div className="wave-header" aria-hidden>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,80 C240,140 480,20 720,60 C960,100 1200,80 1440,40 L1440,120 L0,120 Z" fill="#fff" />
          </svg>
        </div>

        {/* Abas */}
        <div className="tabbar" role="tablist" aria-label="Aba do login">
          <button className="tabbtn" role="tab" aria-selected={tab === "sobre"} onClick={() => setTab("sobre")}>
            Sobre
          </button>
           <button className="tabbtn" role="tab" aria-selected={tab === "login"} onClick={() => setTab("login")}>
            Entrar
          </button>
        </div>

        {/* Conteúdo da aba */}
        <div className="tabpanel" role="tabpanel">
          {tab === "login" ? (
            <form onSubmit={handleSubmit} noValidate>
              <h2 style={styles.title}>Vamos jogar?</h2>
              <p style={styles.subtitle}>Entre com seu nome e CPF para guardar seus pontos.</p>

              {/* Nome */}
              <label htmlFor="name" style={styles.label}>
                Seu nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                inputMode="text"
                placeholder="Nome e sobrenome"
                value={name}
                onChange={onChangeName}
                onBlur={onBlurName}
                onBeforeInput={(e) => {
                  if (/\d/.test(e.data || "")) e.preventDefault();
                }}
                style={{ ...styles.input, borderColor: errors.name ? COLORS.quiz04 : COLORS.inputBorder }}
                aria-invalid={Boolean(errors.name)}
                aria-describedby="name-error"
                autoComplete="off"
              />
              <div id="name-error" role="status" aria-live="polite" style={styles.error}>
                {errors.name}
              </div>

              {/* CPF */}
              <label htmlFor="cpf" style={styles.label}>
                CPF
              </label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                inputMode="numeric"
                placeholder="123.456.789-10"
                value={cpfRaw}
                onChange={onChangeCPF}
                style={{ ...styles.input, borderColor: errors.cpf ? COLORS.quiz04 : COLORS.inputBorder }}
                aria-invalid={Boolean(errors.cpf)}
                aria-describedby="cpf-error cpf-hint"
                autoComplete="off"
              />
              <div id="cpf-hint" style={styles.hint}>
                Usamos apenas para identificar seus pontos.
              </div>
              <div id="cpf-error" role="status" aria-live="polite" style={styles.error}>
                {errors.cpf}
              </div>

              {/* Ações */}
              <button
                type="submit"
                aria-label="Entrar no jogo"
                className="btn-primary"
                disabled={!canSubmit}
                style={{ ...styles.buttonPrimary, opacity: canSubmit ? 1 : 0.6 }}
              >
                {isSubmitting ? "Entrando…" : "Entrar"}
              </button>

              <button
                type="button"
                aria-label="Entrar como convidado"
                className="btn-secondary"
                onClick={handleGuest}
                style={styles.buttonSecondary}
              >
                Continuar como convidado
              </button>
            </form>
          ) : (
            <section>
              <h2 style={{ margin: "0 0 8px 0", fontSize: 18, color: COLORS.text }}>Bem-vindo(a)!</h2>
              <p style={{ color: COLORS.textMuted, lineHeight: 1.5, marginBottom: 12 }}>
                Este é o <strong>Jogo Odontológico</strong>. Você entra com <strong>Nome + CPF</strong> para salvar
                <strong> pontos e medalhas</strong>.
              </p>
              <ul style={{ margin: "0 0 12px 16px", color: COLORS.textMuted }}>
                <li>Aprenda saúde bucal jogando</li>
                <li>Ganhe badges e acompanhe seu progresso</li>
                <li>Se preferir, entre como <em>convidado</em></li>
              </ul>
              <p style={{ fontSize: 12, color: COLORS.textMuted }}>
                Dica: se já jogou antes, use o mesmo CPF para recuperar sua pontuação.
              </p>
            </section>
          )}
        </div>
      </div>

      {/* Modal de primeira vez */}
      {showCreateModal && (
        <div role="dialog" aria-modal="true" style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <h2 style={{ margin: 0, fontSize: 20, color: COLORS.text }}>É sua primeira vez por aqui?</h2>
            <p style={{ marginTop: 8, color: COLORS.textMuted }}>
              Vamos criar seu cadastro com este nome e CPF para guardar seus pontos.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button onClick={confirmCreate} className="btn-primary" style={styles.buttonPrimary}>
                Criar e entrar
              </button>
              <button onClick={cancelCreate} style={styles.buttonGhost}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== ESTILOS (inline mínimos) =====
const COLORS = {
  quiz01: "#5FA869", // verde
  quiz02: "#2C76A3", // azul
  quiz03: "#E9B463", // âmbar
  quiz04: "#E15148", // vermelho
  bg: "#f8faf9",
  card: "#ffffff",
  text: "#1d2230",
  textMuted: "#4b5563",
  inputBorder: "#d1d5db",
  shadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const styles = {
  page: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    background: COLORS.bg,
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 500,
    background: COLORS.card,
    borderRadius: 20,
    boxShadow: COLORS.shadow,
    padding: 0, // topo ondulado + tabpanel já cuidam dos espaçamentos
    overflow: "hidden",
  },
  title: { margin: 0, fontSize: 24, color: COLORS.text, fontWeight: 800 },
  subtitle: { margin: "6px 0 12px 0", color: COLORS.textMuted, fontSize: 14 },
  label: { display: "block", marginTop: 14, marginBottom: 6, color: COLORS.text, fontWeight: 700 },
  input: {
    width: "100%",
    height: 46,
    border: `1px solid ${COLORS.inputBorder}`,
    borderRadius: 12,
    padding: "0 12px",
    fontSize: 16,
    outline: "none",
    background: "#fff",
  },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  error: { minHeight: 18, fontSize: 12, color: COLORS.quiz04, marginTop: 6 },
  buttonPrimary: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: "none",
    marginTop: 16,
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    background: COLORS.quiz01,
    cursor: "pointer",
  },
  buttonSecondary: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: `1px solid ${COLORS.quiz02}`,
    marginTop: 10,
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.quiz02,
    background: "rgba(44,118,163,0.10)",
    cursor: "pointer",
  },
  buttonGhost: {
    height: 42,
    padding: "0 14px",
    borderRadius: 12,
    border: `1px solid ${COLORS.inputBorder}`,
    background: "white",
    color: COLORS.text,
    fontWeight: 700,
    cursor: "pointer",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    placeItems: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    background: "white",
    borderRadius: 16,
    boxShadow: COLORS.shadow,
    padding: 18,
  },
};