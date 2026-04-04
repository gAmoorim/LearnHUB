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
        // GET /meus-cursos → { mensagem, cursos: [{ curso_id, nome_curso, data_inscricao }] }
        const lista = Array.isArray(data) ? data : (data?.cursos || []);

        setMeusCursos(lista);

        // Carrega progresso de cada curso pelo curso_id
        const progs = {};
        await Promise.all(lista.map(async (item) => {
          const id = item.curso_id;
          try {
            const p = await api.obterProgresso(id);
            progs[id] = p?.percentual ?? 0;
          } catch {
            progs[id] = 0;
          }
        }));
        setProgressos(progs);
      } catch {
        // 404 = sem inscrições ainda — não é erro real
        setMeusCursos([]);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const concluidos  = meusCursos.filter(c => progressos[c.curso_id] === 100).length;
  const emAndamento = meusCursos.filter(c => progressos[c.curso_id] > 0 && progressos[c.curso_id] < 100).length;

  return (
    <div className="page-content">
      <div className="dashboard-welcome">
        <h2>Olá, bem-vindo de volta!</h2>
        <p>Continue de onde parou</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-num">{meusCursos.length}</span>
            <span className="stat-label">Inscrições</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-num">{emAndamento}</span>
            <span className="stat-label">Em andamento</span>
          </div>
        </div>
        <div className="stat-card">
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
          {meusCursos.map((item) => {
            const id  = item.curso_id;
            const pct = progressos[id] ?? 0;
            return (
              <div key={id} className="meu-curso-card" onClick={() => onVerCurso(id)}>
                <div className="meu-curso-icon">
                  {pct === 100 ? '🏆' : pct > 0 ? '▶️' : '📘'}
                </div>
                <div className="meu-curso-info">
                  {/* nome_curso é o campo retornado pelo join */}
                  <h4>{item.nome_curso || item.titulo || `Curso #${id}`}</h4>
                  <p className="inscricao-data">
                    Inscrito em {new Date(item.data_inscricao).toLocaleDateString('pt-BR')}
                  </p>
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
