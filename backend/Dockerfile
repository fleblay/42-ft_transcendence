###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine As development

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./
COPY tsconfig*.json ./

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN npm install -g @nestjs/cli #Utiliser le chemin relatif pour la CMD si installation non globale ex CMD ["./node_modules/...../npm", "run", "start:dev"]
RUN npm install --save-dev @nestjs/common
RUN npm install --save-dev @nestjs/core
RUN npm install --save-dev @nestjs/config
RUN npm install --save-dev @nestjs/typeorm
RUN npm install --save-dev @types/node

RUN npm ci

CMD [ "npm", "run", "start:dev" ]

###################
# BUILD FOR PRODUCTION
###################

FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

# Run the build command which creates the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --only=production && npm cache clean --force

###################
# PRODUCTION
###################

FROM node:18-alpine As production

# Copy the bundled code from the build stage to the production image
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
