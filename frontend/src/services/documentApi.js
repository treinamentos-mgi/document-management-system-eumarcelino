const API_PREFIX = '/api';
const DEMO_USER_ID = 'dms-demo-user';

async function request(path, options = {}) {
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers: {
      'X-User-Id': DEMO_USER_ID,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = 'Não foi possível concluir a solicitação.';
    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch {
      // Mantém a mensagem padrão quando a resposta não contém JSON.
    }
    throw new Error(message);
  }

  return response;
}

export async function listDocuments() {
  const response = await request('/documents');
  return response.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

export async function downloadDocument(documentId) {
  const response = await request(`/documents/${encodeURIComponent(documentId)}/download`);
  return response.blob();
}