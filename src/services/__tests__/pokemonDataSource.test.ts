import { pokemonDataSource } from '../dataSources/pokemonDataSource';

// Mock fetch
global.fetch = jest.fn();

// Mock Math.random to control which Pokemon ID is selected
const originalMathRandom = Math.random;

describe('Pokemon Data Source', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    Math.random = originalMathRandom;
  });

  describe('getRandomCharacter', () => {
    it('should return Pokemon character with correct structure', async () => {
      // Mock Math.random to select ID 52 (ニャース) - index 4 in POKEMON_IDS array
      Math.random = jest.fn(() => 0.5); // 0.5 * 9 = 4.5 -> floor(4.5) = 4 -> POKEMON_IDS[4] = 52
    
      const mockPokemonData = {
        id: 52,
        name: 'meowth',
        sprites: {
          front_default: 'https://example.com/meowth.png'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonData
      });

      const result = await pokemonDataSource.getRandomCharacter();

      expect(result).toEqual({
        id: 'pokemon-52',
        name: 'ニャース',
        image: 'https://example.com/meowth.png',
        source: 'pokemon'
      });
    });

    it('should use official artwork if front_default is not available', async () => {
      // Mock Math.random to select ID 1 (フシギダネ) - index 0 in POKEMON_IDS array
      Math.random = jest.fn(() => 0.05); // 0.05 * 9 = 0.45 -> floor(0.45) = 0 -> POKEMON_IDS[0] = 1
      
      const mockPokemonData = {
        id: 1,
        name: 'bulbasaur',
        sprites: {
          front_default: null,
          other: {
            'official-artwork': {
              front_default: 'https://example.com/bulbasaur-artwork.png'
            }
          }
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonData
      });

      const result = await pokemonDataSource.getRandomCharacter();

      expect(result.image).toBe('https://example.com/bulbasaur-artwork.png');
      expect(result.name).toBe('フシギダネ');
    });

    it('should handle API errors properly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(pokemonDataSource.getRandomCharacter()).rejects.toThrow('ポケモンID');
    });

    it('should handle network errors properly', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new TypeError('fetch failed'));

      await expect(pokemonDataSource.getRandomCharacter()).rejects.toThrow('インターネット接続を確認してください');
    });
  });

  describe('getAllCharacters', () => {
    it('should return array of Pokemon characters', () => {
      const characters = pokemonDataSource.getAllCharacters();

      expect(Array.isArray(characters)).toBe(true);
      expect(characters.length).toBeGreaterThan(0);
      
      characters.forEach(character => {
        expect(character).toHaveProperty('id');
        expect(character).toHaveProperty('name');
        expect(character).toHaveProperty('image');
        expect(character).toHaveProperty('source');
        expect(character.source).toBe('pokemon');
        expect(character.id).toMatch(/^pokemon-\d+$/);
      });
    });

    it('should include popular Pokemon', () => {
      const characters = pokemonDataSource.getAllCharacters();
      const names = characters.map(c => c.name);

      expect(names).toContain('ピカチュウ');
      expect(names).toContain('フシギダネ');
      expect(names).toContain('ヒトカゲ');
    });
  });

  describe('data source properties', () => {
    it('should have correct name and description', () => {
      expect(pokemonDataSource.name).toBe('pokemon');
      expect(pokemonDataSource.description).toBe('ポケモンキャラクター');
    });
  });
});