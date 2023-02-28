const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  date: Date,
  message: String,
});

const Message = mongoose.model("messages", messageSchema);

module.exports = Message;
