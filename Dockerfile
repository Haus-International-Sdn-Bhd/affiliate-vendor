FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AUTH_URL
ARG NEXT_PUBLIC_AUTH_API_KEY
ARG NEXT_PUBLIC_API_KEY
ARG APP_COUNTRY=MY
ARG APP_LANGUAGE=en_MS
ARG TIMEZONE=Asia/Kuala_Lumpur

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AUTH_URL=$NEXT_PUBLIC_AUTH_URL
ENV NEXT_PUBLIC_AUTH_API_KEY=$NEXT_PUBLIC_AUTH_API_KEY
ENV NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY
ENV APP_COUNTRY=$APP_COUNTRY
ENV APP_LANGUAGE=$APP_LANGUAGE
ENV TIMEZONE=$TIMEZONE

RUN npm run build

FROM nginx:alpine AS runner

RUN apk add --no-cache curl

COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK \
    --interval=15s \
    --timeout=5s \
    --start-period=15s \
    --retries=3 \
    CMD curl -f http://127.0.0.1/healthcheck || curl -f http://127.0.0.1/health || curl -f http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
