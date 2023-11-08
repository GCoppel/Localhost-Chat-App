const express = require('express')
const { createServer } = require('node:http')
const { join } = require('node:path')
const socketIo = require('socket.io')
const cors = require('cors')

var app = express()// Create an Express.js app to host our server
const server = createServer(app) // Create the server
app.use(cors()) // Tell the Express.js app to use CORS -> Allows connections to origins on the localhost that would otherwise be blocked by most modern browsers
const io = socketIo(server, {
  cors: {
    origins: ["localhost:5173"], // Only allow port 5173 to connect to the server
  }
})

let clients = [] // Initialize the list of clients that we'll save user IDs into

io.on('connection', (socket) => { // On user connection

  {
  // Print the new connection and user ID (socket.id) to the console and add it to the clients array
  console.log('user connected: '+socket.id);
  clients.push(socket.id)
  }

  // On 'initial-connection' message, print the message and the IP address it came from, then respond with the same message and the client's unique user ID
  socket.on('initial-connection', (msg) => {
    console.log(socket.handshake.address + ' says "' + msg + '"')
    socket.emit("connection-response", msg, socket.id) // Echo back the message and add the client's user ID
  })

  // On 'request-users' message, sent the client the array containing the unique user IDs of all connected clients
  socket.on('request-users', () => {
    socket.emit("client-list", clients)
  })

  // On 'diconnect' message, remove the disconnected user's unique ID from the "clients" array
  socket.on('disconnect', () => {
    console.log('user disconnected: ' + socket.id)
    let tempClientsList = [] // Empty array to save non-disconnected client IDs to
    for (i in clients){ // For each client,
      if (clients[i] != socket.id) { // If they weren't the one who just disconnected,
        tempClientsList.push(clients[i]) // Add their ID to the temp array
      }
    }
    clients = tempClientsList // Set the global array to the temp array, saving all the IDs except the one who just disconnected
  })

  // On 'send-message-to-user' message, print the sender's ID, the message, and the receiver's ID to the console, then forward the message to the receiver
  socket.on("send-message-to-user", (message, recipient) => {
    console.log(socket.id + ' says "' + message + '" to ' + recipient)
    io.to(recipient).emit("message-from-user", message, socket.id) // Forward message to the receiver and give them the ID of the person who sent it to them
  })

})

// Listen for activity on the open port
server.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})