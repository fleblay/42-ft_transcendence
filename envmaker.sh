#!bash

RANDOMINPUT=()
for i in `seq 0 4`
do
	RANDOMINPUT[$i]=$(cat /dev/urandom | LC_ALL=C tr -dc '[:alpha:]' | fold -w 20 | head -n 1)
done

cp .env.template .env
sed -i .backup "s/\(POSTGRES_USER=\).*/\1${RANDOMINPUT[0]}/" .env
sed -i .backup "s/\(POSTGRES_PASSWORD=\).*/\1${RANDOMINPUT[1]}/" .env
sed -i .backup "s/\(COOKIE_KEY=\).*/\1${RANDOMINPUT[2]}/" .env
sed -i .backup "s/\(RANDOM_NUMBER1=\).*/\1${RANDOMINPUT[3]}/" .env
sed -i .backup "s/\(RANDOM_NUMBER2=\).*/\1${RANDOMINPUT[4]}/" .env

rm .env.backup
