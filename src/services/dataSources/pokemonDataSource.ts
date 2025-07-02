/**
 * ポケモンデータソース
 * 
 * ⚠️ 著作権に関する注意:
 * - ポケモンの名前・画像は株式会社ポケモン/任天堂の著作物です
 * - このファイルは教育目的のデモンストレーションとして提供されています
 * - 商用利用には適切なライセンス取得が必要です
 * - 本ファイルを削除することで、ポケモン関連機能を完全に除去できます
 */

import type { Character, DataSource } from '../types';

// PokéAPIのレスポンス型定義
interface PokemonApiResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
}

// 子供に人気のポケモンIDリスト
const POKEMON_IDS = [1, 4, 7, 25, 52, 104, 131, 143, 150];

// ポケモンIDと日本語名のマッピング
const JAPANESE_NAMES: Record<number, string> = {
  1: 'フシギダネ',    // Bulbasaur
  4: 'ヒトカゲ',      // Charmander
  7: 'ゼニガメ',      // Squirtle
  25: 'ピカチュウ',    // Pikachu
  52: 'ニャース',     // Meowth
  104: 'カラカラ',    // Cubone
  131: 'ラプラス',    // Lapras
  143: 'カビゴン',    // Snorlax
  150: 'ミュウツー'   // Mewtwo
};

/**
 * PokéAPIからポケモンデータを取得する
 * @param id ポケモンのID
 * @returns ポケモンの情報（日本語名、画像URL含む）
 */
const fetchPokemon = async (id: number): Promise<Character> => {
  try {
    // PokéAPIからデータを取得
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`ポケモンID ${id} が見つかりません`);
      }
      if (response.status >= 500) {
        throw new Error('サーバーエラーが発生しました。しばらく待ってから再試行してください');
      }
      throw new Error(`API エラー: ${response.status}`);
    }
    const data: PokemonApiResponse = await response.json();
    
    // 画像URLの取得（優先順位: front_default > official-artwork > エラー）
    const sprite = data.sprites.front_default || 
                   data.sprites.other?.['official-artwork']?.front_default;
    
    if (!sprite) {
      throw new Error(`ポケモンID ${id} の画像が見つかりません`);
    }

    return {
      id: `pokemon-${data.id}`,
      // 日本語名がマッピングにあれば使用、なければAPIの名前を使用
      name: JAPANESE_NAMES[id] || data.name,
      image: sprite,
      source: 'pokemon'
    };
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    
    // ネットワークエラーの場合
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('インターネット接続を確認してください');
    }
    
    // すでにカスタムエラーメッセージがある場合はそのまま
    if (error instanceof Error) {
      throw error;
    }
    
    // 予期しないエラーの場合
    throw new Error('予期しないエラーが発生しました');
  }
};

/**
 * ランダムなポケモンIDを取得する
 * @returns 子供向けポケモンリストからランダムに選択されたID
 */
const getRandomPokemonId = (): number => {
  return POKEMON_IDS[Math.floor(Math.random() * POKEMON_IDS.length)];
};

// ポケモンデータソースの実装
export const pokemonDataSource: DataSource = {
  name: 'pokemon',
  description: 'ポケモンキャラクター',
  getRandomCharacter: async () => {
    const pokemonId = getRandomPokemonId();
    return fetchPokemon(pokemonId);
  },
  getAllCharacters: () => {
    // 同期的な実装として、事前定義されたポケモンリストを返す
    return POKEMON_IDS.map(id => ({
      id: `pokemon-${id}`,
      name: JAPANESE_NAMES[id] || `Pokemon ${id}`,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      source: 'pokemon'
    }));
  }
};