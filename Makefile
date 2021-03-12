SOURCES := $(shell find src)

.PHONY: run clean

build: node_modules $(SOURCES) 
	npm run build-css
	npm run build

run: node_modules
	npm run start

node_modules: package.json package-lock.json
	npm install && touch node_modules

deploy: build
	npm publish

clean:
	rm -rf build
	rm -rf node_modules
