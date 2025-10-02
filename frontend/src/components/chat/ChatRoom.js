import { useState, useEffect, useRef } from "react";
import { getMessagesOfChatRoom, sendMessage } from "../../services/ChatService";
import Message from "./Message";
import Contact from "./Contact";
import ChatForm from "./ChatForm";

export default function ChatRoom({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  // Load existing messages when chat room changes
  useEffect(() => {
    const fetchData = async () => {
      if (!currentChat?._id) return;
      const res = await getMessagesOfChatRoom(currentChat._id);
      setMessages(res || []);
    };
    fetchData();
  }, [currentChat]);

  // Join/Leave socket room when chat changes
  useEffect(() => {
    if (!socket.current || !currentChat?._id) return;

    console.log(`🔵 Joining room: ${currentChat._id}`);
    socket.current.emit("joinRoom", currentChat._id);

    return () => {
      if (socket.current && currentChat?._id) {
        console.log(`🔴 Leaving room: ${currentChat._id}`);
        socket.current.emit("leaveRoom", currentChat._id);
      }
    };
  }, [currentChat, socket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for incoming messages (AI + other users)
  useEffect(() => {
    if (!socket.current) return;
    const sock = socket.current;

    console.log("✅ Socket ready in ChatRoom, ID:", sock.id);

    const handleNewMessage = (data) => {
      if (data.sender.uid === currentUser.uid) return;
      console.log("📩 newMessage received:", data);
      setMessages((prev) => [...prev, data]);
    };

    // always listen
    sock.on("newMessage", handleNewMessage);

    // cleanup when leaving/unmount
    return () => {
      sock.off("newMessage", handleNewMessage);
    };
  }, [socket, currentChat?._id]);

  // Sending a message
  const handleFormSubmit = async (message) => {
    if (!message.trim()) return;

    const newMsg = {
      chatRoomId: currentChat._id,
      sender: currentUser.uid,
      message,
      createdAt: new Date().toISOString(),
    };

    // Optimistically show it
    setMessages((prev) => [...prev, newMsg]);

    try {
      await sendMessage(newMsg);
    } catch (err) {
      console.error("❌ Send failed:", err);
    }
  };

  return (
    <div className="lg:col-span-2 lg:block">
      <div className="w-full">
        {/* Chat header */}
        <div className="p-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <Contact chatRoom={currentChat} currentUser={currentUser} />
        </div>

        {/* Chat messages */}
        <div className="relative w-full p-6 overflow-y-auto h-[30rem] bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <div key={index} ref={scrollRef}>
                <Message message={message} self={currentUser.uid} />
              </div>
            ))}
          </ul>
        </div>

        {/* Chat form */}
        <ChatForm handleFormSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}
