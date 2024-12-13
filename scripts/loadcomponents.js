let loadingScreen = document.getElementById('loadingScreen');

function showLoading() {
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

function hideLoading() {
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
}

async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Elemento com o ID '${elementId}' não encontrado.`);
        return;
    }

    try {
        showLoading(); // Mostra o loading antes de carregar o componente
        const response = await fetch(filePath);
        const data = await response.text();
        element.innerHTML = data;
    } catch (error) {
        console.error('Erro ao carregar o componente:', error);
    } finally {
        hideLoading(); // Esconde o loading após carregar o componente
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    await loadComponent('navbar', './components/navbar.html');
    await loadComponent('footer', './components/footer.html');

    // Chame a função de modo escuro aqui após os componentes serem carregados
    const { setupDarkMode } = await import('./scriptdarkmode.js');
    setupDarkMode();

});
