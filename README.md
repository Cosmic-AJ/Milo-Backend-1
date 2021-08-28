# Milo Server (Backend)
This is a Node JS server

## How to run the server locally
```bash
git clone https://github.com/Adithya31101/Milo-Backend.git
npm install
# *IMP* milo/client$ npm run build is necessary to run server, to serve frontend pages to the client devices.
npm start
```

This starts a server at port 5000, there might be an error when a request is being sent to '/' as there is no dist folder.. 

It is important to clone and build the client or frontend before starting the server. 

The reccommended folder structure is as follows
```markdown
milo/
  |-  server/
      |- dist/
      |- package.json
      |- index.js
      |- ...  
  |-  client/ 
      |- main.js
      |- index.html
      |- package.json
      |- ...
```

