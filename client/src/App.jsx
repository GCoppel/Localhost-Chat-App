import React, { useEffect, useState } from "react";
import "./App.css";

import { io } from "socket.io-client";
import ButtonList from "./ButtonList";

const App = () => {
  const [socket, setSocket] = useState(); // Connection to server
  const [formText, setFormText] = useState(""); // User-typed message from the input form
  const [connected, setConnected] = useState(false); // Boolean, controls components to display
  const [myID, setMyID] = useState(); // The unique ID we use with the server to communicate
  const [users, setUsers] = useState([]); // The list of all currently connected user IDs, given by server
  const [activeRecipient, setActiveRecipient] = useState(); // The user ID of the person we are currently sending messages too
  const [messages, updateMessages] = useState([]); // The full list of messages we have sent and received

  // Used to refresh the messages list on message receive event:
  const [refreshCheat, setRefreshCheat] = useState(false);
  const callRefresh = () => {
    setRefreshCheat(!refreshCheat); // Just flip the boolean back and forth to trigger a React event
  };

  // After socket connection established, listen for messages:
  useEffect(() => {
    if (socket) {
      // Assign our user ID:
      socket.on("connection-response", (message, userID) => {
        // Print the echoed message and assigned user ID to the console:
        message = ('Server echoes back: "' + message + '" and assigns us ID ' + userID);
        console.log(message);
        setMyID(userID); // Set our user ID, affects the displayed components
      });
      // Get the available users:
      socket.on("client-list", (clients) => {
        setUsers(clients); // Update the list of all currently connected users
      });
      // Receive incoming messages:
      socket.on("message-from-user", (message, sender) => {
        let tempMessages = messages;
        message = sender + ": " + message; // Add the user ID for whoever sent us this message
        tempMessages.push(message); // Add the new message
        updateMessages(tempMessages); // Re-store the list of all messages
        callRefresh(); // Call the refresh cheat to refresh the message list
      });
    }
  }, [socket]);

  // Function to request a connection to a hard-coded port. DOES NOT CHECK FOR A FAILED CONNECTION
  const connectToServer = () => {
    let newSocket = io("http://localhost:3000");
    setSocket(newSocket); // Set the new socket
    setConnected(true); // Update connection state, affects displayed components
  };

  // Function to handle when the user presses the "Send" button or presses enter when done typing in the input form
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    sendMessage(formText); // Call the sendMessage function with the formText
    setFormText(""); // Clear the input form on successful send
  };

  // Function to send a message to the server, possibly requesting that it be forwarded to another user through their user ID
  function sendMessage(message) {
    // If we haven't chosen a person to send this message to:
    if (activeRecipient) {
      socket.emit("send-message-to-user", message, activeRecipient); // Send the message to another user
      // Save the message in our list of messages so that we can see it too:
      let tempMessages = messages;
      message = "You: " + message;
      tempMessages.push(message);
      updateMessages(tempMessages);
    }
    // Otherwise, this is the initial connection message that we're sending:
    else {
      socket.emit("initial-connection", message);
    }
  }

  // Function that updates the text state from the input form
  const handleInputChange = (e) => {
    setFormText(e.target.value);
  };

  // Function to request that the server send us the list of all user IDs
  const getUsers = () => {
    socket.emit("request-users");
  };

  // These are the components that get rendered to the screen:
  return (
    <>
      {connected ? ( // If we are connected, show the first section:
        // Connected:
        <>
          {!myID ? ( // If we do NOT have our user ID, display the below header component text:
            <h3>Say anything to get your User ID from the server</h3>
          ) : (
            // If we do have our user ID, display it and add the button to get/refresh the list of other users:
            <>
              <h3>
                You are: <div className="id-label">{myID}</div>
              </h3>
              <button onClick={getUsers}>
                {users.length > 0 ? "Refresh" : "Get"} Available Users
              </button>
              <ButtonList strings={users} updateFunc={setActiveRecipient} />
            </>
          )}
          {
            activeRecipient ? ( // If we have clicked on a person to start messaging, show the panel of messages
              <div id="conversation-panel">
                <ul id="messages">
                  {messages.map((message, index) => {
                    // Split the message into two sections: a "user" who sent the message and the "msg" (message) itself
                    const splitIndex = message.indexOf(" ");
                    const user = message.substring(0, splitIndex);
                    const msg = message.substring(splitIndex + 1);
                    // Return an unordered list of all the messages sent and received:
                    return (
                      <li key={index}>
                        {
                          <div className="message-container">
                            <div className="sender">{user}</div>
                            <div className="msg">{msg}</div>
                          </div>
                        }
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null // If we have NOT clicked on a person to start messaging, show nothing
          }
          <form id="input-form">
            <label>
              <input
                id="input-text"
                type="text"
                value={formText}
                onChange={handleInputChange}
              />
            </label>
            <button id="input-button" onClick={handleSubmit}>
              Send
            </button>
          </form>
        </>
      ) : (
        // Otherwise we are not connected, so show the button to request a connection
        <button onClick={connectToServer}>Connect to Server</button>
      )}
    </>
  );
};

export default App;
