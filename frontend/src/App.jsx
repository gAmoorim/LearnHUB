import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import CursosPage from './pages/CursosPage';
import CursoDetalhe from './pages/CursoDetalhe';
import DashboardAluno from './pages/DashboardAluno';
import DashboardInstrutor from './pages/DashboardInstrutor';
import PerfilPage from './pages/PerfilPage';
import Sidebar from './components/Sidebar';
import './App.css';

function AppInner() {
  const { user, loading } = useAuth();
  const [pagina, setPagina] = useState('dashboard');
  const [cursoId, setCursoId] = useState(null);

  if (loading) return (
    <div className="loading-screen"><span className="brand-icon">◈</span></div>
  );

  if (!user) return <AuthPage onSuccess={() => setPagina('dashboard')} />;

  const verCurso = (id) => { setCursoId(id); setPagina('curso'); };
  const voltar   = () => { setCursoId(null); setPagina('cursos'); };

  return (
    <div className="app-layout">
      <Sidebar pagina={pagina} onNav={(p) => { setPagina(p); setCursoId(null); }} />
      <main className="main-area">
        {pagina === 'dashboard' && user.tipo === 'aluno'     && <DashboardAluno onVerCurso={verCurso} />}
        {pagina === 'dashboard' && user.tipo === 'instrutor' && <DashboardInstrutor onVerCurso={verCurso} />}
        {pagina === 'cursos'                                 && <CursosPage onVerCurso={verCurso} />}
        {pagina === 'curso'    && cursoId                    && <CursoDetalhe cursoId={cursoId} onVoltar={voltar} />}
        {pagina === 'perfil'                                 && <PerfilPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
