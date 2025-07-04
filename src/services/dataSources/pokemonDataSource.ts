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
const POKEMON_IDS = [658,493,151,25,700,649,384,718,6,648,150,133,385,491,448,719,720,647,494,490,643,382,646,81,492,717,487,249,383,483,702,567,644,245,94,250,716,282,251,393,484,445,486,482,257,645,471,380,39,386,498,143,144,359,381,570,132,656,149,634,254,145,470,373,330,196,146,810,172,392,26,376,657,488,9,197,587,24,350,131,260,52,12,303,198,461,604,566,1,348,129,609,255,641,136,137,650,243,68,258];

// ポケモンIDと日本語名のマッピング
const JAPANESE_NAMES: Record<number, string> = {
658: 'ゲッコウガ', 
493: 'アルセウス', 
151: 'ミュウ', 
25: 'ピカチュウ', 
700: 'ニンフィア', 
649: 'ゲノセクト', 
384: 'レックウザ', 
718: 'ジガルデ', 
6: 'リザードン', 
648: 'メロエッタ', 
150: 'ミュウツー', 
133: 'イーブイ', 
385: 'ジラーチ', 
491: 'ダークライ', 
448: 'ルカリオ', 
719: 'ディアンシー', 
720: 'フーパ', 
647: 'ケルディオ', 
494: 'ビクティニ', 
490: 'マナフィ', 
643: 'レシラム', 
382: 'カイオーガ', 
646: 'キュレム', 
81: 'コイル', 
492: 'シェイミ', 
717: 'イベルタル', 
487: 'ギラティナ', 
249: 'ルギア', 
383: 'グラードン', 
483: 'ディアルガ', 
702: 'デデンネ', 
567: 'アーケオス', 
644: 'ゼクロム', 
245: 'スイクン', 
94: 'ゲンガー', 
250: 'ホウオウ', 
716: 'ゼルネアス', 
282: 'サーナイト', 
251: 'セレビィ', 
393: 'ポッチャマ', 
484: 'パルキア', 
445: 'ガブリアス', 
486: 'レジギガス', 
482: 'アグノム', 
257: 'バシャーモ', 
645: 'ランドロス', 
471: 'グレイシア', 
380: 'ラティアス', 
39: 'プリン', 
386: 'デオキシス', 
498: 'ミジュマル', 
143: 'カビゴン', 
144: 'フリーザー', 
359: 'アブソル', 
381: 'ラティオス', 
570: 'ゾロアーク', 
132: 'メタモン', 
656: 'フォッコ', 
149: 'カイリュー', 
634: 'サザンドラ', 
254: 'ジュカイン', 
145: 'サンダー', 
470: 'リーフィア', 
373: 'ボーマンダ', 
330: 'フライゴン', 
196: 'エーフィ', 
146: 'ファイヤー', 
810: 'ヌメラ', 
172: 'ピチュー', 
392: 'ゴウカザル', 
26: 'ライチュウ', 
376: 'メタグロス', 
657: 'ケロマツ', 
488: 'クレセリア', 
9: 'カメックス', 
197: 'ブラッキー', 
587: 'エモンガ', 
24: 'アーボック', 
350: 'ミロカロス', 
131: 'ラプラス', 
260: 'ラグラージ', 
52: 'ニャース', 
12: 'アゲハント', 
303: 'クチート', 
198: 'オンバーン', 
461: 'レントラー', 
604: 'デンリュウ', 
566: 'アーケン', 
1: 'フシギダネ', 
348: 'アーマルド', 
129: 'コイキング', 
609: 'シャンデラ', 
255: 'アチャモ', 
641: 'ボルトロス', 
136: 'ブースター', 
137: 'ポリゴン', 
650: 'ハリマロン', 
243: 'ライコウ', 
68: 'カイリキー', 
258: 'ミズゴロウ'
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
    
    // 画像URLの取得（優先順位: official-artwork > front_default > エラー）
    const sprite = data.sprites.other?.['official-artwork']?.front_default ||
                   data.sprites.front_default;
    
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
    // 同期的な実装として、事前定義されたポケモンリストを返す（高解像度画像を使用）
    return POKEMON_IDS.map(id => ({
      id: `pokemon-${id}`,
      name: JAPANESE_NAMES[id] || `Pokemon ${id}`,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      source: 'pokemon'
    }));
  }
};