FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY config.template.js /etc/nginx/templates/orion-config.js.template
COPY docker-entrypoint.sh /docker-entrypoint.d/40-orion-config.sh
RUN chmod +x /docker-entrypoint.d/40-orion-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
