RUNNING_CONTAINERS	:= $(shell docker ps -q)
ALL_CONTAINERS		:= $(shell docker ps -a -q)
ALL_VOLUMES			:= $(shell docker volume ls -q)
ALL_NETWORK			:= $(shell docker network ls --filter type=custom -q)

all: build
	docker-compose up --no-build

#MACOS specific

kill:
	pkill Docker

docker:
	open -g /Applications/Docker.app/

detach: build
	docker-compose up --no-build -d

follow: detach
	docker-compose logs -f

build: .env.template backend/Dockerfile
	bash envmaker.sh
	mkdir -p nginx/avatars
	docker-compose build
	curl https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Vimlogo.svg/langfr-320px-Vimlogo.svg.png -sSo nginx/avatars/default.png

down:
	docker-compose down -t 3

rm-modules:
	rm -rf ./backend/node_modules

clean: stop-all rm-all rm-vol rm-net

fclean : clean rm-modules
	docker system prune -f --volumes -a
	rm -rf nginx/avatars
	rm -rf ./.env

#####CLEANING#####
stop-all :
ifneq ($(strip $(RUNNING_CONTAINERS)), )
	docker stop $(RUNNING_CONTAINERS)
else
	@echo "No running container to be stopped"
endif

rm-all :
ifneq ($(strip $(ALL_CONTAINERS)), )
	docker rm -f $(ALL_CONTAINERS)
else
	@echo No container to be removed
endif

rm-vol :
ifneq ($(strip $(ALL_VOLUMES)), )
	docker volume rm $(ALL_VOLUMES)
else
	@echo No volume to be removed
endif

rm-net :
ifneq ($(strip $(ALL_NETWORK)), )
	docker network rm $(ALL_NETWORK)
else
	@echo No network to be removed
endif
