FROM node:20-alpine

# Install sqlite dependencies
RUN apk add --no-cache sqlite g++ make python3

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm ci --omit=dev

RUN mkdir -p uploads && chown -R node:node uploads
RUN touch database.sqlite && chown node:node database.sqlite

USER node

EXPOSE 3001

CMD ["npm", "start"]
