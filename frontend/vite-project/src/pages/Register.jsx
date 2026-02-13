import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleRegister() {
    if (!username || !email || !password) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      await register(username, email, password);
      alert("Conta criada!");
      navigate("/");
    } catch (error) {
      alert("Erro ao criar conta");
    }
  }

  return (
    <div>
      <h1>Criar Conta</h1>

      <input
        placeholder="Nome"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Cadastrar</button>
    </div>
  );
}
