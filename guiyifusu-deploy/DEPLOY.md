# 部署（Render 免费版）

1. 把本目录所有文件上传到一个 GitHub 仓库（网页 Upload files 或 git push）。
2. 打开 https://render.com → New → Web Service → 连接该仓库。
3. 设置：
   - Runtime: Node
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Plan: Free
4. 创建后等待部署，打开 Render 给的 https://xxx.onrender.com
   页脚应显示「联机模式」。
5. 数据在 `server/data.json`，免费实例重启会重置；长期使用请挂持久磁盘并设置
   `DATA_FILE=/data/data.json`（需付费实例），或定期备份。

本地验证：
```bash
npm run build
npm start
# http://127.0.0.1:4400/
```
