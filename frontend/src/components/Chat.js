import React, { useState, useEffect } from "react";
import { Send, User, MessageCircle, PlusCircle } from "lucide-react"; 

const getAuthToken = () => localStorage.getItem("token");

const getHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState([]); 
  const [allUsers, setAllUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false); 

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/users", { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => setAllUsers(data.filter(user => user._id !== currentUser._id))) 
      .catch((err) => console.error("⚠ Error fetching all users:", err));
  }, [currentUser]); 
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return; 
      try {
        const response = await fetch("http://localhost:5000/api/conversations", { headers: getHeaders() });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setConversations(data);
      } catch (err) {
        console.error("⚠ Error fetching conversations:", err);
      }
    };
    fetchConversations();

  }, [messages, currentUser]);


  useEffect(() => {
    if (!selectedUser) return;

    fetch(`http://localhost:5000/api/messages/${selectedUser._id}`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("⚠ Error fetching messages:", err));
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!currentUser || !selectedUser || !input.trim()) return;

    const newMessage = {
      sender: currentUser._id,
      receiver: selectedUser._id,
      content: input,
    };

    try {
      const response = await fetch("http://localhost:5000/api/messages", {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
      if (response.ok) {
        setMessages([...messages, { ...newMessage, timestamp: new Date(), sender: currentUser._id }]); 
        setInput("");

        if (showAllUsers) {
          setShowAllUsers(false);
        }
      } else {
        console.error("Failed to send message:", response.statusText);
      }
    } catch (error) {
      console.error("⚠ Error sending message:", error);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowAllUsers(false); 
  };

  return (
    <div className="flex h-screen border-2 border-green-500 bg-white">
      {/* Sidebar */}
      <div className="w-1/4 bg-green-50 p-4 overflow-y-auto border-r border-green-100 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 mr-2 text-green-600" />
            <h2 className="text-xl font-bold text-green-700">Chats</h2>
          </div>
          <button
            onClick={() => setShowAllUsers(!showAllUsers)}
            className="p-2 rounded-full bg-green-200 hover:bg-green-300 text-green-700 transition-colors"
            title={showAllUsers ? "Show Conversations" : "Start New Chat"}
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>

        {showAllUsers ? (
          <>
            <h3 className="text-lg font-semibold text-green-600 mb-3">All Users</h3>
            {allUsers.length > 0 ? (
              allUsers.map((user) => (
                <div
                  key={user._id}
                  className={`
                    p-2 mb-2 cursor-pointer rounded-lg flex items-center space-x-2 transition-all
                    ${selectedUser?._id === user._id
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-white hover:bg-green-100 text-green-800"}
                  `}
                  onClick={() => handleSelectUser(user)}
                >
                  <User className="w-5 h-5" />
                  <span className="truncate">
                    {user.firstName} {user.lastName} ({user.role})
                  </span>
                </div>
              ))
            ) : (
              <p className="text-green-500 text-center">No other users available</p>
            )}
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-green-600 mb-3">Recent Conversations</h3>
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.user._id}
                  className={`
                    p-2 mb-2 cursor-pointer rounded-lg flex flex-col space-y-1 transition-all
                    ${selectedUser?._id === conversation.user._id
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-white hover:bg-green-100 text-green-800"}
                  `}
                  onClick={() => handleSelectUser(conversation.user)}
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span className="truncate font-medium">
                      {conversation.user.firstName} {conversation.user.lastName}
                    </span>
                    <span className="text-sm opacity-80">({conversation.user.role})</span>
                  </div>
                  {conversation.lastMessage && (
                    <p className={`text-xs italic truncate ${selectedUser?._id === conversation.user._id ? 'text-white' : 'text-gray-500'}`}>
                      {conversation.lastMessage}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-green-500 text-center">No active conversations. Click '+' to start one!</p>
            )}
          </>
        )}
      </div>

      {/* Chat Section */}
      <div className="w-3/4 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto bg-white">
          {selectedUser ? (
            messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={index} 
                    className={`
                      flex items-end
                      ${msg.sender === currentUser?._id
                        ? "justify-end"
                        : "justify-start"}
                    `}
                  >
                    <div className="flex items-center space-x-2 max-w-[70%]">
                      {msg.sender !== currentUser?._id && (
                        <User className="w-6 h-6 text-green-600" />
                      )}
                      <div
                        className={`
                          p-2 rounded-lg shadow-sm
                          ${msg.sender === currentUser?._id
                            ? "bg-green-500 text-white"
                            : "bg-green-50 text-green-800"}
                        `}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-green-500">
                No messages yet with {selectedUser.firstName}. Start a conversation!
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-green-500">
              Select a user to start chatting
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-green-50 border-t border-green-100 flex space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!selectedUser}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            className={`
              p-2 rounded-lg transition-colors
              ${selectedUser
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"}
            `}
            onClick={sendMessage}
            disabled={!selectedUser}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}