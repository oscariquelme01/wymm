###################
# BUILD FOR PRODUCTION
###################
FROM node:22-alpine As build

# Create app directory
WORKDIR /app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npm run build


###################
# PRODUCTION
###################
FROM node:22-alpine
# Create app directory
WORKDIR /app
COPY package.json ./
COPY 43fd2b6e-eaa9-42bc-b2fd-3a4a39874fcd.pem ./
# If you are building your code for production
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
# Install curl into alpine image
RUN apk --no-cache add curl 
EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]


