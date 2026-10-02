const grid = document.getElementById('pokemonGrid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageInfo = document.getElementById('pageInfo');
const pagination = document.getElementById('pagination');

const PAGE_SIZE = 20;
let offset = 0;
let allPokemon = [];

async function fetchPage(off) {
    loading.classList.remove('hidden');
    grid.innerHTML = '';
    noResults.classList.add('hidden');

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${off}`);
    const data = await res.json();

    allPokemon = await Promise.all(
        data.results.map(p => fetch(p.url).then(r => r.json()))
    );

    loading.classList.add('hidden');
    renderCards(allPokemon);
    updatePagination(data.count);
}

function renderCards(list) {
    grid.innerHTML = '';
    noResults.classList.toggle('hidden', list.length > 0);

    list.forEach(p => {
        const img = p.sprites.other['official-artwork'].front_default
            || p.sprites.front_default
            || 'https://placehold.co/120x120?text=?';

        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <img src="${img}" alt="${p.name}">
            <h2>#${p.id} ${p.name}</h2>
            <button>Show Ability</button>
            <p class="ability"></p>
        `;

        card.querySelector('button').addEventListener('click', () => {
            const ability = p.abilities[0].ability.name;
            card.querySelector('.ability').textContent =
                `I am ${p.name} and I have ${ability}.`;
        });

        grid.appendChild(card);
    });
}

function updatePagination(total) {
    const page = Math.floor(offset / PAGE_SIZE) + 1;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    pageInfo.textContent = `Page ${page} of ${totalPages}`;
    prevBtn.disabled = offset === 0;
    nextBtn.disabled = offset + PAGE_SIZE >= total;
}

searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q) {
        pagination.classList.add('hidden');
        renderCards(allPokemon.filter(p => p.name.includes(q)));
    } else {
        pagination.classList.remove('hidden');
        renderCards(allPokemon);
    }
});

prevBtn.addEventListener('click', () => { offset -= PAGE_SIZE; fetchPage(offset); });
nextBtn.addEventListener('click', () => { offset += PAGE_SIZE; fetchPage(offset); });

fetchPage(0);
