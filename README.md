# ft_transcendence [![jremy's 42 ft_transcendence Score](https://badge42.vercel.app/api/v2/cl27cprhd001109mercwbbu5l/project/3008041)](https://github.com/JaeSeoKim/badge42)


<p align="center">
  <img src="./vite/src/assets/private.png" width="538">
</p>

## Description :

This project is the final projet of 42 cursus common core.

The goal of this project is to create online pong app, including :
 - a chat interface
 - a matchmaking system
 - a friendship relation system
 - notifications alert
 - 2fa with google authenticator
 - spectate mode
 - login with 42 api

Technologies used :
- docker
- node/nestjs
- react

Languages used :
- Typescript
- Bash
- Yaml

## Team : 

[Fred](https://profile.intra.42.fr/users/fle-blay), [Marius](https://profile.intra.42.fr/users/mbraets), [Jonathan](https://profile.intra.42.fr/users/jremy) 

## Usage :

Simply clone the git repository in the directory of your choice and run make.
the website will be available on http://localhost:8080 ! 

```
 	~/$> git clone https://github.com/jremy42/42-ft_transcendence.git
	~/$> cd 42-ft_transcendencen && Make
```

Requirements : 
- Make
- Docker

Compliant for deployement in aws => [you can try here](https://transcendence.jremy.dev)

Compliant for deployement in private webserver => [you can try here](https://leblay.dev/pong)

## Docker Stack :

<p align="center">
  <img src="./info/stack_docker.jpg" width="100%">
</p>

### Nginx :
ingress point listening on 443 with ssl
reverse proxy for nestjs backend api calls
static serve of avatars files (.png) and front-end app file (.js / .html / .css) 

### Vite :
Transpilation and minification from typescript to javascript
exits on success

### Nest :
expose api routes for use in frontend
serves as an intermidary between client and postgre Database

### PostgreSQL :
handle CRUD operations on website database

## Data Architecture :

<p align="center">
  <img src="./info/db_model.png" width="100%">
</p>

## What have we learned? :

## ressources:
