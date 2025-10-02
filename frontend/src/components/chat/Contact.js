import { useState, useEffect } from "react";
import { getUser } from "../../services/ChatService";
import UserLayout from "../layouts/UserLayout";

export default function Contact({ chatRoom, onlineUsersId, currentUser }) {
  console.log("Entered this function:");
  const [contact, setContact] = useState(null);
  const [error, setError] = useState(null);

useEffect(() => {
  console.log("Entered this page:");
  if (!chatRoom || !Array.isArray(chatRoom.members) || !currentUser || !currentUser.uid) {
    console.debug('[Contact] Skipping effect - missing data', { chatRoom, currentUser });
    return;
  }

  const contactId = chatRoom.members.find(m => {
    if (!m) {
      console.log("printing chatroom:",chatRoom);
      console.log("m hi nhi h\n");
      return false;
    }             // <--- guard against null/undefined
    const id = typeof m === 'object' ? m.uid : m;
    return id && id !== currentUser.uid;
  });

  if (!contactId) {
    console.debug('[Contact] No valid contact found in', chatRoom.members);
    return;
  }
  console.log("ContactID:",contactId);

  const fetchData = async () => {
    try {
      console.log("ContactID:",contactId);
      const res = await getUser(contactId || contactId.uid);
      console.log("printing res from contactID:",res);
      setContact(res);
    } catch (err) {
      console.error('[Contact] Error fetching user:', err);
      setError('Failed to load contact');
    }
  };

  fetchData();
}, [chatRoom, currentUser]);



  if (!currentUser) {
  return <div className="px-3 py-2 text-gray-500">Waiting for auth...</div>;
}

if (error) {
  return <div className="px-3 py-2 text-red-500">Error loading contact</div>;
}

if (!contact) {
  return <div className="px-3 py-2 text-gray-500">Loading contact...</div>;
}

return <UserLayout user={contact} onlineUsersId={onlineUsersId} />;


}
