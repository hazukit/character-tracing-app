import { 
  getRandomCharacter, 
  getAllCharacters, 
  getAvailableDataSources, 
  setDataSource,
  DATA_SOURCES 
} from '../characterApi';

describe('Character API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableDataSources', () => {
    it('should return available data sources', () => {
      const sources = getAvailableDataSources();
      
      expect(Array.isArray(sources)).toBe(true);
      expect(sources.length).toBeGreaterThan(0);
      
      // Check for default sources
      const sourceNames = sources.map(s => s.name);
      expect(sourceNames).toContain('animals');
      expect(sourceNames).toContain('shapes');
      expect(sourceNames).toContain('pokemon');
    });

    it('should return data sources with correct structure', () => {
      const sources = getAvailableDataSources();
      
      sources.forEach(source => {
        expect(source).toHaveProperty('name');
        expect(source).toHaveProperty('description');
        expect(source).toHaveProperty('getRandomCharacter');
        expect(source).toHaveProperty('getAllCharacters');
        expect(typeof source.getRandomCharacter).toBe('function');
        expect(typeof source.getAllCharacters).toBe('function');
      });
    });
  });

  describe('getRandomCharacter', () => {
    it('should return a character from animals data source', async () => {
      setDataSource('animals');
      const character = await getRandomCharacter();
      
      expect(character).toHaveProperty('id');
      expect(character).toHaveProperty('name');
      expect(character).toHaveProperty('image');
      expect(character).toHaveProperty('source');
      expect(character.source).toBe('animals');
      expect(typeof character.name).toBe('string');
      expect(typeof character.image).toBe('string');
    });

    it('should return a character from shapes data source', async () => {
      setDataSource('shapes');
      const character = await getRandomCharacter();
      
      expect(character).toHaveProperty('id');
      expect(character).toHaveProperty('name');
      expect(character).toHaveProperty('image');
      expect(character).toHaveProperty('source');
      expect(character.source).toBe('shapes');
    });

    it('should return different characters on multiple calls', async () => {
      setDataSource('animals');
      const characters = new Set();
      
      for (let i = 0; i < 10; i++) {
        const character = await getRandomCharacter();
        characters.add(character.id);
      }
      
      // With multiple animals, we should get some variety
      expect(characters.size).toBeGreaterThan(1);
    });
  });

  describe('getAllCharacters', () => {
    it('should return all animals characters', () => {
      setDataSource('animals');
      const characters = getAllCharacters();
      
      expect(Array.isArray(characters)).toBe(true);
      expect(characters.length).toBeGreaterThan(0);
      expect(characters.every(c => c.source === 'animals')).toBe(true);
    });

    it('should return all shapes characters', () => {
      setDataSource('shapes');
      const characters = getAllCharacters();
      
      expect(Array.isArray(characters)).toBe(true);
      expect(characters.length).toBeGreaterThan(0);
      expect(characters.every(c => c.source === 'shapes')).toBe(true);
    });

    it('should return characters with correct structure', () => {
      setDataSource('animals');
      const characters = getAllCharacters();
      
      characters.forEach(character => {
        expect(character).toHaveProperty('id');
        expect(character).toHaveProperty('name');
        expect(character).toHaveProperty('image');
        expect(character).toHaveProperty('source');
        expect(typeof character.id).toBe('string');
        expect(typeof character.name).toBe('string');
        expect(typeof character.image).toBe('string');
        expect(typeof character.source).toBe('string');
      });
    });
  });

  describe('setDataSource', () => {
    it('should change current data source', async () => {
      // Start with animals
      setDataSource('animals');
      const animalCharacter = await getRandomCharacter();
      expect(animalCharacter.source).toBe('animals');
      
      // Switch to shapes
      setDataSource('shapes');
      const shapeCharacter = await getRandomCharacter();
      expect(shapeCharacter.source).toBe('shapes');
    });

    it('should handle invalid data source gracefully', () => {
      const originalSource = 'animals';
      setDataSource(originalSource);
      
      // Try to set invalid source
      setDataSource('invalid-source');
      
      // Should still work with original source
      expect(() => getAllCharacters()).not.toThrow();
    });
  });

  describe('DATA_SOURCES', () => {
    it('should contain default data sources', () => {
      expect(DATA_SOURCES).toHaveProperty('animals');
      expect(DATA_SOURCES).toHaveProperty('shapes');
      expect(DATA_SOURCES).toHaveProperty('pokemon');
    });

    it('should have valid data source structure', () => {
      Object.values(DATA_SOURCES).forEach(source => {
        expect(source).toHaveProperty('name');
        expect(source).toHaveProperty('description');
        expect(source).toHaveProperty('getRandomCharacter');
        expect(source).toHaveProperty('getAllCharacters');
      });
    });
  });
});