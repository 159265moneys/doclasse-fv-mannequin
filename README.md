# DoCLASSE FV マネキン差し替え

- **[GitHub Pages 見本](https://159265moneys.github.io/doclasse-fv-mannequin/)**
- **[差し替え用ZIP](https://github.com/159265moneys/doclasse-fv-mannequin/releases/latest/download/doclasse-fv-mannequin.zip)**
- **[相手のCodexへの差し替え指示](./CODEX_HANDOFF.md)**

既存FVのマネキン部分だけを差し替える部品です。本文・ヘッダー・ボタン・他セクションの変更は不要です。

## 今回の表示方式

Blender Cyclesでレンダリングした**背景透過のWebP**を表示します。布の織り目、実際の糸形状、縫い目のへこみ、木目、金属の微細な粗さ、間接光は画像に含まれます。ブラウザ側でマテリアルを簡略化して再描画しません。

PCでは、同じCyclesシーンを9方向から撮影した画像を切り替え、ポインターに合わせてわずかに向きが変わります。自由回転のリアルタイム3Dではありません。スマートフォン、動きを減らす設定、データセーバーでは1枚の高画質画像を表示します。

## Next.js / Reactで差し替える

1. `public/mannequin/` を既存プロジェクトの `public/mannequin/` にコピー。
2. `integration/` 内の4ファイルを既存のコンポーネントディレクトリへコピー。
3. FV内の古い3Dコンポーネント（既存サイトでは `Hero3D` 相当）だけを `<HeroMannequin />` に変更。

```tsx
import HeroMannequin from "./HeroMannequin";

<section className="hero">
  <HeroMannequin />
  {/* 既存の hero__grain、hero__inner、hero__foot はそのまま */}
</section>
```

- `hero.css` は `.mannequin-*` のみに適用されます。
- 既存のFVコンテナには `position: relative` が必要です。参照サイトの `.hero` はすでに設定されています。
- 元の3Dコンポーネントは置き換えてください。両方を同時にマウントする必要はありません。
- 別の設置先には `<HeroMannequin assetBase="/assets/mannequin" />` を指定できます。

## HTMLへの組み込み

```html
<link rel="stylesheet" href="/mannequin/hero.css">
<!-- 既存FVの中に追加（元のマネキン描画部分と置き換え） -->
<div id="mannequin-fv" style="position:absolute;inset:0" aria-hidden="true"></div>
<script type="module">
  import { mountMannequin } from "/mannequin/mannequin.js";
  const dispose = mountMannequin(document.getElementById("mannequin-fv"));
  // ページを破棄するときは dispose() を呼びます。
</script>
```

## 確認

```sh
npm install
npm run dev
```

[http://localhost:4173](http://localhost:4173) はFVのみの確認ページです。公開ページから取得したヘッダー・FVの文章・CSSを参考表示しています。下層ページや応募フォームをこのプレビュー内で作り直したものではありません。クライアントの公開サイトは変更していません。GitHub PagesにFVだけの見本を公開しています。

## Blenderデータ

- `blender/doclasse-cycles-final.blend` — 最終版。テクスチャ・照明・カメラを内包。
- `public/mannequin/cycles-mannequin.webp` — 背景透過の表示用画像。
- `public/mannequin/views/` — PCの微細な向きの変化用、9視点。
- `tools/render_from_master.py` — 最終版Blenderファイルからの再レンダリング。
- 高解像度PNGと質感の拡大画像はReleaseのZIPに同梱。

実行環境はBlender 5.2。CPU Cyclesでレンダリングしています。`npm run build` は組み込み用の小さな表示スクリプトだけをビルドします。

## 素材

人体トルソー、台座、縫製、リボンの形状はこの作業で制作。布・木のマテリアルには以下のCC0撮影素材を使用しています。

- [Hessian 380 — Poly Haven](https://polyhaven.com/a/hessian_380)
- [American Walnut Veneer — Poly Haven](https://polyhaven.com/a/american_walnut_veneer)
- [Crepe Satin — Poly Haven](https://polyhaven.com/a/crepe_satin)
- [Poly Havenのライセンス](https://polyhaven.com/license)

参考サイトの文章・ロゴ・書体・CSSは、今回のFV差し替えを確認するための参照データです。差し替え部品はそれらを上書きしません。
