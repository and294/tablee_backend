const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  message: String,
  roomId: String,
  user: String,
  date: {}
});

const Message = mongoose.model("messagesToSend", messageSchema);

module.exports = Message;
