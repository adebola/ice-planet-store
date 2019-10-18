1. Log onto EC2 Amazon Linux Instance
2. Install nvm
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
3. Activate nvm
	. ~/.nvm/nvm.sh
4. Use nvm to install the latest version of node
	nvm install node
5. Test NodeJS is installed
	node -e "console.log('Running Node.js ' + process.version)"


	Git Commands

	git status
	git add
	git commit

	git log
	git checkout
	git revert --no-commit c07b91d1a79875dcf7785cd7abe8eaa17b2bbed..HEAD

// Add Remote Location on github
$ git remote add origin https://github.com/user/repo.git
# Set a new remote

$ git remote -v
# Verify new remote
> origin  https://github.com/user/repo.git (fetch)
> origin  https://github.com/user/repo.git (push)


// Push Changes
git push -u origin master


// MongoDB Config
1. Download MongoDB
	wget https://repo.mongodb.org/yum/amazon/2/mongodb-org/4.2/x86_64/RPMS/mongodb-org-server-4.2.1-1.amzn2.x86_64.rpm
2. Install Mongofb
	sudo yum install ./mongodb-org-server-4.2.1-1.amzn2.x86_64.rpm
3. Create Run script for MongoDB
mongod --dbpath [where db files will reside]


// Install Git
1.sudo yum install git

tepsis-bepku5-qIntad


Heroku setup

1. Install heroku client
	brew install heroku/brew/heroku


2. Login
	heroku login # and follow instructions if you are on a non UI platform run heroku login -i

3. Deploy app
	heroku create # Creates App

