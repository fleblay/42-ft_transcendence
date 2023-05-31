#!/bin/bash

if [ -f ".env" ]
then
	echo -e "\x1b[33mEnv File already exists, nothing to be done\x1b[0m"
	exit
fi

RANDOMINPUT=()
for i in `seq 0 9`
do
	RANDOMINPUT[$i]=$(cat /dev/urandom | LC_ALL=C tr -dc '[:alpha:]' | fold -w 20 | head -n 1)
done

cp .env.template .env

if [ $(uname) = 'Darwin' ]
then
	EXTENSION=".backup"
fi

if [ "$1" == "dev" ]
then
	sed -i $EXTENSION "s/\(NODE_ENV=\).*/\1development/" .env
fi

sed -i $EXTENSION "s/\(POSTGRES_USER=\).*/\1${RANDOMINPUT[0]}/" .env
sed -i $EXTENSION "s/\(POSTGRES_PASSWORD=\).*/\1${RANDOMINPUT[1]}/" .env
sed -i $EXTENSION "s/\(COOKIE_KEY=\).*/\1${RANDOMINPUT[2]}/" .env
sed -i $EXTENSION "s/\(TOKEN_KEY=\).*/\1${RANDOMINPUT[3]}/" .env
sed -i $EXTENSION "s/\(RANDOM_NUMBER1=\).*/\1${RANDOMINPUT[4]}/" .env
sed -i $EXTENSION "s/\(RANDOM_NUMBER2=\).*/\1${RANDOMINPUT[5]}/" .env
sed -i $EXTENSION "s/\(SECRET_ACCESS=\).*/\1${RANDOMINPUT[6]}/" .env
sed -i $EXTENSION "s/\(SECRET_REFRESH=\).*/\1${RANDOMINPUT[7]}/" .env
sed -i $EXTENSION "s/\(SECRET_DFA=\).*/\1${RANDOMINPUT[8]}/" .env

HOSTNAME=$(uname -n)
if [[ "$HOSTNAME" == *".clusters.42paris.fr" ]]
then
	echo -e "\x1b[33m42paris device : changing HOSTNAME from localhost to ${HOSTNAME}\x1b[0m"
elif [[ "$HOSTNAME" == "fred-LPD3" ]]
then
	echo -e "\x1b[33mLPD3\x1b[0m"
	sed -i $EXTENSION "s/\(PUBLIC_URL=\).*/\1https:\/\/leblay.dev:443/" .env
	sed -i $EXTENSION -e "/.*listen 8080.*/{r fred-LPD3.conf" -e "d}" ./nginx/nginx.conf
	sed -i $EXTENSION "s/8080/443/g" ./docker-compose.yml
	sed -i $EXTENSION "s/\(.*\/nginx\/avatars:\/www\/avatars.*\)/\1\n      - \/etc\/letsencrypt\/archive\/leblay.dev:\/etc\/letsencrypt\/live\/leblay.dev:ro\n/" ./docker-compose.yml
elif [[ "$HOSTNAME" == "ip"* ]]
then
	echo -e "\x1b[33mJREMY AWS\x1b[0m"
	sed -i $EXTENSION "s/\(PUBLIC_URL=\).*/\1https:\/\/jremy.dev:443/" .env
	sed -i $EXTENSION -e "/.*listen 8080.*/{r jremy.conf" -e "d}" ./nginx/nginx.conf
	sed -i $EXTENSION "s/8080/443/g" ./docker-compose.yml
	sed -i $EXTENSION "s/\(.*\/nginx\/avatars:\/www\/avatars.*\)/\1\n      - \/etc\/letsencrypt\/live\/jremy.dev:\/etc\/letsencrypt\/live\/jremy.dev:ro\n/" ./docker-compose.yml
else
	echo -e "\x1b[33m42Outside 42paris : HOSTNAME set to localhost to\x1b[0m"
	HOSTNAME="localhost"
fi
sed -i $EXTENSION "s/\(HOSTNAME=\).*/\1${HOSTNAME}/" .env

rm -rf .env.backup

echo -e "\x1b[32mEnv File successfully created\x1b[0m"

VOLUME=$(docker volume ls -q | grep "ft_transcendence_postgres_data")

if [ "$VOLUME" != "" ]
then
	docker volume rm "$VOLUME"
	echo -e "\x1b[33mRemoving already existing postgres database volume\x1b[0m"
fi
