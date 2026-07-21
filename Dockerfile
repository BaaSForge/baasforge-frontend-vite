FROM node:22-alpine3.21 AS builder

ARG APP_ENV

RUN mkdir -p /usr/src/app

ENV PORT=1200

COPY .env.prod .env.stage /usr/src/app/

RUN echo "APP_ENV=$APP_ENV" && \
    if [ "$APP_ENV" = "PROD" ]; then \
      cp /usr/src/app/.env.prod /usr/src/app/.env; \
    elif [ "$APP_ENV" = "STAGE" ]; then \
      cp /usr/src/app/.env.stage /usr/src/app/.env; \
    else \
      echo "Invalid APP_ENV=$APP_ENV" && exit 1; \
    fi

WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

RUN npm install

COPY docs-site/package.json docs-site/package-lock.json* /usr/src/app/docs-site/
RUN npm install --prefix docs-site

COPY . /usr/src/app

RUN npm run build
RUN npm run build --prefix docs-site

FROM nginx:1.29.1-alpine3.22-slim

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY --from=builder /usr/src/app/docs-site/out /usr/share/nginx/html/docs

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

HEALTHCHECK --interval=5s --timeout=5s --start-period=10s --retries=2 \
  CMD wget -q --spider http://127.0.0.1/ || kill -s TERM 1

CMD ["nginx", "-g", "daemon off;"]
