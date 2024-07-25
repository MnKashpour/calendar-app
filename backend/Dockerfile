FROM node:22.5.1-alpine3.20

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY backend/package.json backend/package-lock.json ./
RUN npm install

COPY backend/. .
COPY backend/tsconfig.json .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start"]