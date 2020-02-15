FROM node:12.14.1-slim as base

ENV NODE_ENV=production

WORKDIR /usr/src

COPY package*.json ./

RUN npm config list \
    && npm ci \
    && npm cache clean --force



FROM base as dev

ENV NODE_ENV=development

ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /usr/src

RUN npm install --only=development
WORKDIR /usr/src/app

CMD ["nodemon","-L","bin/www","--inspect=0.0.0.0:9229"]

FROM source as prod
WORKDIR /usr/src/app

COPY . .

CMD ["node","bin/www"]