# build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Inject env BEFORE build
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

# production stage
FROM node:22-alpine 

WORKDIR /app

RUN npm i -g serve
ENV PATH="user/local/bin:$PATH"

COPY  --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve","-s","dist","-l","3000"]

