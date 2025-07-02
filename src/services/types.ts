// キャラクターの基本情報を表すインターフェース
export interface Character {
  id: string;        // キャラクターのID
  name: string;      // キャラクターの名前
  image: string;     // キャラクターの画像URL
  source: string;    // データソース（animals, shapes, pokemon等）
}

// データソースの設定
export interface DataSource {
  name: string;
  description: string;
  getRandomCharacter: () => Promise<Character>;
  getAllCharacters: () => Character[];
}