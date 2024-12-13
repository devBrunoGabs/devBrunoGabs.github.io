// darkmode.js
export function setupDarkMode() {
    // Verificar e aplicar o modo baseado no localStorage
    const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
	
    // Definir o modo inicial baseado no localStorage
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode'); // Garante que light-mode não esteja presente
        document.querySelector('#modeToggle i').classList.replace('fa-moon', 'fa-sun');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode'); // Garante que dark-mode não esteja presente
    }

    // Adicionar listener de evento para o botão de alternar modo
    const modeToggle = document.getElementById('modeToggle');

    if (modeToggle) {
        modeToggle.addEventListener('click', function () {
            // Alternar entre os modos
            if (document.body.classList.contains('dark-mode')) {
                // Ativando light mode
                document.body.classList.remove('dark-mode'); // Remove dark-mode
                document.body.classList.add('light-mode'); // Adiciona light-mode
                document.querySelector('#modeToggle i').classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('darkMode', 'disabled');
            } else {
                // Ativando dark mode
                document.body.classList.remove('light-mode'); // Remove light-mode
                document.body.classList.add('dark-mode'); // Adiciona dark-mode
                document.querySelector('#modeToggle i').classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('darkMode', 'enabled');
            }
			
        });
    }
}
