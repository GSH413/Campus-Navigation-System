const modeView = document.getElementById('modeView');
const loginView = document.getElementById('loginView');
const password = document.getElementById('password');
const loginError = document.getElementById('loginError');
document.querySelector('[data-mode="user"]').addEventListener('click', () => window.campusAPI.navigate('user'));
document.querySelector('[data-mode="admin"]').addEventListener('click', () => { modeView.classList.add('hidden'); loginView.classList.remove('hidden'); password.focus(); });
document.getElementById('backButton').addEventListener('click', () => { loginView.classList.add('hidden'); modeView.classList.remove('hidden'); loginError.textContent = ''; password.value = ''; });
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault(); loginError.textContent = '';
  if (!password.value) { loginError.textContent = '请输入管理员密码。'; return; }
  const ok = await window.adminAPI.authenticate(password.value);
  if (!ok) { loginError.textContent = '密码错误，请重新输入。'; password.select(); return; }
  await window.campusAPI.navigate('admin');
});
