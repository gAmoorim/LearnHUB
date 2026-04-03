import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardAluno({ onVerCurso }) {
  const [meusCursos, setMeusCursos] = useState([]);
  const [progressos, setProgressos] = useState({});
  const [loading, setLoading]       = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const carregar = async () => {
      try {
        const data = await api.meusCursos();
        // GET /meus-cursos retorna { mensagem, cursos: [...] }
        // Cada item é a inscrição: { id, aluno_id, curso_id, data_inscricao }
        // OU pode já vir com join: { curso_id, titulo, descricao, ... }
        const lista = Array.isArray(data) ? data : (data?.cursos || []);

        // Enriquece com dados do curso se não tiver título
        const cursosCompletos = await Promise.all(
          lista.map(async (item) => {
            if (item.titulo) return item; // já veio com join

            const cursoId = item.curso_id || item.id;
            if (!cursoId) return item;

            try {
              const resp = await api.obterCurso(cursoId);
              // GET /cursos/:id retorna { curso: [{}] }
              const c = Array.isArray(resp?.curso) ? resp.curso[0] : (resp?.curso || resp);
              return { ...item, ...c, _cursoId: cursoId };
            } catch {
              return { ...item, titulo: `Curso #${cursoId}`, _cursoId: cursoId };
            }
          })
        );

        setMeusCursos(cursosCompletos);

        // Carrega progresso de cada curso
        const progs = {};
        await Promise.all(cursosCompletos.map(async (c) => {
          const id = c.curso_id || c._cursoId || c.id;
          try {
            const p = await api.obterProgresso(id);
            progs[id] = p?.percentual ?? 0;
          } catch { progs[id] = 0; }
        }));
        setProgressos(progs);
      } catch (e) {
        // 404 = sem inscrições ainda
        console.error('Erro ao carregar meus cursos:', e);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const getId = (c) => c.curso_id || c._cursoId || c.id;
  const concluidos  = meusCursos.filter(c => progressos[getId(c)] === 100).length;
  const emAndamento = meusCursos.filter(c => {
    const p = progressos[getId(c)];
    return p > 0 && p < 100;
  }).length;

  return (
    <div className="page-content">
      <div className="dashboard-welcome">
        <h2>Olá, bem-vindo de volta! 👋</h2>
        <p>Continue de onde parou</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <div className="stat-info">
            <span className="stat-num">{meusCursos.length}</span>
            <span className="stat-label">Inscrições</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">▶️</span>
          <div className="stat-info">
            <span className="stat-num">{emAndamento}</span>
            <span className="stat-label">Em andamento</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-num">{concluidos}</span>
            <span className="stat-label">Concluídos</span>
          </div>
        </div>
      </div>

      <h3 className="section-title">Meus Cursos</h3>

      {loading ? (
        <div className="meus-cursos-list">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-card" style={{ height: '88px' }} />
          ))}
        </div>
      ) : meusCursos.length === 0 ? (
        <div className="empty-state">
          <span>🎓</span>
          <p>Você ainda não está inscrito em nenhum curso</p>
          <p className="empty-sub">Explore os cursos disponíveis e comece a aprender!</p>
        </div>
      ) : (
        <div className="meus-cursos-list">
          {meusCursos.map((curso) => {
            const id  = getId(curso);
            const pct = progressos[id] ?? 0;
            return (
              <div key={id} className="meu-curso-card" onClick={() => onVerCurso(id)}>
                <div className="meu-curso-icon">
                  {pct === 100 ? '🏆' : pct > 0 ? '▶️' : '📘'}
                </div>
                <div className="meu-curso-info">
                  <h4>{curso.titulo || `Carregando...`}</h4>
                  {curso.descricao && <p>{curso.descricao}</p>}
                  <div className="progress-bar-wrap">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="progress-pct">{pct}%</span>
                  </div>
                </div>
                <div className="meu-curso-status">
                  <span className={`status-badge ${pct === 100 ? 'done' : pct > 0 ? 'progress' : 'new'}`}>
                    {pct === 100 ? 'Concluído' : pct > 0 ? 'Em andamento' : 'Novo'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
