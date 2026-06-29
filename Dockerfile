FROM node:16-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps --no-save --package-lock=false

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
