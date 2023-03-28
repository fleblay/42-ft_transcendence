#!/bin/bash

if [ -f ".env" ]
then
	echo -e "\x1b[33mEnv File already exists, nothing to be done\x1b[0m"
	exit
fi

RANDOMINPUT=()
for i in `seq 0 4`
do
	RANDOMINPUT[$i]=$(cat /dev/urandom | LC_ALL=C tr -dc '[:alpha:]' | fold -w 20 | head -n 1)
done

cp .env.template .env

if [ $(uname) = 'Darwin' ]
then
	EXTENSION=".backup"
fi

sed -i $EXTENSION "s/\(POSTGRES_USER=\).*/\1${RANDOMINPUT[0]}/" .env
sed -i $EXTENSION "s/\(POSTGRES_PASSWORD=\).*/\1${RANDOMINPUT[1]}/" .env
sed -i $EXTENSION "s/\(COOKIE_KEY=\).*/\1${RANDOMINPUT[2]}/" .env
sed -i $EXTENSION "s/\(RANDOM_NUMBER1=\).*/\1${RANDOMINPUT[3]}/" .env
sed -i $EXTENSION "s/\(RANDOM_NUMBER2=\).*/\1${RANDOMINPUT[4]}/" .env

rm -rf .env.backup

echo -e "\x1b[32mEnv File successfully created\x1b[0m"

VOLUME=$(docker volume ls -q | grep "ft_transcendence_postgres_data")

if [ "$VOLUME" != "" ]
then
	docker volume rm "$VOLUME"
	echo -e "\x1b[33mRemoving already existing postgres database volume\x1b[0m"
fi
