import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaInbox, FaPaperPlane,} from 'react-icons/fa';
import axios from 'axios';
import logo from '../Assets/unicef_logo.png'; 

const Message = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [previousClients, setPreviousClients] = useState([]);
  const [newClients, setNewClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [viewingNewClients, setViewingNewClients] = useState(false);
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));

  useEffect(() => {
    fetchClients();
  }, []);
     useEffect(() => {
    if (selectedClient) {
      fetchMessages(selectedClient);
    }
  }, [selectedClient]);

const fetchClients = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/auth/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const allClients = response.data;

    // Filter clients based on role
    const filteredClients = allClients.filter(client => client.role === currentUser.role);

    const previous = [];
    const newClients = [];

    for (const client of filteredClients) {
      const res = await axios.get(`http://localhost:5000/api/messages/${client._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.length > 0) {
        previous.push(client);
      } else {
        newClients.push(client);
      }
    }

    setPreviousClients(previous);
    setNewClients(newClients);
    setClients(previous); // Initially show clients with previous messages

  } catch (error) {
    console.error(error);
  }
};


  const fetchMessages = async (clientId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/messages',
        {
          sender: currentUser._id,
          receiver: selectedClient, 
          content: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages([...messages, response.data.newMessage]);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  const toggleClientView = () => {
    if (viewingNewClients) {
      setClients(previousClients);
    } else {
      setClients(newClients);
    }
    setViewingNewClients(!viewingNewClients);
  };

  return (
    <div className="rounded" style={{ fontFamily: 'roboto' }}>
        <div className=" flex justify-center text-center mt-5 mb-3">
        <img src={logo} alt="UNICEF Logo" className="h-10" />
        <h1 className="text-4xl font-bold text-gray-800">
          Child Rights <span className="text-blue-400">ADVOCACY</span>
        </h1>
      </div>
      <div className="m-5 rounded h-screen flex">
      <div className="h-full w-1/4 bg-blue-500 shadow-lg rounded-l-lg">
        <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Message Tools</h2>
          <button className="text-sm px-3 py-1 bg-blue-700 rounded-lg" onClick={toggleClientView}>
            {viewingNewClients ? 'Back' : 'New'}
          </button>
        </div>
        <div className="p-4 bg-blue-500 text-white">
          <div className="mb-4">
            <p className="text-lg font-bold flex items-center">
              <FaInbox className="mr-2" />
              {viewingNewClients ? 'New Clients' : 'Inbox'}
            </p>
            {clients.map((client) => (
              <div
                key={client._id}
                className={`flex items-center p-2 cursor-pointer rounded-lg mb-2 ${
                  selectedClient === client._id ? 'bg-gray-200' : 'bg-gray-100'
                }`}
                onClick={() => setSelectedClient(client._id)}
              >
                <FaUserCircle className="text-2xl mr-2 text-black" />
                <div>
                  <p className="font-semibold text-black">{client.username}</p>
                  <p className="text-sm text-gray-500">Status: {client.status || 'Offline'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Folders */}
          <div className="mt-4 space-y-3 bg-blue-500 text-white">
            <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
              <FaPaperPlane className="text-white mr-2" />
              <p className="font-semibold">Sent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main message area */}
      <div className="flex-1 bg-white shadow-lg rounded-r-lg flex flex-col">
        {selectedClient ? (
          <>
            {/* Header */}
            <div className="flex items-center bg-gray-500 p-4 border-b text-white">
              <FaUserCircle className="text-3xl mr-3" />
              <div>
                <h3 className="text-lg font-bold">Chat with {selectedClient.username}</h3>
                <p className="text-sm">Connection Status: Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex mb-4 ${
                    msg.sender === currentUser._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg shadow-md font-semibold ${
                      msg.sender === currentUser._id
                        ? 'bg-yellow-200 text-gray-800'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="flex items-center p-4 border-t">
              <input
                type="text"
                className="flex-1 p-3 bg-gray-500 text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start Writing your message here"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 border border-gray-300">
            <p>Select a client to start chatting</p>
          </div>
        )}
      </div>
     </div>
    </div>
  );
};

export default Message;
