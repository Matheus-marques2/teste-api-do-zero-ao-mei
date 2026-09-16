document.addEventListener('DOMContentLoaded', () => {
  // Inicializa a substituição das tags <i data-lucide="..."> por <svg>
  lucide.createIcons();

  // Funcionalidade de filtro na barra de pesquisa
  const searchInput = document.getElementById('searchInput');
  const faqItems = document.querySelectorAll('.faq-item');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();

      faqItems.forEach((item) => {
        const text = item.textContent.toLowerCase();
        if (text.includes(term)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
});