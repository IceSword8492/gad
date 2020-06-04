if !(type "nvm" > /dev/null 2>&1); then
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
fi

export NVM_DIR="/app/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm --version
nvm install node
nvm use node
node ./index.js
