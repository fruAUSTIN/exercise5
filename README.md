# exercise5

#Install Node.js and Git

#Check whether Node is already installed and which version you have 
	
	node –v

#Check whether Git is already installed and which version you have 

	git –-version

#Initialise git 
	
	git init

#Clone the required github repository 
	
	git clone https://github.com/fruAUSTIN/exercise5.git

#Set exercise5 as working directory 

	cd exercise5

#Install Origami build tools 
	
	npm install -g origami-build-tools

#Make sure Bower is installed 
	
	npm install g- bower

#Initialise the required npm packages 
	
	docker-compose run –-rm origami npm install 
	
	docker-compose run –-rm origami npm install – g origami-build-tools@6.2.5 
	
	docker-compose run –-rm origami/app/node_modules/.bin?obt install

#Compile contents of client/main.js and client/main.scss into client folder 
	
	./obt.sh build --sass=/app/client/main.scss --buildCss=bundle.css --buildFolder=/app/public --js=/app/client/main.js --buildJs=bundle.js

#Install o-gallery and o-typography to bower.json file, then run it 
	
	bower install --save "o-gallery"@"^3.0.3" 
	
	bower install --save "o-typography"@"^5.5.0"

	docker-compose run –-rm origami/app/node_modules/.bin?obt install

#Open the client folder 
	
	open client

#Import o-gallery 
	
	@import 'o-gallery/main';

#Compile contents of client/main.js and client/main.scss into client folder 
	
	./obt.sh build --sass=/app/client/main.scss --buildCss=bundle.css --buildFolder=/app/public --js=/app/client/main.js --buildJs=bundle.js

#Now load the public folder

	open public

#Open index.html in a browser

#Late update to the gallery to make the slider work
