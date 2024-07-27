# STAGE 1: build
FROM node:22.5.1-alpine3.20 AS build

RUN mkdir -p /frontend
WORKDIR /frontend

RUN npm install -g @angular/cli

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/. .
COPY frontend/tsconfig.json .

RUN npm run build

# STAGE 2: nginx
FROM nginxinc/nginx-unprivileged

COPY frontend/nginx.conf /etc/nginx/templates/default.conf.template

COPY --from=build /frontend/dist/frontend/browser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]