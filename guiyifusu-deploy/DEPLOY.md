# 部署（Netlify，免费且不用银行卡）

1. 把本目录所有文件上传到一个 GitHub 仓库（网页 Upload files 或 git push）。
2. 打开 Netlify，进入你现有的站点（域名不变）：
   Site configuration → Build & deploy → Link repository → 选择仓库。
   Netlify 会自动读取 netlify.toml（构建 npm run build，发布 site/public，函数 netlify/functions）。
3. 触发一次 Deploy，等构建完成。
4. 打开 https://你的域名/api/ping ，应返回 {"ok":true,...}；
   页脚应显示「联机模式」。
5. 数据存在 Netlify Blobs，重新部署不会丢。

本地验证：
```bash
npm run build
npm start
# http://127.0.0.1:4400/
```
