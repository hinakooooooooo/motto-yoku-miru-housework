# もっとよくみる｜家事をする

「大変よく頑張りました展」の3Dインタラクティブ展示（家事版）。

人の小さな行動を虫眼鏡で探し、3Dの小さな世界とメダルを発見する体験です。**8つの発見ルート**を収録しています。

## サイトを開く

- **GitHub Pagesで公開したとき:** リポジトリのトップ（`index.html`）から `dist/index.html` に移動します。
- **ローカルで動作確認:** このフォルダで `python3 -m http.server 8000` を実行し、ブラウザで `http://localhost:8000/` を開きます。
- **ネット接続なし・単独HTML:** `dist/experience.html` をブラウザで開けます。ただしブラウザの設定により一部の機能が制限される場合があるため、展示本番はHTTPサーバー経由での確認もおすすめします。

## GitHubへアップロードする方法

1. GitHubで `motto-yoku-miru-housework` などの新しいリポジトリを作成します。
2. このZIPを**解凍**して、中身のファイルと `dist/` フォルダをリポジトリの**最上位**にアップロードします（ZIPそのものを置くのではありません）。
3. GitHubの **Settings → Pages** から、Source: **Deploy from a branch**、Branch: `main`、Folder: `/ (root)` を選んで保存します。
4. Pagesの表示URLにアクセスし、「家事をする」が表示され、8つのポイントが操作できるか確認します。

> GitHubでの保存と、PagesでのWeb公開は別操作です。GitHub Pagesを利用できる条件はリポジトリの公開範囲や契約プランにより異なります。

## ファイル構成

```text
index.html             GitHub Pages用の入口（dist/index.htmlへ移動）
dist/index.html        本番の3Dサイトの入口
dist/app.js            虫眼鏡・探索・アニメーション状態・リセット処理
dist/models.js         3D人物・メダル
dist/scenes.js        8つの家事のミニチュア世界
dist/content.js        発見ポイントの文章など
dist/hotspots.js       クリックの判定
dist/reticles.js       発見ポイントの目印
dist/style.css         画面スタイル
dist/vendor/          Three.jsなどの同梱ライブラリとライセンス
dist/experience.html  ローカル用の単独HTML版
build-standalone.mjs   単独HTMLの再生成
*.mjs                  展示アニメーションの各種自動検証
README-ASTRA.md        Astra側で作成された元のREADME
```

## 編集・テスト

ソースを編集する場合は `dist/` 内を変更してください。単独HTML版を更新するときは、Node.jsが使える環境で `node build-standalone.mjs` を実行します。

```bash
node checks.mjs
node flow-check.mjs
node verify-housework.mjs
node collision-audit.mjs
node facing-check.mjs
```

※これらは主にロジック・座標・当たり判定の自動検証です。ブラウザ上のWebGL描画や展示モニターでの見た目は別途目視確認してください。

## 補足

- 既存の演出と作品データは原則そのまま収録しています。`index.html` などのGitHub向けファイルを追加しています。
- 外部CDNに依存しない構成です。
- `dist/vendor/THREE-LICENSE.txt` に同梱ライブラリのライセンス表記があります。
