import { useEffect, useRef, useState } from "react";

import {
  getAllUsers,
  getChatRooms,
  initiateSocketConnection,
} from "../../services/ChatService";
import { useAuth } from "../../contexts/AuthContext";

import ChatRoom from "../chat/ChatRoom";
import Welcome from "../chat/Welcome";
import AllUsers from "../chat/AllUsers";
import SearchUsers from "../chat/SearchUsers";

export default function ChatLayout() {
  const [users, SetUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentChat, setCurrentChat] = useState();
  const [onlineUsersId, setonlineUsersId] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isContact, setIsContact] = useState(false);

  const socket = useRef(null);

  const { currentUser } = useAuth();

  // 🔹 Fetch users + socket setup
  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        SetUsers(users || []);
        setFilteredUsers(users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        SetUsers([]);
        setFilteredUsers([]);
      }
    };

    const getSocket = async () => {
      try {
        const res = await initiateSocketConnection();
        socket.current = res;

        // ✅ Debugging: log socket ID
        socket.current.on("connect", () => {
          console.log("✅ Socket connected with ID:", socket.current.id);
          // Register current user with backend
          socket.current.emit("addUser", currentUser.uid);
        });

        socket.current.on("disconnect", () => {
          console.warn("⚠️ Socket disconnected");
        });

        socket.current.on("getUsers", (users) => {
          const userId = users.map((u) => u[0]);
          setonlineUsersId(userId);
        });
      } catch (error) {
        console.error("Error connecting to socket:", error);
      }
    };

    fetchUsers();
    getSocket();

    // 🔹 cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        console.log("🔌 Socket disconnected on cleanup");
      }
    };
  }, [currentUser]);

  // 🔹 Fetch chat rooms
  useEffect(() => {
    if (!currentUser) return;

    const fetchChatRooms = async () => {
      try {
        const res = await getChatRooms(currentUser.uid);
        setChatRooms(res || []);
        setFilteredRooms(res || []);
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
        setChatRooms([]);
        setFilteredRooms([]);
      }
    };

    fetchChatRooms();
  }, [currentUser]);

  // 🔹 Sync filtered lists when base data changes
  useEffect(() => {
    setFilteredUsers(users);
    setFilteredRooms(chatRooms);
  }, [users, chatRooms]);

  // 🔹 Toggle between users and rooms
  useEffect(() => {
    if (isContact) {
      setFilteredUsers([]);
    } else {
      setFilteredRooms([]);
    }
  }, [isContact]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  const handleSearch = (newSearchQuery) => {
    setSearchQuery(newSearchQuery);

    const searchedUsers = users.filter((user) => {
      return user.displayName
        .toLowerCase()
        .includes(newSearchQuery.toLowerCase());
    });

    const searchedUsersId = searchedUsers.map((u) => u.uid);

    if (chatRooms.length !== 0) {
      chatRooms.forEach((chatRoom) => {
        const isUserContact = chatRoom.members.some(
          (e) => e !== currentUser.uid && searchedUsersId.includes(e)
        );
        setIsContact(isUserContact);

        isUserContact
          ? setFilteredRooms([chatRoom])
          : setFilteredUsers(searchedUsers);
      });
    } else {
      setFilteredUsers(searchedUsers);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="min-w-full bg-white border-x border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded lg:grid lg:grid-cols-3">
        <div className="bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 lg:col-span-1">
          <SearchUsers handleSearch={handleSearch} />

          <AllUsers
            users={searchQuery !== "" ? filteredUsers : users || []}
            chatRooms={searchQuery !== "" ? filteredRooms : chatRooms || []}
            setChatRooms={setChatRooms}
            onlineUsersId={onlineUsersId || []}
            currentUser={currentUser}
            changeChat={handleChatChange}
          />
        </div>

        {currentChat ? (
          <ChatRoom
            currentChat={currentChat}
            currentUser={currentUser}
            socket={socket}
          />
        ) : (
          <Welcome />
        )}
      </div>
    </div>
  );
}
