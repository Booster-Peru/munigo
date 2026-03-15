const API_BASE_URL = window.localStorage.getItem('adminApiBase') || 'http://localhost:8080';

const reportsContainer = document.getElementById('reportsContainer');
const statusText = document.getElementById('statusText');
const refreshButton = document.getElementById('refreshButton');
const statusFilter = document.getElementById('statusFilter');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');

let accessToken = window.localStorage.getItem('adminAccessToken') || '';

const statusColor = (status) => {
  if (status === 'RESOLVED') return '#166534';
  if (status === 'IN_PROGRESS') return '#1d4ed8';
  if (status === 'REJECTED') return '#991b1b';
  return '#9a3412';
};

const authHeaders = () => {
  if (!accessToken) return { 'content-type': 'application/json' };
  return {
    'content-type': 'application/json',
    authorization: `Bearer ${accessToken}`,
  };
};

const renderReports = (items) => {
  if (!items.length) {
    reportsContainer.innerHTML = '<div class="card">Sin reportes registrados todavia.</div>';
    return;
  }

  reportsContainer.innerHTML = items
    .map(
      (item) => `
      <article class="card">
        <div class="meta">
          <span>${item.category}</span>
          <span style="color:${statusColor(item.status)};font-weight:700;">${item.status}</span>
        </div>
        <h3>${item.description}</h3>
        <p>${item.location?.address || 'Direccion pendiente'}</p>
        <div class="meta">
          <span>Usuario: ${item.userId}</span>
          <span>${new Date(item.createdAt).toLocaleString('es-PE')}</span>
        </div>
        <div class="actions">
          <button class="status-button" data-report-id="${item.id}" data-next-status="IN_PROGRESS">Marcar IN_PROGRESS</button>
          <button class="status-button" data-report-id="${item.id}" data-next-status="RESOLVED">Marcar RESOLVED</button>
          <button class="status-button" data-report-id="${item.id}" data-next-status="REJECTED">Marcar REJECTED</button>
        </div>
      </article>
    `,
    )
    .join('');

  reportsContainer.querySelectorAll('.status-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const reportId = button.dataset.reportId;
      const nextStatus = button.dataset.nextStatus;
      if (!reportId || !nextStatus) return;

      statusText.textContent = `Actualizando ${reportId}...`;
      try {
        const response = await fetch(`${API_BASE_URL}/v1/reports/${reportId}/status`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ status: nextStatus }),
        });

        if (!response.ok) {
          statusText.textContent = `No se pudo cambiar estado (${response.status})`;
          return;
        }

        statusText.textContent = `Reporte ${reportId} actualizado a ${nextStatus}`;
        await loadReports();
      } catch {
        statusText.textContent = 'Error de red al actualizar estado';
      }
    });
  });
};

const loadReports = async () => {
  if (!accessToken) {
    statusText.textContent = 'Inicia sesion para ver reportes';
    reportsContainer.innerHTML = '<div class="card">Sesion requerida.</div>';
    return;
  }

  statusText.textContent = 'Consultando API...';
  try {
    const query = statusFilter.value ? `?status=${encodeURIComponent(statusFilter.value)}` : '';
    const response = await fetch(`${API_BASE_URL}/v1/reports${query}`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      statusText.textContent = `Error ${response.status}`;
      return;
    }

    const payload = await response.json();
    renderReports(payload.items || []);
    statusText.textContent = `Total reportes: ${payload.total || 0}`;
  } catch {
    statusText.textContent = 'No se pudo conectar con API Gateway';
  }
};

const login = async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    statusText.textContent = 'Email y contrasena son requeridos';
    return;
  }

  statusText.textContent = 'Autenticando...';
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      statusText.textContent = `Credenciales invalidas (${response.status})`;
      return;
    }

    const payload = await response.json();
    accessToken = payload.accessToken || '';
    window.localStorage.setItem('adminAccessToken', accessToken);
    statusText.textContent = `Sesion iniciada como ${payload.user?.role || 'usuario'}`;
    loadReports();
  } catch {
    statusText.textContent = 'No se pudo iniciar sesion';
  }
};

const logout = () => {
  accessToken = '';
  window.localStorage.removeItem('adminAccessToken');
  statusText.textContent = 'Sesion cerrada';
  reportsContainer.innerHTML = '<div class="card">Sesion requerida.</div>';
};

refreshButton.addEventListener('click', loadReports);
statusFilter.addEventListener('change', loadReports);
loginButton.addEventListener('click', login);
logoutButton.addEventListener('click', logout);
loadReports();
