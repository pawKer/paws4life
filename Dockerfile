FROM node:22-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx playwright install --with-deps chromium \
  && apt-get update \
  && apt-get install -y --no-install-recommends fonts-inter fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
