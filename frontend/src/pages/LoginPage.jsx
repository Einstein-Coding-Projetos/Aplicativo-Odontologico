import React, { useEffect, useMemo, useState } from "react";
// Se o projeto usar react-router-dom, mantenha este import. Caso não, remova e trate navegação depois.
import { useNavigate } from "react-router-dom";

/**
 * LoginPage.jsx — Nome + CPF (com modo convidado) 
 * Objetivos:
 *  - Identificar jogador por CPF (sem armazenar o CPF puro) e Nome.
 *  - Se CPF existir: atualizar lastLogin e entries++ e entrar no app (/home).
 *  - Se não existir: pedir confirmação para criar cadastro mínimo e então entrar.
 *  - Modo Convidado: cria sessão temporária sem CPF.
 *  - Acessibilidade: labels visíveis, mensagens com aria-live, foco de teclado.
 *  - Segurança local: guardar apenas HASH do CPF (com SALT) + versão mascarada p/ display.
 */

// ===== CONFIG BÁSICA =====
const SALT = "odontoplay_v1_salt"; // TODO: mover para variável de ambiente no futuro
const STORAGE_KEYS = {
  players: "odonto_players",
  session: "odonto_session",
};

// ===== HELPERS: CPF =====
const onlyDigits = (s) => (s || "").replace(/\D+/g, "");

