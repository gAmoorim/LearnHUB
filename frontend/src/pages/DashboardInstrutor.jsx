import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIAS = [
  'Programação',
  'Design',
  'Marketing',
  'Negócios',
  'Fotografia',
  'Música',
  'Idiomas',
  'Saúde',
  'Outro',
];

function ModalCurso({ onClose, onSalvo, cursoEdit }) {
  const [form, setForm] = useState({
    titulo:    cursoEdit?.titulo    || '',
    descricao: cursoEdit?.descricao || '',
    categoria: cursoEdit?.categoria || '',
    preco:     cursoEdit?.preco     || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const submit = async () => {
    if (!form.titulo || !form.descricao || !form.categoria) {
      setError('Título, descrição e categoria são obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (cursoEdit) {
        await api.atualizarCurso(cursoEdit.id, form);
      } else {
        await api.criarCurso(form);
      }
      onSalvo();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{cursoEdit ? 'Editar Curso' : 'Novo Curso'}</h3>

        <div className="field">
          <label>Título *</label>
          <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Título do curso" />
        </div>

        <div className="field">
          <label>Descrição *</label>
          <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva o curso..." />
        </div>

        <div className="field">
          <label>Categoria *</label>
          <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
            <option value="">Selecione uma categoria</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Preço (opcional)</label>
          <input type="number" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} placeholder="0.00" />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button className="btn-primary sm" onClick={submit} disabled={loading}>
            {loading ? '...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalModulo({ cursoId, onClose, onSalvo }) {
  const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const submit = async () => {
    if (!titulo) { setError('Título obrigatório.'); return; }
    setLoading(true);
    try {
      await api.criarModulo(cursoId, { titulo });
      onSalvo();
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Novo Módulo</h3>
        <div className="field">
          <label>Título do módulo *</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Introdução" />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button className="btn-primary sm" onClick={submit} disabled={loading}>{loading ? '...' : 'Criar'}</button>
        </div>
      </div>
    </div>
  );
}

function ModalAula({ moduloId, onClose, onSalvo }) {
  const [form, setForm] = useState({ titulo: '', conteudo: '', tipo: 'video' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const submit = async () => {
    if (!form.titulo || !form.conteudo) { setError('Título e conteúdo obrigatórios.'); return; }
    setLoading(true);
    try {
      await api.criarAula(moduloId, form);
      onSalvo();
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Nova Aula</h3>
        <div className="field">
          <label>Título *</label>
          <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Título da aula" />
        </div>
        <div className="field">
          <label>Conteúdo (link / texto) *</label>
          <input value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })} placeholder="URL ou conteúdo" />
        </div>
        <div className="field">
          <label>Tipo</label>
          <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
            <option value="video">Vídeo</option>
            <option value="texto">Texto</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button className="btn-primary sm" onClick={submit} disabled={loading}>{loading ? '...' : 'Criar'}</button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardInstrutor({ onVerCurso }) {
  const [cursos, setCursos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [cursoAtivo, setCursoAtivo] = useState(null);
  const [modulos, setModulos]     = useState([]);
  const [msg, setMsg]             = useState('');
  const { user } = useAuth();

  const carregarCursos = async () => {
    try {
      const data = await api.listarCursos();
      // GET /cursos retorna { mensagem, cursos: [...] }
      const lista = Array.isArray(data) ? data : (data?.cursos || []);
      // Filtra apenas os cursos do instrutor logado (instrutor_id vem no select *)
      const meus = lista.filter(c => Number(c.instrutor_id) === Number(user?.id));
      setCursos(meus);
    } catch (e) {
      // 404 = sem cursos ainda
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarModulos = async (cursoId) => {
    const data = await api.listarModulos(cursoId).catch(() => []);
    const lista = Array.isArray(data)
      ? data
      : data?.modulos || data?.data || data?.rows || [];
    setModulos(lista);
  };

  useEffect(() => { carregarCursos(); }, []);

  const abrirCurso = async (curso) => {
    setCursoAtivo(curso);
    await carregarModulos(curso.id);
  };

  const deletar = async (id) => {
    if (!confirm('Deletar este curso?')) return;
    try {
      await api.deletarCurso(id);
      setMsg('Curso deletado.');
      carregarCursos();
      if (cursoAtivo?.id === id) setCursoAtivo(null);
    } catch (e) { setMsg(e.message); }
    setTimeout(() => setMsg(''), 3000);
  };

  const onSalvo = () => {
    setModal(null);
    carregarCursos();
    if (cursoAtivo) carregarModulos(cursoAtivo.id);
    setMsg('Salvo com sucesso!');
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div className="page-content">
      {msg && <div className="toast">{msg}</div>}

      <div className="page-header">
        <div>
          <h2>Meus Cursos</h2>
          <p>{cursos.length} cursos criados</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('curso')}>+ Novo Curso</button>
      </div>

      <div className="instrutor-layout">
        <div className="cursos-sidebar">
          {loading ? (
            <div className="loading-full">Carregando...</div>
          ) : cursos.length === 0 ? (
            <div className="empty-state sm">
              <span>🏫</span>
              <p>Crie seu primeiro curso!</p>
            </div>
          ) : cursos.map(c => (
            <div
              key={c.id}
              className={`sidebar-item ${cursoAtivo?.id === c.id ? 'active' : ''}`}
              onClick={() => abrirCurso(c)}
            >
              <div className="sidebar-item-info">
                <span className="sidebar-title">{c.titulo}</span>
                <span className="sidebar-preco">{c.preco ? `R$ ${Number(c.preco).toFixed(2)}` : 'Gratuito'}</span>
              </div>
              <div className="sidebar-actions">
                <button onClick={e => { e.stopPropagation(); setModal({ type: 'editarCurso', curso: c }); }} title="Editar">✏️</button>
                <button onClick={e => { e.stopPropagation(); deletar(c.id); }} title="Deletar">🗑️</button>
              </div>
            </div>
          ))}
        </div>

        <div className="curso-editor">
          {!cursoAtivo ? (
            <div className="empty-state">
              <span>👈</span>
              <p>Selecione um curso para gerenciar</p>
            </div>
          ) : (
            <>
              <div className="editor-header">
                <div>
                  <h3>{cursoAtivo.titulo}</h3>
                  {cursoAtivo.categoria && <span className="categoria-tag">{cursoAtivo.categoria}</span>}
                </div>
                <button className="btn-secondary" onClick={() => setModal({ type: 'modulo', cursoId: cursoAtivo.id })}>
                  + Módulo
                </button>
              </div>
              <div className="modulos-editor">
                {modulos.length === 0 ? (
                  <div className="empty-state sm"><span>📭</span><p>Adicione módulos ao curso</p></div>
                ) : modulos.map((mod, mi) => (
                  <div key={mod.id} className="modulo-editor-item">
                    <div className="mod-header">
                      <span className="mod-num">Módulo {mi + 1}</span>
                      <span className="mod-titulo">{mod.titulo}</span>
                      <button
                        className="btn-mini"
                        onClick={() => setModal({ type: 'aula', moduloId: mod.id })}
                      >+ Aula</button>
                    </div>
                    {mod.aulas && mod.aulas.length > 0 && (
                      <div className="aulas-editor">
                        {mod.aulas.map((a, ai) => (
                          <div key={a.id} className="aula-editor-item">
                            <span>{ai + 1}.</span>
                            <span>{a.titulo}</span>
                            <span className="aula-tipo-tag">{a.tipo}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {modal === 'curso' && <ModalCurso onClose={() => setModal(null)} onSalvo={onSalvo} />}
      {modal?.type === 'editarCurso' && <ModalCurso cursoEdit={modal.curso} onClose={() => setModal(null)} onSalvo={onSalvo} />}
      {modal?.type === 'modulo' && <ModalModulo cursoId={modal.cursoId} onClose={() => setModal(null)} onSalvo={onSalvo} />}
      {modal?.type === 'aula' && <ModalAula moduloId={modal.moduloId} onClose={() => setModal(null)} onSalvo={onSalvo} />}
    </div>
  );
}
