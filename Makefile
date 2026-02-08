.PHONY: install backend-test ml-test frontend-format all-test

install:
	cd backend && npm install
	cd frontend && npm install
	pip install -r ML/requirements.txt

backend-test:
	cd backend && npm test
	cd backend && npm run lint

ml-test:
	export PYTHONPATH=$$PYTHONPATH:$(pwd)/ML && pytest ML/tests

frontend-format:
	cd frontend && npm run format

all-test: backend-test ml-test frontend-format
