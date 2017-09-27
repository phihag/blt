LIBDIR=static/libs

default: run-server

help:
	echo 'make targets:'
	@echo '  help          This message'
	@echo '  deps          Download and install all dependencies (for compiling / testing / CLI operation)'
	@echo '  compile       Create output files from source files where necessary'
	@echo '  test          Run tests'
	@echo '  run-server    Run the server'
	@echo '  clean         Remove temporary files'


deps:
	npm install

test:
	@npm test

clean:
	@npm clean

run-server:
	node_modules/.bin/node-supervisor src/bbt.js

lint: eslint stylelint ## Verify source code quality

eslint: eslint-server eslint-client

eslint-server:
	@node_modules/.bin/eslint src/

eslint-client:
	@node_modules/.bin/eslint -c static/.eslintrc.yml static/*.js

stylelint:
	@./node_modules/.bin/stylelint css/*.css

install-service:
	sed -e "s#BBT_ROOT_DIR#$$PWD#" div/bbt.service.template > /etc/systemd/system/bbt.service
	systemctl enable bbt
	systemctl start bbt

.PHONY: default compile help deps test clean run-server lint eslint eslint-server eslint-client install-service stylelint