const maskCPF = (digits11) => {
  const d = onlyDigits(digits11).padEnd(11, " ");
  // 000.000.000-00
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`.replace(/\s/g, "");
};

const maskCPFForDisplay = (digits11) => {
  const d = onlyDigits(digits11);
  if (d.length !== 11) return "**.***.***-**";
  return `***.***.***-${d.slice(9, 11)}`;
};

const isRepeatedSequence = (d) => /^(\d)\1{10}$/.test(d);

// Algoritmo oficial de validação de CPF (sem dependências)
const isValidCPF = (cpfDigits) => {
  const d = onlyDigits(cpfDigits);
  if (d.length !== 11) return false;
  if (isRepeatedSequence(d)) return false;

  // dígito 1
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  let dv1 = (sum * 10) % 11;
  if (dv1 === 10) dv1 = 0;
  if (dv1 !== Number(d[9])) return false;

  // dígito 2
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
  // to hex
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

  const [name, setName] = useState("");
  const [cpfRaw, setCpfRaw] = useState(""); // pode conter máscara durante a digitação
  const cpfDigits = useMemo(() => onlyDigits(cpfRaw), [cpfRaw]);

  const [errors, setErrors] = useState({ name: "", cpf: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingHash, setPendingHash] = useState("");

  // Se já houver sessão, mandar para /home
  useEffect(() => {
    const s = getSession();
    if (s?.userId) {
      try { navigate("/home"); } catch {}
    }
  }, []);

  // Validações em tempo real (após interação)
  const validateName = (n) => {
    const nn = normalizeName(n);
    if (nn.length < 2 || nn.length > 40) return "Digite seu nome (min. 2 letras).";
    return "";
  };

  const validateCPFField = (d) => {
    if (d.length === 0) return ""; // não mostra erro enquanto está vazio
    if (d.length < 11) return "Faltam números no CPF.";
    if (!isValidCPF(d)) return "Confira o CPF — parece que um dígito está errado.";
    return "";
  };

  const onChangeName = (e) => {
    const value = e.target.value;
    setName(value);
    setErrors((old) => ({ ...old, name: value ? validateName(value) : "" }));
  };

  const onBlurName = () => setName((n) => normalizeName(n));

  const onChangeCPF = (e) => {
    // aceita apenas dígitos e aplica máscara para exibição
    const digits = onlyDigits(e.target.value).slice(0, 11);
    setCpfRaw(maskCPF(digits));
    setErrors((old) => ({ ...old, cpf: validateCPFField(digits) }));
  };

  const canSubmit = useMemo(() => {
    return (
      normalizeName(name).length >= 2 &&
      cpfDigits.length === 11 &&
      isValidCPF(cpfDigits) &&
      !isSubmitting
    );
  }, [name, cpfDigits, isSubmitting]);

  const proceedToApp = (userId, asGuest = false) => {
    setSession({ userId, guest: asGuest, at: new Date().toISOString() });
    try { navigate("/home"); } catch {}
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
      // mantém name salvo anteriormente; se quiser, pode atualizar para o novo digitado
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
        // Já existe: atualiza e entra
        createOrUpdatePlayer(players, hash, cpfDigits, name);
        proceedToApp(hash, false);
      } else {
        // Não existe: perguntar se cria
        setPendingHash(hash);
        setShowCreateModal(true);
      }
    } catch (err) {
      console.error(err);
      // erro genérico (ex.: Web Crypto indisponível)
      setErrors((old) => ({ ...old, cpf: "Não deu para validar agora. Tente novamente." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmCreate = () => {
    const players = loadPlayers();
    createOrUpdatePlayer(players, pendingHash, cpfDigits, name);
    proceedToApp(pendingHash, false);
  };

  const cancelCreate = () => {
    setShowCreateModal(false);
    setPendingHash("");
  };

  const handleGuest = () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    proceedToApp(guestId, true);
  };

  // ===== RENDER =====
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div aria-hidden style={styles.mascot}>🦷</div>
          <h1 style={styles.title}>Vamos jogar?</h1>
          <p style={styles.subtitle}>Entre com seu nome e CPF para guardar seus pontos.</p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          {/* Nome */}
          <label htmlFor="name" style={styles.label}>Seu nome</label>
          <input
            id="name"
            name="name"
            type="text"
            inputMode="text"
            placeholder="Como você é chamado(a)"
            value={name}
            onChange={onChangeName}
            onBlur={onBlurName}
            style={{ ...styles.input, borderColor: errors.name ? COLORS.error : COLORS.inputBorder }}
            aria-invalid={Boolean(errors.name)}
            aria-describedby="name-error"
            autoComplete="off"
          />
          <div id="name-error" role="status" aria-live="polite" style={styles.error}>
            {errors.name}
          </div>

          {/* CPF */}
          <label htmlFor="cpf" style={styles.label}>CPF</label>
          <input
            id="cpf"
            name="cpf"
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={cpfRaw}
            onChange={onChangeCPF}
            style={{ ...styles.input, borderColor: errors.cpf ? COLORS.error : COLORS.inputBorder }}
            aria-invalid={Boolean(errors.cpf)}
            aria-describedby="cpf-error cpf-hint"
            autoComplete="off"
          />
          <div id="cpf-hint" style={styles.hint}>Usamos apenas para identificar seus pontos.</div>
          <div id="cpf-error" role="status" aria-live="polite" style={styles.error}>
            {errors.cpf}
          </div>

          {/* Ações */}
          <button type="submit" disabled={!canSubmit} style={{ ...styles.buttonPrimary, opacity: canSubmit ? 1 : 0.6 }}>
            {isSubmitting ? "Entrando…" : "Entrar"}
          </button>

          <button type="button" onClick={handleGuest} style={styles.buttonSecondary}>
            Continuar como convidado
          </button>
        </form>
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
              <button onClick={confirmCreate} style={styles.buttonPrimary}>Criar e entrar</button>
              <button onClick={cancelCreate} style={styles.buttonGhost}>Voltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== ESTILOS (inline para não depender de setup adicional) =====
const COLORS = {
  primary: "#5FA869", // verde — ação principal
  secondary: "#2C76A3", // azul — links/realces
  warn: "#E9B463", // amarelo — avisos suaves
  error: "#E15148", // vermelho — erros
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
    maxWidth: 480,
    background: COLORS.card,
    borderRadius: 16,
    boxShadow: COLORS.shadow,
    padding: 24,
  },
  header: { textAlign: "center", marginBottom: 12 },
  mascot: { fontSize: 40, marginBottom: 8 },
  title: { margin: 0, fontSize: 24, color: COLORS.text },
  subtitle: { margin: 8, marginTop: 6, color: COLORS.textMuted, fontSize: 14 },
  label: { display: "block", marginTop: 14, marginBottom: 6, color: COLORS.text, fontWeight: 600 },
  input: {
    width: "100%",
    height: 44,
    border: `1px solid ${COLORS.inputBorder}`,
    borderRadius: 10,
    padding: "0 12px",
    fontSize: 16,
    outline: "none",
  },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  error: { minHeight: 18, fontSize: 12, color: COLORS.error, marginTop: 6 },
  buttonPrimary: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    border: "none",
    marginTop: 16,
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
    background: COLORS.primary,
    cursor: "pointer",
  },
  buttonSecondary: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    border: `1px solid ${COLORS.secondary}`,
    marginTop: 10,
    fontSize: 16,
    fontWeight: 600,
    color: COLORS.secondary,
    background: "transparent",
    cursor: "pointer",
  },
  buttonGhost: {
    height: 40,
    padding: "0 14px",
    borderRadius: 10,
    border: `1px solid ${COLORS.inputBorder}`,
    background: "white",
    color: COLORS.text,
    fontWeight: 600,
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
    borderRadius: 14,
    boxShadow: COLORS.shadow,
    padding: 18,
  },
};
