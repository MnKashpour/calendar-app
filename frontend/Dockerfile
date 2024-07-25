FROM node:22.5.1-alpine3.20

RUN mkdir -p /frontend
WORKDIR /frontend

RUN npm install -g @angular/cli

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/. .
COPY frontend/tsconfig.json .

RUN npm run build

CMD ["ng", "serve", "--host", "0.0.0.0"]