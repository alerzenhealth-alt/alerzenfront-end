FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server/ server/
COPY dist/ dist/


EXPOSE 3000

CMD ["node", "server/index.js"]
