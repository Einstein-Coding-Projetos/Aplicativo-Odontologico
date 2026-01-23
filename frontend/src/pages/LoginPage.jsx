import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const doLogin = async (isGuest = false) => {
    setLoading(true);
    try {
      const body = isGuest ? { guest: true } : { nome, cpf };
      
      // Conecta com o Backend
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('userCpf', data.cpf);
        navigate('/home');
      } else {
        alert(data.error || 'Erro no login');
      }
    } catch (error) {
      console.error(error);
      alert('Erro: O servidor backend (porta 3000) está ligado?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login HJE 🦷</h1>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Nome:</label>
          <input 
            style={styles.input}
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            placeholder="Seu nome"
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>CPF (somente números):</label>
          <input 
            style={styles.input}
            value={cpf} 
            onChange={e => setCpf(e.target.value)} 
            placeholder="000.000.000-00"
          />
        </div>
        
        <button 
          style={styles.button} 
          onClick={() => doLogin(false)}
          disabled={loading || !nome || !cpf}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <button 
          style={{...styles.button, background: '#6b7280', marginTop: 10}} 
          onClick={() => doLogin(true)}
        >
          Entrar como Convidado
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0fdf4", padding: 16 },
  card: { width: "100%", maxWidth: 400, background: "#ffffff", borderRadius: 20, padding: 32, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "center" },
  title: { color: "#166534", marginBottom: 24 },
  inputGroup: { marginBottom: 16, textAlign: 'left' },
  label: { display: 'block', marginBottom: 8, color: '#374151', fontWeight: 'bold' },
  input: { width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16, boxSizing: 'border-box' },
  button: { width: "100%", padding: 12, borderRadius: 12, border: "none", fontSize: 16, fontWeight: "bold", cursor: "pointer", background: "#22c55e", color: "#fff" },
};

export default LoginPage;