import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ onSuccess }) {
  const [mode, setMode] = useState('login');
  const [tipo, setTipo] = useState('aluno');
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login, cadastrar } = useAuth();

  const nomeRef  = useRef(null);
  const emailRef = useRef(null);
  const senhaRef = useRef(null);

  // Limpa erros de campo e senha ao trocar de aba
  useEffect(() => {
    setFieldErrors({});
    setError('');
    setForm(f => ({ ...f, senha: '' }));
  }, [mode]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    // Remove erro do campo ao digitar
    if (fieldErrors[name]) setFieldErrors(fe => ({ ...fe, [name]: false }));
  };

  const validate = () => {
    const erros = {};
    if (mode === 'cadastro' && !form.nome.trim()) erros.nome = true;
    if (!form.email.trim()) erros.email = true;
    if (!form.senha.trim()) erros.senha = true;

    setFieldErrors(erros);

    // Foca no primeiro campo com erro
    if (erros.nome)  { nomeRef.current?.focus();  return false; }
    if (erros.email) { emailRef.current?.focus(); return false; }
    if (erros.senha) { senhaRef.current?.focus(); return false; }

    return Object.keys(erros).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.senha);
        onSuccess();
      } else {
        await cadastrar(form.nome, form.email, form.senha, tipo);
        setMode('login');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  const inputClass = (field) => `auth-input${fieldErrors[field] ? ' input-error' : ''}`;

  return (
    <div className="auth-bg">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-icon">◈</span>
          <h1>Learn<em>HUB</em></h1>
        </div>
        <p className="auth-tagline">Aprenda. Ensine.<br />Evolua junto.</p>
        <div className="auth-dots">
          {[...Array(12)].map((_, i) => <span key={i} className="dot" style={{ '--d': i }} />)}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="tab-switcher">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Entrar</button>
            <button className={mode === 'cadastro' ? 'active' : ''} onClick={() => setMode('cadastro')}>Cadastrar</button>
          </div>

          {mode === 'cadastro' && (
            <div className="field">
              <label>Nome completo</label>
              <input
                ref={nomeRef}
                name="nome"
                value={form.nome}
                onChange={handle}
                onKeyDown={onKey}
                placeholder="Seu nome"
                className={inputClass('nome')}
              />
              {fieldErrors.nome && <span className="field-error-msg">Nome é obrigatório</span>}
            </div>
          )}

          <div className="field">
            <label>E-mail</label>
            <input
              ref={emailRef}
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              onKeyDown={onKey}
              placeholder="seu@email.com"
              className={inputClass('email')}
            />
            {fieldErrors.email && <span className="field-error-msg">E-mail é obrigatório</span>}
          </div>

          <div className="field">
            <label>Senha</label>
            <input
              ref={senhaRef}
              name="senha"
              type="password"
              value={form.senha}
              onChange={handle}
              onKeyDown={onKey}
              placeholder="••••••"
              className={inputClass('senha')}
            />
            {fieldErrors.senha && <span className="field-error-msg">Senha é obrigatória</span>}
          </div>

          {mode === 'cadastro' && (
            <div className="tipo-selector">
              <button className={tipo === 'aluno' ? 'active' : ''} onClick={() => setTipo('aluno')}>
                <span>🎓</span> Aluno
              </button>
              <button className={tipo === 'instrutor' ? 'active' : ''} onClick={() => setTipo('instrutor')}>
                <span>🏫</span> Instrutor
              </button>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button className="btn-primary" onClick={submit} disabled={loading}>
            {loading ? <span className="spinner" /> : mode === 'login' ? 'Entrar na plataforma' : 'Criar conta'}
          </button>
        </div>
      </div>
    </div>
  );
}
