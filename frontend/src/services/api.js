const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getToken = () => localStorage.getItem('learnhub_token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const request = async (method, path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || data.erro || 'Erro na requisição');
  return data;
};

export const api = {
  // Auth
  cadastrar: (body) => request('POST', '/usuarios', body),
  login:     (body) => request('POST', '/login', body),

  // Usuarios
  listarUsuarios: ()     => request('GET',    '/usuarios'),
  obterUsuario:   (id)   => request('GET',    `/usuarios/${id}`),
  deletarUsuario: (id)   => request('DELETE', `/usuarios/${id}`),

  // Cursos — retorna { mensagem, cursos: [...] }
  criarCurso:     (body)     => request('POST',   '/cursos', body),
  listarCursos:   (params='')=> request('GET',    `/cursos${params}`),
  // retorna { mensagem, curso: [{}] }  ← array com 1 item!
  obterCurso:     (id)       => request('GET',    `/cursos/${id}`),
  atualizarCurso: (id, body) => request('PUT',    `/cursos/${id}`, body),
  deletarCurso:   (id)       => request('DELETE', `/cursos/${id}`),

  // Módulos
  criarModulo:  (cursoId, body) => request('POST', `/modulos/${cursoId}`, body),
  listarModulos:(cursoId)       => request('GET',  `/cursos/${cursoId}/modulos`),

  // Aulas
  criarAula:   (moduloId, body) => request('POST', `/aulas/modulos/${moduloId}`, body),
  listarAulas: (moduloId)       => request('GET',  `/aulas/modulos/${moduloId}`),

  // Inscrições
  inscreverCurso:   (id) => request('POST', `/cursos/${id}/inscrever`),
  meusCursos:       ()   => request('GET',  '/meus-cursos'),

  // Progresso
  marcarConcluida:   (aulaId)  => request('POST', `/conclusao/aulas/${aulaId}`),
  obterProgresso:    (cursoId) => request('GET',  `/cursos/${cursoId}/progresso`),

  // Avaliações
  avaliarCurso:     (id, body) => request('POST', `/cursos/${id}/avaliar`, body),
  listarAvaliacoes: (id)       => request('GET',  `/cursos/${id}/avaliacoes`),
};
