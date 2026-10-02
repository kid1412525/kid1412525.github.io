# つくったアプリ置き場

自分で作ったアプリを一覧で紹介し、SNSのプロフィールや投稿にリンクを貼るためのサイトです。
ビルド不要の静的サイトなので、`index.html` をブラウザで開けばそのまま確認できます。

## 内容を書き換える

| 変えたいもの | 編集するファイル |
| --- | --- |
| サイト名・作者名・見出し・自己紹介・SNSリンク | `apps.js` の `SITE` |
| アプリの追加・削除・並び替え | `apps.js` の `APPS` |
| SNSに貼ったときのタイトル・説明・画像 | `index.html` の `<head>` |
| 色・フォント | `style.css` 先頭の `:root` |

アプリを追加するときは、`APPS` に URL を1行足すだけで載ります（アプリ名とボタンの文字は URL から自動で決まります）。
1文の紹介やアイコンを付けたいときの書き方は `apps.js` のコメントにあります。アイコン画像は `images/` フォルダに置きます。

## 公開先と更新のしかた

GitHub Pages で <https://kid1412525.github.io/> として公開しています。
ファイルを書き換えたあと、このフォルダで次の3行を実行すると、1〜2分で公開サイトに反映されます。

```powershell
git add -A
git commit -m "サイトを更新"
git push
```

## SNSのプレビュー画像を作り直す

サイト名や作者名を変えたときは、`tools/ogp.html` の文字を書き換えてから `ogp.png` を作り直します。

```powershell
$url = ([System.Uri](Resolve-Path tools\ogp.html).Path).AbsoluteUri
Start-Process "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -Wait -ArgumentList "--headless=new", "--hide-scrollbars", "--virtual-time-budget=6000", "--window-size=1200,630", "--screenshot=`"$PWD\ogp.png`"", "`"$url`""
```

## 個別のアプリへのリンク

各カードの「共有」ボタンで、そのアプリに直接飛ぶリンク（`…/#app-◯◯`）を共有・コピーできます。
SNSで特定のアプリを紹介するときに使えます。
