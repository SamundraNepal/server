FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG NEXT_PUBLIC_URL=/api
ARG INTERNAL_API_URL=http://nginx/api

ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL

# Build the Next.js application

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0"]
