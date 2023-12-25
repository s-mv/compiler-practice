everything: build run

run:
	@node out/index.js

build: 
	@npm run build

clean:
	@rm -rf out/*