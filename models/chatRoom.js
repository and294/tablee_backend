const mongoose = require("mongoose");

const chatRoomSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  id: String,
  name: String,
  messages: [],
});

const ChatRoom = mongoose.model("messages", chatRoomSchema);

module.exports = ChatRoom;
