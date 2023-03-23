RUNNING_CONTAINERS	:= $(shell docker ps -q)
ALL_CONTAINERS		:= $(shell docker ps -a -q)
ALL_VOLUMES			:= $(shell docker volume ls -q)
ALL_NETWORK			:= $(shell docker network ls --filter type=custom -q)

all: .env
	docker compose up &

.env: .env.template
	bash envmaker.sh

down:
	docker compose down -t 5
	rm -rf .env

clean: stop-all rm-all rm-vol rm-net

#####CLEANING#####
stop-all :
ifneq ($(strip $(RUNNING_CONTAINERS)), )
	docker stop $(RUNNING_CONTAINERS)
else
	@echo "No running container to be stopped"
endif

rm-all :
ifneq ($(strip $(ALL_CONTAINERS)), )
	docker rm $(ALL_CONTAINERS)
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
