SOURCES := $(shell find src)
LESS_SOURCES := $(shell find src/theme -name '*.less')

.PHONY: run clean

build: node_modules src/theme/bootstrap.css $(SOURCES) 
	npm run build

src/theme/bootstrap.css: node_modules $(LESS_SOURCES)
	npm run build-css

run: node_modules
	npm run start

node_modules: package.json package-lock.json
	npm install && touch node_modules

deploy: build
	npm publish

clean:
	rm -rf build
	rm -rf node_modules
	rm src/theme/bootstrap.css
