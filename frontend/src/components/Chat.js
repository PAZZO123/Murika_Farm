import { useState, useEffect } from "react";
import { Send, User, Eye } from "lucide-react";

const getAuthToken = () => localStorage.getItem("token");

const getHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/users", { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("⚠ Error fetching users:", err));
  }, []);

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
        setMessages([...messages, newMessage]);
        setInput("");
      }
    } catch (error) {
      console.error("⚠ Error sending message:", error);
    }
  };

  return (
    <div className="ml-9 flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Users</h2>
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              className={`p-2 cursor-pointer rounded-lg flex items-center space-x-2 ${
                selectedUser?._id === user._id ? "bg-green-500 text-white" : "bg-white"
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <User className="w-5 h-5" />
              <span>{user.firstName} {user.lastName} ({user.role})</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No users available</p>
        )}
      </div>

      {/* Chat Section */}
      <div className="w-3/4 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
          {selectedUser ? (
            messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 my-1 flex ${
                    msg.sender === currentUser?._id ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender !== currentUser?._id && (
                    <User className="w-6 h-6 mr-2 text-gray-600" />
                  )}
                  <div className="flex items-start max-w-[70%]">
                    <span
                      className={`inline-block p-2 rounded-lg ${
                        msg.sender === currentUser?._id 
                          ? "bg-green-500 text-white" 
                          : "bg-gray-300"
                      }`}
                    >
                      {msg.content}
                    </span>
                    <Eye className="w-4 h-4 ml-1 text-gray-400 mt-1" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No messages yet.</p>
            )
          ) : (
            <p className="text-gray-500 text-center">Select a user to start chatting.</p>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 flex bg-white border-t">
          <input
            type="text"
            className="flex-1 border p-2 rounded-lg"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!selectedUser}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            className={`ml-2 p-2 rounded-lg ${
              selectedUser 
                ? "bg-green-500 text-white hover:bg-green-600" 
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
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