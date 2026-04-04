import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

function SenhaInput({ label, value, onChange, placeholder }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      <div className="senha-wrap">
        <input
          type={visivel ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        <button type="button" className="btn-olho" onClick={() => setVisivel(v => !v)} tabIndex={-1}>
          {visivel ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  const { user, logout } = useAuth();

  const [dadosForm, setDadosForm] = useState({ nome: user?.nome || '', email: user?.email || '' });
  const [senhaForm, setSenhaForm] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' });
  const [loadingDados, setLoadingDados]   = useState(false);
  const [loadingSenha, setLoadingSenha]   = useState(false);
  const [loadingDeletar, setLoadingDeletar] = useState(false);
  const [msgDados, setMsgDados] = useState(null);
  const [msgSenha, setMsgSenha] = useState(null);
  const [confirmarDeletar, setConfirmarDeletar] = useState(false);

  const flash = (setter, texto, tipo = 'ok') => {
    setter({ texto, tipo });
    setTimeout(() => setter(null), 3500);
  };

  const salvarDados = async () => {
    if (!dadosForm.nome.trim() || !dadosForm.email.trim()) {
      flash(setMsgDados, 'Preencha nome e email.', 'err'); return;
    }
    setLoadingDados(true);
    try {
      await api.atualizarUsuario(dadosForm);
      flash(setMsgDados, 'Dados atualizados com sucesso!');
    } catch (e) {
      flash(setMsgDados, e.message, 'err');
    } finally { setLoadingDados(false); }
  };

  const salvarSenha = async () => {
    if (!senhaForm.senhaAtual || !senhaForm.novaSenha) {
      flash(setMsgSenha, 'Preencha todos os campos.', 'err'); return;
    }
    if (senhaForm.novaSenha.length < 6) {
      flash(setMsgSenha, 'Nova senha deve ter ao menos 6 caracteres.', 'err'); return;
    }
    if (senhaForm.novaSenha !== senhaForm.confirmar) {
      flash(setMsgSenha, 'As senhas não coincidem.', 'err'); return;
    }
    setLoadingSenha(true);
    try {
      await api.atualizarSenha({ senhaAtual: senhaForm.senhaAtual, novaSenha: senhaForm.novaSenha });
      flash(setMsgSenha, 'Senha atualizada com sucesso!');
      setSenhaForm({ senhaAtual: '', novaSenha: '', confirmar: '' });
    } catch (e) {
      flash(setMsgSenha, e.message, 'err');
    } finally { setLoadingSenha(false); }
  };

  const deletarConta = async () => {
    setLoadingDeletar(true);
    try {
      await api.deletarUsuario(user.id);
      logout();
    } catch (e) {
      flash(setMsgDados, e.message, 'err');
      setLoadingDeletar(false);
      setConfirmarDeletar(false);
    }
  };

  return (
    <div className="page-content">
      <h2 className="perfil-titulo">Meu Perfil</h2>

      <div className="perfil-card">
        <h3>Dados pessoais</h3>
        <div className="field">
          <label>Nome</label>
          <input value={dadosForm.nome} onChange={e => setDadosForm(f => ({ ...f, nome: e.target.value }))} placeholder="Seu nome" />
        </div>
        <div className="field">
          <label>E-mail</label>
          <input type="email" value={dadosForm.email} onChange={e => setDadosForm(f => ({ ...f, email: e.target.value }))} placeholder="seu@email.com" />
        </div>
        {msgDados && <div className={msgDados.tipo === 'err' ? 'auth-error' : 'auth-success'}>{msgDados.texto}</div>}
        <button className="btn-primary sm" onClick={salvarDados} disabled={loadingDados}>
          {loadingDados ? <span className="spinner" /> : 'Salvar alterações'}
        </button>
      </div>

      <div className="perfil-card">
        <h3>Alterar senha</h3>
        <SenhaInput label="Senha atual" value={senhaForm.senhaAtual} onChange={e => setSenhaForm(f => ({ ...f, senhaAtual: e.target.value }))} placeholder="••••••" />
        <SenhaInput label="Nova senha" value={senhaForm.novaSenha} onChange={e => setSenhaForm(f => ({ ...f, novaSenha: e.target.value }))} placeholder="Mínimo 6 caracteres" />
        <SenhaInput label="Confirmar nova senha" value={senhaForm.confirmar} onChange={e => setSenhaForm(f => ({ ...f, confirmar: e.target.value }))} placeholder="••••••" />
        {msgSenha && <div className={msgSenha.tipo === 'err' ? 'auth-error' : 'auth-success'}>{msgSenha.texto}</div>}
        <button className="btn-primary sm" onClick={salvarSenha} disabled={loadingSenha}>
          {loadingSenha ? <span className="spinner" /> : 'Atualizar senha'}
        </button>
      </div>

      <div className="perfil-card danger-zone">
        <h3>Zona de perigo</h3>
        <p>Ao deletar sua conta todos os seus dados serão removidos permanentemente.</p>
        {!confirmarDeletar ? (
          <button className="btn-danger" onClick={() => setConfirmarDeletar(true)}>🗑️ Deletar minha conta</button>
        ) : (
          <div className="confirmar-deletar">
            <p className="confirmar-aviso">Tem certeza? Esta ação não pode ser desfeita.</p>
            <div className="confirmar-acoes">
              <button className="btn-danger" onClick={deletarConta} disabled={loadingDeletar}>
                {loadingDeletar ? <span className="spinner" /> : 'Sim, deletar'}
              </button>
              <button className="btn-secondary" onClick={() => setConfirmarDeletar(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
