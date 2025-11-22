let allData = []; // Armazena todos os dados carregados do JSON
let currentCategory = 'all'; // Armazena a categoria atualmente selecionada
let activeCategoryButton = null; // Armazena a referência para o botão de categoria ativo

// --- Seletores de Elementos DOM ---
const cardContainer = document.getElementById('card-container');
const searchInput = document.getElementById('search-input');
const errorMessage = document.getElementById('error-message');
const searchButton = document.getElementById('search-button');
const categoryFiltersContainer = document.getElementById('category-filters');

// Verificação inicial para garantir que os elementos essenciais existem
if (!cardContainer || !searchInput || !errorMessage || !searchButton || !categoryFiltersContainer) {
    console.error('Erro: Um ou mais elementos essenciais do DOM não foram encontrados. Verifique os IDs no seu HTML.');
}

// Função para renderizar os cards na tela
function renderCards(data) {
    cardContainer.innerHTML = ''; // Limpa os cards existentes para evitar duplicação
    if (data.length === 0) {
        cardContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            ${item.logo_url ? `<img src="${item.logo_url}" alt="Logo ${item.nome}" class="card-logo">` : ''}
            <h2>${item.nome}</h2>
            <p><strong>Categoria:</strong> ${item.categoria}</p>
            <p>${item.descricao}</p>
            <a href="${item.link}" target="_blank">Leia mais</a>
        `;
        cardContainer.appendChild(card);
    });
}

// Função para buscar os dados do arquivo JSON
async function fetchData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // Usar response.json() é mais direto para processar JSON
        allData = await response.json();

        renderCategoryFilters();
        applyFilters(); // Renderiza os cards iniciais
        errorMessage.textContent = ''; // Limpa mensagem de erro se houver
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
        errorMessage.textContent = 'Falha ao carregar os dados. Verifique se o arquivo data.json está correto e se você está usando um servidor local (Live Server).';
    }
}

// Função para criar e renderizar os botões de filtro de categoria
function renderCategoryFilters() {
    const categories = ['all', ...new Set(allData.map(item => item.categoria))];
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-button';
        button.textContent = category === 'all' ? 'Todas' : category;
        button.dataset.category = category;

        if (category === currentCategory) {
            button.classList.add('active'); // Marca o botão inicial como ativo
            activeCategoryButton = button; // Armazena a referência
        }

        categoryFiltersContainer.appendChild(button);
    });
}

// --- Lógica de Eventos ---

// Delegação de eventos para os filtros de categoria
categoryFiltersContainer.addEventListener('click', (event) => {
    const clickedButton = event.target.closest('.category-button');
    if (!clickedButton) return; // Sai se o clique não foi em um botão

    // Atualiza o estado da categoria e a aparência dos botões
    currentCategory = clickedButton.dataset.category;
    if (activeCategoryButton) activeCategoryButton.classList.remove('active');
    clickedButton.classList.add('active');
    activeCategoryButton = clickedButton;
    applyFilters();
});

// Função central para aplicar todos os filtros (categoria e busca)
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    let filteredData = allData;

    // 1. Filtra por categoria
    if (currentCategory !== 'all') {
        filteredData = filteredData.filter(item => item.categoria === currentCategory);
    }

    // 2. Filtra pelo termo da busca (aplicado sobre o resultado do filtro de categoria)
    if (searchTerm) {
        filteredData = filteredData.filter(item => 
            item.nome.toLowerCase().includes(searchTerm) || 
            item.descricao.toLowerCase().includes(searchTerm)
        );
    }

    renderCards(filteredData);
}

// Função Debounce: Atraso na execução de uma função para evitar chamadas excessivas
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// --- Event Listeners ---

// Busca dinâmica com debounce de 300ms
searchInput.addEventListener('input', debounce(applyFilters, 300));

// O botão de busca ainda pode ser útil para acessibilidade ou para quem prefere clicar
searchButton.addEventListener('click', applyFilters);


// --- Lógica para o Dark Mode ---

function initializeDarkMode() {
    const toggleButton = document.getElementById('dark-mode-toggle');
    const body = document.body;

    const updateButtonIcon = () => {
        if (body.classList.contains('dark-mode')) {
            toggleButton.textContent = '☀️'; // Mostra o sol no modo escuro
        } else {
            toggleButton.textContent = '🌙'; // Mostra a lua no modo claro
        }
    };

    toggleButton.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        // Salva a preferência do usuário no localStorage
        localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
        updateButtonIcon();
    });

    // Verifica a preferência salva ao carregar a página
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }
    updateButtonIcon(); // Define o ícone correto ao carregar a página
}

// --- Inicialização ---

function initializeApp() {
    fetchData();
    initializeDarkMode();
}

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp);