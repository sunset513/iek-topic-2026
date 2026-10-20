# IEKTopics 2026

網站預覽：https://sunset513.github.io/iek-topic-2026/

使用瀏覽器開啟預覽網址即可觀看網站與 YouTube 嵌入影片，不需要下載專案或啟動本機伺服器。

## 部署

這是純 HTML、CSS、JavaScript 靜態網站，不需要安裝套件或執行建置。

1. 在 GitHub repo 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。
2. 將網站變更提交並推送到 `main`。
3. 在 **Actions → Deploy website to GitHub Pages** 查看部署結果；也可以選擇 **Run workflow** 手動重新部署。

部署流程會直接發布專案根目錄。首頁為 `index.html`；`coming-soon.html`、`article.html` 和 `description.html` 也可透過對應網址瀏覽。站內資源採相對路徑，以支援 `/iek-topic-2026/` 子路徑。

## 影片預覽

請使用上方 HTTPS 預覽網址。從解壓縮後的 HTML 直接以 `file://` 開啟，可能無法提供 YouTube 所需的來源識別。影片嵌入保留 `strict-origin-when-cross-origin`，但播放仍受影片的嵌入權限及 YouTube 限制影響。
