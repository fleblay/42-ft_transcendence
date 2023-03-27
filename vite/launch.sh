#!/bin/sh

npm install --production=false
if [ "$NODE_ENV" == "development" ]
then
	echo "buildw"
	npm run build-w
else
	echo "build"
	npm run build
fi