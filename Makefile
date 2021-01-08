SOURCES := $(shell find src)

.PHONY: run clean

build: node_modules $(SOURCES) 
	npm run build

run: build
	npm run start

node_modules: package.json package-lock.json
	npm install && touch node_modules

clean:
	rm -rf build
	rm -rf node_modules
