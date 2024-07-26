FROM node:20.16

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY backend/package.json backend/package-lock.json ./
RUN npm install

COPY backend/. .
COPY backend/tsconfig.json .

RUN npm run build

EXPOSE 3000

CMD ["node","dist/index.js"]
