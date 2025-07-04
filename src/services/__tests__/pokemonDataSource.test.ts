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
      // Mock Math.random to select a known Pokemon ID
      Math.random = jest.fn(() => 0.0);
    
      const mockPokemonData = {
        id: 658,
        name: 'greninja',
        sprites: {
          front_default: 'https://example.com/greninja.png'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonData
      });

      const result = await pokemonDataSource.getRandomCharacter();

      expect(result).toEqual({
        id: 'pokemon-658',
        name: 'ゲッコウガ',
        image: 'https://example.com/greninja.png',
        source: 'pokemon'
      });
    });

    it('should use official artwork if front_default is not available', async () => {
      // Mock Math.random to select first Pokemon ID (658)
      Math.random = jest.fn(() => 0.0);
      
      const mockPokemonData = {
        id: 658,
        name: 'greninja',
        sprites: {
          front_default: null,
          other: {
            'official-artwork': {
              front_default: 'https://example.com/greninja-artwork.png'
            }
          }
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonData
      });

      const result = await pokemonDataSource.getRandomCharacter();

      expect(result.image).toBe('https://example.com/greninja-artwork.png');
      expect(result.name).toBe('ゲッコウガ');
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
      expect(names).toContain('リザードン');
    });
  });

  describe('data source properties', () => {
    it('should have correct name and description', () => {
      expect(pokemonDataSource.name).toBe('pokemon');
      expect(pokemonDataSource.description).toBe('ポケモンキャラクター');
    });
  });
});