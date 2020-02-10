FROM node:12.14.1-alpine

ENV NODE_ENV=production

WORKDIR /usr/src

COPY package*.json ./

RUN npm install && npm cache clean --force

WORKDIR /usr/src/app

COPY . .

CMD ["node","bin/www"]