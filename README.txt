
Author: George Coppel
Class: CS370-01 FA23

Description: A chat app using a Node.js server to pass messages to and from a series of browser-based React applications via localhost ports. Networking done using the Socket.io library. Server app uses Express.js to stand up a local server.

Important Info:
- Server:
    - Everything is done through the index.js app
    - To run, use the following commands:
        - "npm install" (only need to run this the first time)
        - "node index.js"

- Client: 
    - Pretty much everything is done through the /src/App.jsx file.
        - ButtonList.jsx is used to display the buttons for all available users, but does not handle any Networking
    - To run, use the following commands:
        - "npm install" (only need to run this the first time)
        - "npm run dev" 
        - Then simply navigate to "localhost:5173" in the browser of your choice (tested with MS Edge and Firefox)