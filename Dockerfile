FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["npx", "tsx", "src/node-server.tsx"]
