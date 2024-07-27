FROM node:20.16

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY backend/package.json backend/package-lock.json ./
RUN npm install

COPY backend/. .
COPY backend/tsconfig.json .

RUN npm run build

CMD ["npm", "run", "pm2"]
