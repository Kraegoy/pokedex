const pokedexContainer = document.getElementById('pokedex');
let currentIndex = 1;
const loadAmount = 10;
let firstLoad_name = true;

const fetchAllPokemons = async () => {
    // Fetch the Pokémon count
    const countResponse = await fetch('https://pokeapi.co/api/v2/pokemon');
    const countData = await countResponse.json();
    const pokemonCount = countData.count;

    // Fetch all Pokémon with the limit set to the count
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${pokemonCount}`;
    const res = await fetch(url);
    const allPokemonsData = await res.json();

    // Extract Pokémon names and URLs
    const pokemons = allPokemonsData.results;

    // Sort Pokémon by name
    pokemons.sort((a, b) => a.name.localeCompare(b.name));

    return pokemons;
};

console.log(fetchAllPokemons())

const fetchPokemon = async (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const res = await fetch(url);
    const pokemon = await res.json();
    return pokemon;
};


const createPokemonCard = (pokemon) => {
    const pokemonCard = document.createElement('div');
    pokemonCard.className = 'pokemon-card';
    pokemoniD = String(pokemon.id).padStart(3, '0');

    const pokemonImage = document.createElement('img');
    pokemonImage.src = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokemoniD}.png`;
    pokemonImage.alt = pokemon.name;

    const pokemonName = document.createElement('h3');
    pokemonName.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const pokemonIdText = document.createElement('h4');
    pokemonIdText.textContent = pokemoniD;

    const pokemonType = document.createElement('p');
    pokemonType.textContent = `Type: ${pokemon.types.map(type => type.type.name).join(', ')}`;

    pokemonCard.appendChild(pokemonImage);
    pokemonCard.appendChild(pokemonIdText);
    pokemonCard.appendChild(pokemonName);
    pokemonCard.appendChild(pokemonType);

    // Add event listener to the card
    pokemonCard.addEventListener('click', () => {
        displayPokemonDetails(pokemon);
    });

    pokedexContainer.appendChild(pokemonCard);
};

const loadPokedexById = async () => {
    if(!firstLoad_name){
        const pokedexContainer = document.getElementById('pokedex');
        const existingCards = pokedexContainer.querySelectorAll('.pokemon-card');
        existingCards.forEach(card => card.remove());
        firstLoad_name = true;
        currentIndex = 1;
    }

    const promises = [];
    for (let i = currentIndex; i < currentIndex + loadAmount; i++) {
        promises.push(fetchPokemon(i));
    }
    const pokemons = await Promise.all(promises); 
    pokemons.forEach(pokemon => createPokemonCard(pokemon));
    currentIndex += loadAmount;
};
loadPokedexById();

const loadPokedexByName = async () => {
    if(firstLoad_name){
        const pokedexContainer = document.getElementById('pokedex');
        const existingCards = pokedexContainer.querySelectorAll('.pokemon-card');
        existingCards.forEach(card => card.remove());
        firstLoad_name = false;
        currentIndex = 1;
    }

    try {  

        const allPokemons = await fetchAllPokemons();
        // Limit the list based on currentIndex and loadAmount
        const limitedPokemons = allPokemons.slice(currentIndex, currentIndex + loadAmount);

        // Process each Pokémon
        const promises = limitedPokemons.map(async (pokemon) => {
            const url_name = `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`;
            const res_name = await fetch(url_name);
            return res_name.json();
        });

        // Wait for all promises to resolve
        const pokemons = await Promise.all(promises);

        // Create cards for each Pokémon
        pokemons.forEach(pokemon => createPokemonCard(pokemon));

        // Update the current index
        currentIndex += loadAmount;

        console.log("Pokédex loaded and cards created.");
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
};



const loadMore = () => {
    const selectedFilter = document.querySelector('input[name="filter"]:checked').value;
    console.log(selectedFilter)

    if(selectedFilter == 'name'){
        loadPokedexByName()
    }
    else{
        loadPokedexById();
    }
};



const searchPokemon = async () => {
    const query = document.getElementById('search').value.toLowerCase();
    const url = `https://pokeapi.co/api/v2/pokemon/${query}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Pokémon not found');
        const data = await response.json();
        document.getElementById('pokedex').innerHTML = ''; // Clear current list
        createPokemonCard(data);
    } catch (error) {
        document.getElementById('pokedex').innerHTML = `<p>${error.message}</p>`;
    }
};




// Function to display Pokémon details
const displayPokemonDetails = (pokemon) => {
    const detailsContainer = document.querySelector('#pokemon-details'); 
    const overlay = document.querySelector('#overlay'); 

    overlay.style.display = "block"
    // Clear previous details
    detailsContainer.innerHTML = '';

    // Create and append elements to show details
    const pokemonDetails = document.createElement('div');
    pokemonDetails.className = 'pokemon-details';

    const pokemonName = document.createElement('h2');
    pokemonName.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const pokemonId = document.createElement('p');
    pokemonId.textContent = `ID: ${String(pokemon.id).padStart(3, '0')}`;

    const pokemonType = document.createElement('p');
    pokemonType.textContent = `Type: ${pokemon.types.map(type => type.type.name).join(', ')}`;

    const pokemonAbilities = document.createElement('p');
    pokemonAbilities.textContent = `Abilities: ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}`;

    const pokemonStats = document.createElement('ul');
    pokemon.stats.forEach(stat => {
        const statItem = document.createElement('li');
        statItem.textContent = `${stat.stat.name}: ${stat.base_stat}`;
        pokemonStats.appendChild(statItem);
    });
    const pokemonHeight = document.createElement('p');
    pokemonHeight.textContent = `Height: ${pokemon.height}`
    const pokemonWeight = document.createElement('p');
    pokemonWeight.textContent = `Weight: ${pokemon.weight}`

    pokemonDetails.appendChild(pokemonName);
    pokemonDetails.appendChild(pokemonId);
    pokemonDetails.appendChild(pokemonType);
    pokemonDetails.appendChild(pokemonHeight);
    pokemonDetails.appendChild(pokemonWeight);
    pokemonDetails.appendChild(pokemonAbilities);
    pokemonDetails.appendChild(pokemonStats);

    detailsContainer.appendChild(pokemonDetails);
};

function closeOverlay(){
    overlay.style.display = "none"
    document.querySelector('.pokemon-details').style.display = "none"

}
const filterByName =() => {


}

