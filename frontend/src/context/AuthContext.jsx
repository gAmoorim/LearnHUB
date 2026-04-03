import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('learnhub_token');
    const saved = localStorage.getItem('learnhub_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    const data = await api.login({ email, senha });

    // Backend retorna: { token: "...", usuario: { id, nome, email, tipo, ... } }
    const token = data.token || data.access_token;
    if (!token) throw new Error('Token não recebido do servidor');

    localStorage.setItem('learnhub_token', token);

    // Pega dados do usuário direto de data.usuario (formato confirmado pelo backend)
    const u = data.usuario || data.user || data.data || {};
    const userData = {
      id:    u.id,
      nome:  u.nome,
      email: u.email || email,
      tipo:  u.tipo,
    };

    localStorage.setItem('learnhub_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const cadastrar = async (nome, email, senha, tipo) => {
    const data = await api.cadastrar({ nome, email, senha, tipo });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('learnhub_token');
    localStorage.removeItem('learnhub_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, cadastrar, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
