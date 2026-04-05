import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIAS = ['Programação','Design','Marketing','Negócios','Fotografia','Música','Idiomas','Saúde','Outro'];

// ── Modais ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, onSave, loading, error, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
        {error && <div className="auth-error">{error}</div>}
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button className="btn-primary sm" onClick={onSave} disabled={loading}>
            {loading ? '...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalCurso({ onClose, onSalvo, cursoEdit }) {
  const [form, setForm] = useState({
    titulo:    cursoEdit?.titulo    || '',
    descricao: cursoEdit?.descricao || '',
    categoria: cursoEdit?.categoria || '',
    preco:     cursoEdit?.preco     || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const salvar = async () => {
    if (!form.titulo || !form.descricao || !form.categoria) {
      setError('Título, descrição e categoria são obrigatórios.'); return;
    }
    setLoading(true); setError('');
    try {
      cursoEdit ? await api.atualizarCurso(cursoEdit.id, form) : await api.criarCurso(form);
      onSalvo();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={cursoEdit ? 'Editar Curso' : 'Novo Curso'} onClose={onClose} onSave={salvar} loading={loading} error={error}>
      <div className="field"><label>Título *</label>
        <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Título do curso" />
      </div>
      <div className="field"><label>Descrição *</label>
        <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Descreva o curso..." />
      </div>
      <div className="field"><label>Categoria *</label>
        <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
          <option value="">Selecione uma categoria</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="field"><label>Preço (opcional)</label>
        <input type="number" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} placeholder="0.00" />
      </div>
    </Modal>
  );
}

function ModalModulo({ cursoId, onClose, onSalvo, moduloEdit }) {
  const [titulo, setTitulo] = useState(moduloEdit?.titulo || '');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const salvar = async () => {
    if (!titulo.trim()) { setError('Título obrigatório.'); return; }
    setLoading(true);
    try {
      if (moduloEdit) {
        await api.atualizarModulo(moduloEdit.id, { titulo });
      } else {
        await api.criarModulo(cursoId, { titulo });
      }
      onSalvo();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={moduloEdit ? 'Editar Módulo' : 'Novo Módulo'} onClose={onClose} onSave={salvar} loading={loading} error={error}>
      <div className="field"><label>Título do módulo *</label>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Introdução" />
      </div>
    </Modal>
  );
}

function ModalAula({ moduloId, onClose, onSalvo, aulaEdit }) {
  const [form, setForm] = useState({
    titulo:   aulaEdit?.titulo   || '',
    conteudo: aulaEdit?.conteudo || '',
    tipo:     aulaEdit?.tipo     || 'video',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const salvar = async () => {
    if (!form.titulo || !form.conteudo) { setError('Título e conteúdo obrigatórios.'); return; }
    setLoading(true);
    try {
      if (aulaEdit) {
        await api.atualizarAula(aulaEdit.id, form);
      } else {
        await api.criarAula(moduloId, form);
      }
      onSalvo();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={aulaEdit ? 'Editar Aula' : 'Nova Aula'} onClose={onClose} onSave={salvar} loading={loading} error={error}>
      <div className="field"><label>Título *</label>
        <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Título da aula" />
      </div>
      <div className="field"><label>Conteúdo (link / texto) *</label>
        <input value={form.conteudo} onChange={e => setForm({...form, conteudo: e.target.value})} placeholder="URL ou conteúdo" />
      </div>
      <div className="field"><label>Tipo</label>
        <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
          <option value="video">Vídeo</option>
          <option value="texto">Texto</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
    </Modal>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────

export default function DashboardInstrutor({ onVerCurso }) {
  const [cursos, setCursos]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null);
  const [cursoAtivo, setCursoAtivo]   = useState(null);
  const [modulos, setModulos]         = useState([]);
  const [msg, setMsg]                 = useState('');
  const { user } = useAuth();

  const flash = (texto) => { setMsg(texto); setTimeout(() => setMsg(''), 2500); };

  const carregarCursos = async () => {
    try {
      const data = await api.listarCursos();
      const lista = Array.isArray(data) ? data : (data?.cursos || []);
      setCursos(lista.filter(c => Number(c.instrutor_id) === Number(user?.id)));
    } catch { setCursos([]); }
    finally { setLoading(false); }
  };

  const carregarModulos = async (cursoId) => {
    const data = await api.listarModulos(cursoId).catch(() => []);
    const lista = Array.isArray(data) ? data : (data?.modulos || data?.data || []);
    setModulos(lista);
  };

  useEffect(() => { carregarCursos(); }, []);

  const abrirCurso = async (curso) => {
    setCursoAtivo(curso);
    await carregarModulos(curso.id);
  };

  const deletarCurso = async (id) => {
    if (!confirm('Deletar este curso e todo seu conteúdo?')) return;
    try {
      await api.deletarCurso(id);
      flash('Curso deletado.');
      if (cursoAtivo?.id === id) { setCursoAtivo(null); setModulos([]); }
      carregarCursos();
    } catch (e) { flash(e.message); }
  };

  const deletarModulo = async (moduloId) => {
    if (!confirm('Deletar este módulo e suas aulas?')) return;
    try {
      await api.deletarModulo(moduloId);
      flash('Módulo deletado.');
      carregarModulos(cursoAtivo.id);
    } catch (e) { flash(e.message); }
  };

  const deletarAula = async (aulaId) => {
    if (!confirm('Deletar esta aula?')) return;
    try {
      await api.deletarAula(aulaId);
      flash('Aula deletada.');
      carregarModulos(cursoAtivo.id);
    } catch (e) { flash(e.message); }
  };

  const onSalvo = () => {
    setModal(null);
    carregarCursos();
    if (cursoAtivo) carregarModulos(cursoAtivo.id);
    flash('Salvo com sucesso!');
  };

  return (
    <div className="page-content">
      {msg && <div className="toast">{msg}</div>}

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h2>Meus Cursos</h2>
          <p>{cursos.length} curso{cursos.length !== 1 ? 's' : ''} criado{cursos.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('curso')}>+ Novo Curso</button>
      </div>

      {/* ── Painel editor (curso selecionado) ── */}
      {cursoAtivo && (
        <div className="curso-editor-panel">
          <div className="editor-header">
            <div>
              <h3>{cursoAtivo.titulo}</h3>
              {cursoAtivo.categoria && <span className="categoria-tag">{cursoAtivo.categoria}</span>}
            </div>
            <div className="editor-header-actions">
              <button className="btn-secondary" onClick={() => setModal({ type: 'modulo', cursoId: cursoAtivo.id })}>
                + Módulo
              </button>
              <button className="btn-fechar" onClick={() => { setCursoAtivo(null); setModulos([]); }}>✕</button>
            </div>
          </div>

          <div className="modulos-editor">
            {modulos.length === 0 ? (
              <div className="empty-state sm"><span>📭</span><p>Adicione módulos ao curso</p></div>
            ) : modulos.map((mod, mi) => (
              <div key={mod.id} className="modulo-editor-item">
                <div className="mod-header">
                  <span className="mod-num">Módulo {mi + 1}</span>
                  <span className="mod-titulo">{mod.titulo}</span>
                  <div className="mod-actions">
                    <button className="btn-icon" title="Editar módulo"
                      onClick={() => setModal({ type: 'editarModulo', modulo: mod, cursoId: cursoAtivo.id })}>✏️</button>
                    <button className="btn-icon" title="Nova aula"
                      onClick={() => setModal({ type: 'aula', moduloId: mod.id })}>+ Aula</button>
                    <button className="btn-icon danger" title="Deletar módulo"
                      onClick={() => deletarModulo(mod.id)}>🗑️</button>
                  </div>
                </div>

                {mod.aulas && mod.aulas.length > 0 && (
                  <div className="aulas-editor">
                    {mod.aulas.map((aula, ai) => (
                      <div key={aula.id} className="aula-editor-item">
                        <span className="aula-editor-num">{ai + 1}.</span>
                        <span className="aula-editor-titulo">{aula.titulo}</span>
                        <span className="aula-tipo-tag">{aula.tipo}</span>
                        <div className="aula-actions">
                          <button className="btn-icon sm" title="Editar aula"
                            onClick={() => setModal({ type: 'editarAula', aula, moduloId: mod.id })}>✏️</button>
                          <button className="btn-icon sm danger" title="Deletar aula"
                            onClick={() => deletarAula(aula.id)}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lista de cursos ── */}
      <div className="instrutor-cursos-lista">
        {!cursoAtivo && (
          <p className="selecione-hint">Selecione um curso abaixo para gerenciar módulos e aulas</p>
        )}

        {loading ? (
          <div className="loading-full">Carregando...</div>
        ) : cursos.length === 0 ? (
          <div className="empty-state">
            <span>🏫</span>
            <p>Você ainda não criou nenhum curso</p>
          </div>
        ) : (
          <div className="instrutor-cursos-grid">
            {cursos.map(c => (
              <div
                key={c.id}
                className={`instrutor-curso-card ${cursoAtivo?.id === c.id ? 'active' : ''}`}
                onClick={() => abrirCurso(c)}
              >
                <div className="instrutor-curso-card-body">
                  <div className="instrutor-curso-top">
                    {c.categoria && <span className="categoria-tag sm">{c.categoria}</span>}
                  </div>
                  <h4>{c.titulo}</h4>
                  <p>{c.descricao}</p>
                  <span className="sidebar-preco">
                    {Number(c.preco) > 0 ? `R$ ${Number(c.preco).toFixed(2)}` : 'Gratuito'}
                  </span>
                </div>
                <div className="instrutor-curso-card-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn-icon" title="Editar curso"
                    onClick={() => setModal({ type: 'editarCurso', curso: c })}>✏️</button>
                  <button className="btn-icon danger" title="Deletar curso"
                    onClick={() => deletarCurso(c.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modais ── */}
      {modal === 'curso'                  && <ModalCurso onClose={() => setModal(null)} onSalvo={onSalvo} />}
      {modal?.type === 'editarCurso'      && <ModalCurso cursoEdit={modal.curso} onClose={() => setModal(null)} onSalvo={onSalvo} />}
      {modal?.type === 'modulo'           && <ModalModulo cursoId={modal.cursoId} onClose={() => setModal(null)} onSalvo={onSalvo} />}
      {modal?.type === 'editarModulo'     && <ModalModulo cursoId={modal.cursoId} moduloEdit={modal.modulo} onClose={() => setModal(null)} onSalvo={onSalvo} />}
      {modal?.type === 'aula'             && <ModalAula moduloId={modal.moduloId} onClose={() => setModal(null)} onSalvo={onSalvo} />}
      {modal?.type === 'editarAula'       && <ModalAula moduloId={modal.moduloId} aulaEdit={modal.aula} onClose={() => setModal(null)} onSalvo={onSalvo} />}
    </div>
  );
}