import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleLogin() {
    if (!username || !password) {
      alert("Preencha nome e senha");
      return;
    }

    try {
      await login(username, password);
      navigate("/home");
    } catch (error) {
      alert("Nome ou senha inválidos");
    }
  }

  return (
    <div>
      <h1>Entrar</h1>

      <input
        placeholder="Nome de usuário"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Entrar</button>

      <p style={{ marginTop: "16px" }}>
        Não tem uma conta ainda?{" "}
        <Link to="/register">Crie aqui!</Link>
      </p>
    </div>
  );
}
