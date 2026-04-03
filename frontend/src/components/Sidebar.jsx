import { useAuth } from '../context/AuthContext';

const NAV_ALUNO = [
  { id: 'dashboard', icon: '⊡', label: 'Dashboard' },
  { id: 'cursos', icon: '◈', label: 'Explorar' },
];

const NAV_INSTRUTOR = [
  { id: 'dashboard', icon: '⊡', label: 'Meus Cursos' },
  { id: 'cursos', icon: '◈', label: 'Explorar' },
];

export default function Sidebar({ pagina, onNav }) {
  const { user, logout } = useAuth();
  const nav = user?.tipo === 'instrutor' ? NAV_INSTRUTOR : NAV_ALUNO;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon-sm">◈</span>
        <span>Learn<em>HUB</em></span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.email?.[0]?.toUpperCase() || '?'}</div>
        <div className="user-info">
          <span className="user-email">{user?.email}</span>
          <span className={`user-tipo ${user?.tipo}`}>{user?.tipo}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map(item => (
          <button
            key={item.id}
            className={`nav-item ${pagina === item.id ? 'active' : ''}`}
            onClick={() => onNav(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="btn-logout" onClick={logout}>
        <span>⏻</span> Sair
      </button>
    </aside>
  );
}
