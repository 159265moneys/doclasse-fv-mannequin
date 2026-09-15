# DoCLASSE FV マネキン差し替え

- **[操作できる見本](https://159265moneys.github.io/doclasse-fv-mannequin/)**
- **[差し替え用ZIP](https://github.com/159265moneys/doclasse-fv-mannequin/releases/latest/download/doclasse-fv-mannequin.zip)**
- **[相手のCodexへの指示](./CODEX_HANDOFF.md)**

FVのマネキンだけを差し替える部品です。

## 操作

マネキンはゆっくり回転を続けます。**マウスを動かすと本体とカメラが追従し、ホイールでスクロールすると回転しながら拡大、リボンが外側へほどけます。** 上にスクロールすると戻ります。

公開中の元サイトから入力処理・ScrollTrigger・カメラ更新・リボンの頂点計算を確認し、その式を移植しています。[照合方法と検証](./MOTION_SOURCE.md)。

## 画質と表示方式

承認済みのBlenderモデルを、実際に操作できるGLBとして書き出しています。布は4096pxのCycles描画を表面に焼き込み、縫製・木・金属の形状を保持。木目などの素材もベイクしています。ブラウザではThree.jsで立体・カメラ・リボンを動かします。布の照明はベイク済みで、ブラウザでCyclesを実行する方式ではありません。

## 差し替え

1. `public/mannequin/` を対象サイトにコピー。
2. `integration/` をまとめてコピーし、古いFVレンダラーだけを `HeroMannequin` に差し替え。
3. 既存の `heroState.scroll` / `runtime.pointer` / `onReady` を接続。Lenis・GSAP・本文・他セクションは維持。

詳細は **CODEX_HANDOFF.md** をCodexに読ませてください。

## 開発・検証（GitHubリポジトリをcloneした場合）

```sh
npm ci
npm test
npm run build
npm run dev
```

見本はFVだけなので、操作確認用の空のスクロール領域があります。クライアントサイトにはコピーしません。クライアントの公開URL自体は変更していません。

- 原本: `blender/doclasse-cycles-final.blend`（テクスチャ内包）
- ベイク・書き出し: `tools/export_interactive.py`
- 静止画レンダリング: `tools/render_from_master.py`
- 素材: [Hessian 380](https://polyhaven.com/a/hessian_380)、[Walnut](https://polyhaven.com/a/american_walnut_veneer)、[Crepe satin](https://polyhaven.com/a/crepe_satin) — [Poly Haven CC0](https://polyhaven.com/license)

参考サイトの文章・ロゴ・CSSはFV確認用です。差し替え部品はそれらを上書きしません。
