FROM node:20.16

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json ./package-lock.json ./
RUN npm install

COPY . .
COPY ./tsconfig.json .

RUN npm run build

CMD ["npm", "run", "pm2"]
