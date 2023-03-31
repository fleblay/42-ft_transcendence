#!/bin/sh

npm install --production=false

VERSION=$(uname -mo)
if [ "$VERSION" = "aarch64 Linux" ]
then
	echo -e "\x1b[33mInstalling esmodule\x1b[0m"
	cp package.json package.json.backup
	cp package-lock.json package-lock.json.backup
	npm install @esbuild/linux-arm64
	mv package.json.backup package.json
	mv package-lock.json.backup package-lock.json
fi

if [ "$NODE_ENV" == "development" ]
then
	echo "buildw"
	npm run build-w
else
	echo "build"
	npm run build
fi
