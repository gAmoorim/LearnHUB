import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CursosPage({ onVerCurso }) {
  const [cursos, setCursos]           = useState([]);
  const [inscritos, setInscritos]     = useState(new Set()); // Set de curso_id já inscritos
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [inscrevendo, setInscrevendo] = useState(null);
  const [msg, setMsg]                 = useState('');
  const { user } = useAuth();

  const flash = (texto) => { setMsg(texto); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => {
    const carregar = async () => {
      // Carrega cursos
      const dataCursos = await api.listarCursos().catch(() => ({}));
      const lista = Array.isArray(dataCursos) ? dataCursos : (dataCursos?.cursos || []);
      setCursos(lista);

      // Se for aluno, carrega inscrições para marcar os cursos já inscritos
      if (user?.tipo === 'aluno') {
        try {
          const dataInscritos = await api.meusCursos();
          const listaInscritos = Array.isArray(dataInscritos)
            ? dataInscritos
            : (dataInscritos?.cursos || []);
          setInscritos(new Set(listaInscritos.map(c => String(c.curso_id))));
        } catch {
          // 404 = sem inscrições ainda
          setInscritos(new Set());
        }
      }

      setLoading(false);
    };
    carregar();
  }, []);

  const inscrever = async (id, e) => {
    e.stopPropagation();
    setInscrevendo(id);
    try {
      await api.inscreverCurso(id);
      setInscritos(prev => new Set([...prev, String(id)]));
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

  // Agrupa por categoria
  const porCategoria = filtered.reduce((acc, curso) => {
    const cat = curso.categoria || 'Sem categoria';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curso);
    return acc;
  }, {});
  const categorias = Object.keys(porCategoria).sort();

  const icons = ['📘', '🔬', '🎨', '💻', '🎯', '🚀', '📊', '🎵', '🌍', '⚙️'];
  let cardIdx = 0;

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
        <div className="categorias-wrap">
          {categorias.map(cat => (
            <div key={cat} className="categoria-secao">
              <div className="categoria-header">
                <h3 className="categoria-nome">{cat}</h3>
                <span className="categoria-count">
                  {porCategoria[cat].length} curso{porCategoria[cat].length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="cursos-grid">
                {porCategoria[cat].map((curso) => {
                  const icon = icons[cardIdx % icons.length];
                  cardIdx++;
                  const jaInscrito = inscritos.has(String(curso.id));

                  return (
                    <div key={curso.id} className="curso-card" onClick={() => onVerCurso(curso.id)}>
                      <div className="curso-card-top">
                        <div className="curso-thumb">
                          <span className="curso-icon">{icon}</span>
                        </div>
                        <div className="curso-card-meta">
                          <span className="curso-preco">
                            {Number(curso.preco) > 0 ? `R$ ${Number(curso.preco).toFixed(2)}` : 'Gratuito'}
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
                          jaInscrito ? (
                            <span className="ja-inscrito-tag">✓ Inscrito</span>
                          ) : (
                            <button
                              className="btn-inscrever"
                              onClick={(e) => inscrever(curso.id, e)}
                              disabled={inscrevendo === curso.id}
                            >
                              {inscrevendo === curso.id ? '...' : 'Inscrever-se'}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
