import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

function AulaItem({ aula, index, inscrito, onConcluir }) {
  const [aberta, setAberta] = useState(false);

  const isUrl = (str) => {
    try { return Boolean(new URL(str)); } catch { return false; }
  };

  const renderConteudo = () => {
    if (!aula.conteudo) return <p className="aula-sem-conteudo">Sem conteúdo disponível.</p>;

    if (aula.tipo === 'pdf') {
      if (isUrl(aula.conteudo)) {
        return (
          <div className="aula-pdf-wrap">
            <iframe src={aula.conteudo} title={aula.titulo} className="aula-pdf-frame" />
            <a href={aula.conteudo} target="_blank" rel="noopener noreferrer" className="aula-link-externo">
              ↗ Abrir PDF em nova aba
            </a>
          </div>
        );
      }
      return <p className="aula-texto-conteudo">{aula.conteudo}</p>;
    }

    if (aula.tipo === 'video') {
      if (isUrl(aula.conteudo)) {
        // Converte links do YouTube para embed
        const ytMatch = aula.conteudo.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (ytMatch) {
          return (
            <div className="aula-video-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                title={aula.titulo}
                allowFullScreen
                className="aula-video-frame"
              />
            </div>
          );
        }
        return (
          <div className="aula-video-wrap">
            <video controls className="aula-video-native" src={aula.conteudo} />
          </div>
        );
      }
      return <p className="aula-texto-conteudo">{aula.conteudo}</p>;
    }

    // tipo texto (ou fallback)
    if (isUrl(aula.conteudo)) {
      return (
        <a href={aula.conteudo} target="_blank" rel="noopener noreferrer" className="aula-link-externo">
          ↗ Abrir link
        </a>
      );
    }
    return <p className="aula-texto-conteudo">{aula.conteudo}</p>;
  };

  return (
    <div className={`aula-item-wrap ${aberta ? 'aberta' : ''}`}>
      <div className="aula-item" onClick={() => setAberta(a => !a)}>
        <span className="aula-num">{index + 1}</span>
        <span className="aula-titulo">{aula.titulo}</span>
        <span className="aula-tipo">{aula.tipo || 'texto'}</span>
        <span className="aula-chevron">{aberta ? '▲' : '▼'}</span>
      </div>

      {aberta && (
        <div className="aula-conteudo-slot">
          {renderConteudo()}
          {inscrito && (
            <button className="btn-concluir" onClick={(e) => { e.stopPropagation(); onConcluir(aula.id); }}>
              ✓ Marcar como concluída
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CursoDetalhe({ cursoId, onVoltar }) {
  const [curso, setCurso]           = useState(null);
  const [modulos, setModulos]       = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [progresso, setProgresso]   = useState(null);
  const [abaAtiva, setAbaAtiva]     = useState('conteudo');
  const [nota, setNota]             = useState(8);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading]       = useState(true);
  const [inscrito, setInscrito]     = useState(false);
  const [inscrevendo, setInscrevendo] = useState(false);
  const [msg, setMsg]               = useState('');
  const [msgTipo, setMsgTipo]       = useState('ok');
  const { user } = useAuth();

  const flash = (texto, tipo = 'ok') => {
    setMsg(texto); setMsgTipo(tipo);
    setTimeout(() => setMsg(''), 3000);
  };

  const carregarCurso = async () => {
    const data = await api.obterCurso(cursoId);
    const c = Array.isArray(data?.curso) ? data.curso[0] : (data?.curso || data);

    const aulasBruto = Array.isArray(c?.aulas) ? c.aulas : [];
    const aulasPorModulo = {};
    aulasBruto.forEach(a => {
      if (!aulasPorModulo[a.modulo_id]) aulasPorModulo[a.modulo_id] = [];
      aulasPorModulo[a.modulo_id].push(a);
    });

    const modulosComAulas = (Array.isArray(c?.modulos) ? c.modulos : []).map(m => ({
      ...m, aulas: aulasPorModulo[m.id] || [],
    }));

    const avs = Array.isArray(c?.avaliacoes) ? c.avaliacoes : [];
    setCurso(c);
    setModulos(modulosComAulas);
    setAvaliacoes(avs);
    return c;
  };

  useEffect(() => {
    const load = async () => {
      try {
        await carregarCurso();
        if (user?.tipo === 'aluno') {
          api.obterProgresso(cursoId)
            .then(p => { setProgresso(p?.percentual ?? 0); setInscrito(true); })
            .catch(() => { setProgresso(null); setInscrito(false); });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cursoId]);

  const inscrever = async () => {
    setInscrevendo(true);
    try {
      await api.inscreverCurso(cursoId);
      setInscrito(true); setProgresso(0);
      flash('Inscrição realizada! 🎉');
    } catch (e) { flash(e.message, 'err'); }
    finally { setInscrevendo(false); }
  };

  const marcarConcluida = async (aulaId) => {
    try {
      await api.marcarConcluida(aulaId);
      const p = await api.obterProgresso(cursoId);
      setProgresso(p?.percentual ?? 0);
      flash('Aula concluída! ✓');
    } catch (e) { flash(e.message, 'err'); }
  };

  const avaliar = async () => {
    try {
      await api.avaliarCurso(cursoId, { nota, comentario });
      await carregarCurso();
      flash('Avaliação enviada!');
      setComentario('');
    } catch (e) { flash(e.message, 'err'); }
  };

  if (loading) return <div className="page-content"><div className="loading-full">Carregando curso...</div></div>;
  if (!curso)  return (
    <div className="page-content">
      <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>
      <div className="empty-state"><span>❌</span><p>Curso não encontrado</p></div>
    </div>
  );

  const mediaNota  = avaliacoes.length
    ? (avaliacoes.reduce((s, a) => s + Number(a.nota), 0) / avaliacoes.length).toFixed(1) : '—';
  const totalAulas = modulos.reduce((s, m) => s + m.aulas.length, 0);

  return (
    <div className="page-content">
      <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>

      {msg && <div className={`toast ${msgTipo === 'err' ? 'toast-err' : ''}`}>{msg}</div>}

      <div className="curso-detalhe-header">
        <div className="curso-detalhe-info">
          <div className="curso-detalhe-top-row">
            <div className="curso-detalhe-badge">Curso</div>
            {curso.categoria && <span className="categoria-tag">{curso.categoria}</span>}
          </div>
          <h2>{curso.titulo}</h2>
          <p>{curso.descricao}</p>
          <div className="curso-detalhe-stats">
            <span>⭐ {mediaNota}</span>
            <span>💬 {avaliacoes.length} avaliações</span>
            <span>📦 {modulos.length} módulos</span>
            <span>🎬 {totalAulas} aulas</span>
            {Number(curso.preco) > 0
              ? <span>💰 R$ {Number(curso.preco).toFixed(2)}</span>
              : <span>🆓 Gratuito</span>}
          </div>
          {user?.tipo === 'aluno' && !inscrito && (
            <button className="btn-inscrever-detalhe" onClick={inscrever} disabled={inscrevendo}>
              {inscrevendo ? 'Inscrevendo...' : '🎓 Inscrever-se neste curso'}
            </button>
          )}
          {user?.tipo === 'aluno' && inscrito && (
            <div className="inscrito-badge">✓ Você está inscrito neste curso</div>
          )}
        </div>

        {user?.tipo === 'aluno' && progresso !== null && (
          <div className="progresso-card">
            <span className="progresso-label">Seu progresso</span>
            <div className="progresso-ring">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" className="ring-bg" />
                <circle cx="40" cy="40" r="34" className="ring-fill"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - progresso / 100)}`}
                />
              </svg>
              <span>{progresso}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="abas">
        <button className={abaAtiva === 'conteudo' ? 'active' : ''} onClick={() => setAbaAtiva('conteudo')}>
          📚 Conteúdo
        </button>
        <button className={abaAtiva === 'avaliacoes' ? 'active' : ''} onClick={() => setAbaAtiva('avaliacoes')}>
          ⭐ Avaliações ({avaliacoes.length})
        </button>
      </div>

      {abaAtiva === 'conteudo' && (
        <div className="modulos-list">
          {modulos.length === 0 ? (
            <div className="empty-state"><span>📭</span><p>Nenhum módulo cadastrado ainda</p></div>
          ) : modulos.map((mod, mi) => (
            <div key={mod.id} className="modulo-item">
              <div className="modulo-header">
                <span className="modulo-num">M{mi + 1}</span>
                <h4>{mod.titulo}</h4>
                <span className="modulo-aulas-count">{mod.aulas.length} aula{mod.aulas.length !== 1 ? 's' : ''}</span>
              </div>
              {mod.aulas.length > 0 && (
                <div className="aulas-list">
                  {mod.aulas.map((aula, ai) => (
                    <AulaItem
                      key={aula.id}
                      aula={aula}
                      index={ai}
                      inscrito={inscrito}
                      onConcluir={marcarConcluida}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {abaAtiva === 'avaliacoes' && (
        <div className="avaliacoes-section">
          {user?.tipo === 'aluno' && inscrito && (
            <div className="avaliar-form">
              <h4>Deixe sua avaliação</h4>
              <div className="nota-selector">
                {[...Array(10)].map((_, i) => (
                  <button key={i+1} className={nota === i+1 ? 'active' : ''} onClick={() => setNota(i+1)}>
                    {i+1}
                  </button>
                ))}
              </div>
              <textarea value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Seu comentário (opcional)..." />
              <button className="btn-primary sm" onClick={avaliar}>Enviar avaliação</button>
            </div>
          )}
          <div className="avaliacoes-list">
            {avaliacoes.length === 0 ? (
              <div className="empty-state"><span>💬</span><p>Sem avaliações ainda.</p></div>
            ) : avaliacoes.map((av, i) => (
              <div key={av.id || i} className="avaliacao-item">
                <div className="av-header">
                  <span className="av-nota">{av.nota}/10</span>
                  <span className="av-user">Aluno #{av.aluno_id}</span>
                </div>
                {av.comentario && <p>{av.comentario}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
