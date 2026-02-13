import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Menu Principal</h1>

      <ul>
        <li onClick={() => navigate("/jogo")}>
          🦷 Jogo dos Germes
        </li>

        <li onClick={() => navigate("/questionario")}>
          ❓ Questionário
        </li>

        <li onClick={() => navigate("/perfil")}>
          👤 Perfil
        </li>
      </ul>
    </div>
  );
}

export default Home;
