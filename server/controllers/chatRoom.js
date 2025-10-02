import ChatRoom from "../models/ChatRoom.js";

export const createOrGetChatRoom = async (req, res) => {
  console.log("senderId:",req.body.senderId);
  const newChatRoom = new ChatRoom({
    members: [req.body.senderId, req.body.receiverId],
  });
  console.log("entered In backend:",newChatRoom);
  try {
    await newChatRoom.save();
    console.log("saved In backend:",newChatRoom,"\nthis response should be the same in frontend");
    res.status(201).json(newChatRoom);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const getChatRoomOfUser = async (req, res) => {
  try {
    console.log("printing req in getChatRoomofUser:",req.params.userId);
    const chatRoom = await ChatRoom.find({
      members: { $in: [req.params.userId] },
    });
    // console.log("returning chatRoom:",chatRoom);
    res.status(200).json(chatRoom);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const getChatRoomOfUsers = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.find({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(chatRoom);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};
