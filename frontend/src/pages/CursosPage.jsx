import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CursosPage({ onVerCurso }) {
  const [cursos, setCursos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [inscrevendo, setInscrevendo] = useState(null);
  const [msg, setMsg]             = useState('');
  const { user } = useAuth();

  const flash = (texto) => { setMsg(texto); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => {
    api.listarCursos()
      .then(data => {
        // GET /cursos retorna { mensagem, cursos: [...] }
        // Se não houver cursos, o backend retorna 404 — o catch trata isso
        const lista = Array.isArray(data) ? data : (data?.cursos || []);
        setCursos(lista);
      })
      .catch(e => {
        // 404 = nenhum curso cadastrado ainda (não é erro real)
        if (!e.message?.includes('404')) console.error(e);
        setCursos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const inscrever = async (id, e) => {
    e.stopPropagation();
    setInscrevendo(id);
    try {
      await api.inscreverCurso(id);
      flash('Inscrição realizada com sucesso! 🎉');
    } catch (err) {
      flash(err.message);
    } finally {
      setInscrevendo(null);
    }
  };

  const filtered = cursos.filter(c =>
    c.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    c.descricao?.toLowerCase().includes(search.toLowerCase()) ||
    c.categoria?.toLowerCase().includes(search.toLowerCase())
  );

  const palettes = ['#E8D5B7', '#B7D5E8', '#D5E8B7', '#E8B7D5', '#B7E8D5', '#D5B7E8'];
  const icons    = ['📘', '🔬', '🎨', '💻', '🎯', '🚀'];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2>Explorar Cursos</h2>
          <p>{cursos.length} curso{cursos.length !== 1 ? 's' : ''} disponível{cursos.length !== 1 ? 'is' : ''}</p>
        </div>
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título, categoria..."
          />
        </div>
      </div>

      {msg && <div className="toast">{msg}</div>}

      {loading ? (
        <div className="cursos-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" style={{ height: '220px' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span>📚</span>
          <p>{search ? 'Nenhum curso encontrado para essa busca' : 'Nenhum curso cadastrado ainda'}</p>
        </div>
      ) : (
        <div className="cursos-grid">
          {filtered.map((curso, i) => (
            <div
              key={curso.id}
              className="curso-card"
              onClick={() => onVerCurso(curso.id)}
              style={{ '--accent-card': palettes[i % palettes.length] }}
            >
              <div className="curso-card-top">
                <div className="curso-thumb">
                  <span className="curso-icon">{icons[i % icons.length]}</span>
                </div>
                <div className="curso-card-meta">
                  {curso.categoria && <span className="curso-categoria">{curso.categoria}</span>}
                  <span className="curso-preco">
                    {curso.preco > 0 ? `R$ ${Number(curso.preco).toFixed(2)}` : 'Gratuito'}
                  </span>
                </div>
              </div>
              <div className="curso-card-body">
                <h3>{curso.titulo}</h3>
                <p>{curso.descricao}</p>
              </div>
              <div className="curso-card-footer">
                <span className="instrutor-tag">Instrutor #{curso.instrutor_id}</span>
                {user?.tipo === 'aluno' && (
                  <button
                    className="btn-inscrever"
                    onClick={(e) => inscrever(curso.id, e)}
                    disabled={inscrevendo === curso.id}
                  >
                    {inscrevendo === curso.id ? '...' : 'Inscrever-se'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
