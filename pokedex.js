const pokedexContainer = document.getElementById('pokedex');
let currentIndex = 1;
const loadAmount = 10;
let firstLoad_name = true;
let currentPokemonId = null;


// fetch all efor filter by name
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
    // cheicking if this is the first load
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

// initial load
loadPokedexById();

// load for filter = name
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


const weaknesses = {
    fire: ['water', 'rock', 'dragon'],
    water: ['electric', 'grass'],
    grass: ['fire', 'flying', 'poison', 'bug', 'dragon', 'steel'],
    electric: ['ground'],
    ice: ['fire', 'fighting', 'rock', 'steel'],
    fighting: ['flying', 'psychic', 'fairy'],
    poison: ['ground', 'psychic'],
    ground: ['water', 'grass', 'ice'],
    flying: ['electric', 'ice', 'rock'],
    psychic: ['bug', 'ghost', 'dark'],
    bug: ['fire', 'flying', 'rock'],
    rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
    ghost: ['ghost', 'dark'],
    dragon: ['ice', 'dragon', 'fairy'],
    dark: ['fighting', 'bug', 'fairy'],
    steel: ['fire', 'fighting', 'ground'],
    fairy: ['poison', 'steel']
};

const getTypeWeaknesses = (types) => {

    let combinedWeaknesses = new Set();

    types.forEach(type => {
      
        if (weaknesses[type]) {
            weaknesses[type].forEach(weakness => {
                combinedWeaknesses.add(weakness);
            });
        } else {
            console.warn('Type not found in weaknesses:', type);
        }
    });

    return Array.from(combinedWeaknesses);
};


const displayPokemonDetails = (pokemon) => {
    currentPokemonId = pokemon.id; // Store the current Pokémon ID

    const detailsContainer = document.querySelector('#pokemon-details');
    detailsContainer.style.display = "block";
    const overlay = document.querySelector('#overlay');

    overlay.style.display = "block";
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
    const types = pokemon.types.map(type => type.type.name).join(', ');
    pokemonType.textContent = `Type: ${types}`;

    // Get weaknesses
    const pokemonWeaknesses = getTypeWeaknesses(pokemon.types.map(type => type.type.name));
    const weaknessesElement = document.createElement('p');
    weaknessesElement.textContent = `Weaknesses: ${pokemonWeaknesses.length > 0 ? pokemonWeaknesses.join(', ') : 'None'}`;

    const pokemonAbilities = document.createElement('p');
    pokemonAbilities.textContent = `Abilities: ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}`;

    const pokemonStats = document.createElement('ul');
    pokemon.stats.forEach(stat => {
        const statItem = document.createElement('li');
        statItem.textContent = `${stat.stat.name}: ${stat.base_stat}`;
        pokemonStats.appendChild(statItem);
    });
    const pokemonHeight = document.createElement('p');
    pokemonHeight.textContent = `Height: ${pokemon.height}`;
    const pokemonWeight = document.createElement('p');
    pokemonWeight.textContent = `Weight: ${pokemon.weight}`;

      // Create and append navigation buttons
      const slides = document.createElement('div');
      slides.className = 'slides';
  
      const previousButton = document.createElement('button');
      previousButton.id = 'previous-button';
      previousButton.innerHTML = '&#9664';
      previousButton.onclick = showPreviousPokemon;
  
      const nextButton = document.createElement('button');
      nextButton.id = 'next-button';
      nextButton.innerHTML = '&#9654';
      nextButton.onclick = showNextPokemon;
  
      slides.appendChild(previousButton);
      slides.appendChild(nextButton);

    pokemonDetails.appendChild(pokemonName);
    pokemonDetails.appendChild(pokemonId);
    pokemonDetails.appendChild(pokemonType);
    pokemonDetails.appendChild(weaknessesElement); // Append weaknesses
    pokemonDetails.appendChild(pokemonHeight);
    pokemonDetails.appendChild(pokemonWeight);
    pokemonDetails.appendChild(pokemonAbilities);
    pokemonDetails.appendChild(pokemonStats);
    pokemonDetails.appendChild(slides);

    detailsContainer.appendChild(pokemonDetails);

  

};



// Function to show the next Pokémon
const showNextPokemon = async () => {
    try {
        currentPokemonId++;
        const nextPokemon = await fetchPokemon(currentPokemonId);
        displayPokemonDetails(nextPokemon);
    } catch (error) {
        console.error('Error fetching next Pokémon:', error);
        currentPokemonId--; // Revert the ID if there was an error
    }
};

// Function to show the previous Pokémon
const showPreviousPokemon = async () => {
    if (currentPokemonId > 1) {
        try {
            currentPokemonId--;
            const previousPokemon = await fetchPokemon(currentPokemonId);
            displayPokemonDetails(previousPokemon);
        } catch (error) {
            console.error('Error fetching previous Pokémon:', error);
            currentPokemonId++; // Revert the ID if there was an error
        }
    }
};


const closeOverlay = () =>{
  overlay.style.display = "none"
    document.querySelector('.pokemon-details').style.display = "none"
}