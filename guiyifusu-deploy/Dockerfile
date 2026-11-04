FROM node:20-alpine
WORKDIR /app
COPY . .
RUN node tools/build-site.js
ENV PORT=4400
ENV DATA_FILE=/data/data.json
EXPOSE 4400
VOLUME ["/data"]
CMD ["node", "server/server.js"]
