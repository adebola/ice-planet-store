1. Log onto EC2 Amazon Linux Instance
2. Install nvm
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
3. Activate nvm
	. ~/.nvm/nvm.sh
4. Use nvm to install the latest version of node
	nvm install node
5. Test NodeJS is installed
	node -e "console.log('Running Node.js ' + process.version)"

