// 型定義をインポート
export type { Character, DataSource } from './types';
import type { Character, DataSource } from './types';

// ポケモンデータソースを静的importで読み込み
import { pokemonDataSource } from './dataSources/pokemonDataSource';

// 著作権フリーの動物キャラクター
const ANIMAL_CHARACTERS: Character[] = [
  { id: 'cat', name: 'ねこ', image: '🐱', source: 'animals' },
  { id: 'dog', name: 'いぬ', image: '🐶', source: 'animals' },
  { id: 'rabbit', name: 'うさぎ', image: '🐰', source: 'animals' },
  { id: 'bear', name: 'くま', image: '🐻', source: 'animals' },
  { id: 'fox', name: 'きつね', image: '🦊', source: 'animals' },
  { id: 'lion', name: 'らいおん', image: '🦁', source: 'animals' },
  { id: 'elephant', name: 'ぞう', image: '🐘', source: 'animals' },
  { id: 'panda', name: 'ぱんだ', image: '🐼', source: 'animals' }
];

// 基本図形
const SHAPE_CHARACTERS: Character[] = [
  { id: 'circle', name: 'まる', image: '⭕', source: 'shapes' },
  { id: 'triangle', name: 'さんかく', image: '🔺', source: 'shapes' },
  { id: 'square', name: 'しかく', image: '⬜', source: 'shapes' },
  { id: 'star', name: 'ほし', image: '⭐', source: 'shapes' },
  { id: 'heart', name: 'はーと', image: '❤️', source: 'shapes' },
  { id: 'diamond', name: 'だいや', image: '💎', source: 'shapes' }
];

// データソースの実装
const animalSource: DataSource = {
  name: 'animals',
  description: '動物キャラクター',
  getRandomCharacter: async () => {
    const randomIndex = Math.floor(Math.random() * ANIMAL_CHARACTERS.length);
    return ANIMAL_CHARACTERS[randomIndex];
  },
  getAllCharacters: () => [...ANIMAL_CHARACTERS]
};

const shapeSource: DataSource = {
  name: 'shapes', 
  description: '基本図形',
  getRandomCharacter: async () => {
    const randomIndex = Math.floor(Math.random() * SHAPE_CHARACTERS.length);
    return SHAPE_CHARACTERS[randomIndex];
  },
  getAllCharacters: () => [...SHAPE_CHARACTERS]
};

// 利用可能なデータソース
export const DATA_SOURCES: Record<string, DataSource> = {
  animals: animalSource,
  shapes: shapeSource,
  pokemon: pokemonDataSource
};


// デフォルトのデータソース
let currentDataSource: DataSource = animalSource;

/**
 * データソースを設定する
 * @param sourceName データソース名
 */
export const setDataSource = (sourceName: string): void => {
  if (DATA_SOURCES[sourceName]) {
    currentDataSource = DATA_SOURCES[sourceName];
  }
};

/**
 * 現在のデータソースからランダムなキャラクターを取得する
 * @returns キャラクターの情報
 */
export const getRandomCharacter = async (): Promise<Character> => {
  return currentDataSource.getRandomCharacter();
};

/**
 * 現在のデータソースの全キャラクターを取得する
 * @returns キャラクターの配列
 */
export const getAllCharacters = (): Character[] => {
  return currentDataSource.getAllCharacters();
};

/**
 * 利用可能なデータソースの一覧を取得する
 * @returns データソースの配列
 */
export const getAvailableDataSources = (): DataSource[] => {
  return Object.values(DATA_SOURCES);
};

