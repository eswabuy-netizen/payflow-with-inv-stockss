
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

# Install only production dependencies
RUN npm ci --omit=dev

COPY . .

# The app listens on PORT provided by Render; default in server.js is 3000
EXPOSE 3000

CMD [ "node", "server.js" ]