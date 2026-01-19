FROM registry.baal.ai/node-20-alpine3.21:v0.0.0-prod.2 AS builder

ARG NPM_REGISTRY
ARG NPM_USER
ARG NPM_PASS
ARG APP_ENV

#Creates directories
RUN mkdir -p /usr/src/app

#Sets an environment variable
ENV PORT 1200

COPY .env.prod .env.stage /usr/src/app/

RUN echo "APP_ENV=$APP_ENV" && \
    if [ "$APP_ENV" = "PROD" ]; then \
      cp /usr/src/app/.env.prod /usr/src/app/.env; \
    elif [ "$APP_ENV" = "STAGE" ]; then \
      cp /usr/src/app/.env.stage /usr/src/app/.env; \
    else \
      echo "Invalid APP_ENV=$APP_ENV" && exit 1; \
    fi

#Sets the working directory for any RUN, CMD, ENTRYPOINT, COPY, and ADD commands
WORKDIR /usr/src/app

#Copy new files or directories into the filesystem of the container
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

# config custom registry
RUN npm-cli-login -u $NPM_USER -p $NPM_PASS -e mail@gmail.com -r $NPM_REGISTRY
RUN cp /root/.npmrc /usr/src/app/.npmrc

RUN npm config set registry $NPM_REGISTRY --location=project

#Execute commands in a new layer on top of the current image and commit the results
RUN npm install

##Copy new files or directories into the filesystem of the container
COPY . /usr/src/app

#Execute commands in a new layer on top of the current image and commit the results
RUN npm run build

# ---- production stage ----
FROM nginx:1.29.1-alpine3.22-slim

# Copy build output to Nginx html directory
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 1200

CMD ["nginx", "-g", "daemon off;"]
