var express = require("express");
const ChatRoom = require("../models/chatRoom");

const User = require("../models/users");
var router = express.Router();

// recupère les conversations de l'utilisateur
router.get("/rooms", (req, res) => {
  ChatRoom.find().then((data) => {
    if (data) {
      res.json({ rooms: data });
    } else {
      res.json({ rooms: "No room found" });
    }
  });
});

// création d'une nouvelle conversation
/*router.post("/newRoom", (req, res) => {
    const {id, name} = req.body
               ChatRoom.findOne({id: id})
    .then(data => {
       if(data) {
        res.json({error: 'ChatRoom already exists'})
       } else {
        const newRoom = new ChatRoom({
            id: id,
            name: name,
            messages: []
        })
        newRoom.save().then(data => {
            res.json({rooms: data})
        })
       }
    }) 
})*/

//Envoi de message
router.post("/send", (req, res) => {
  const { user, roomId, date, message } = req.body;
  ChatRoom.updateOne(
    { id: req.body.roomId },
    {
      $push: {
        messages: {
          message: message,
          roomId: roomId,
          user: user,
          date: { date },
        },
      },
    }
  ).then((data) => {
    res.json({ room: data });
  });
});

//Envoi de message
router.post("/sendForSocket", (req, res) => {
  const { user, roomId, date, message } = req.body;
  ChatRoom.updateOne(
    { id: req.body.roomId },
    {
      $push: {
        messages: {
          message: message,
          roomId: roomId,
          user: user,
          date: { date },
        },
      },
    }
  ).then((data) => {
    console.log(roomId);
    ChatRoom.findOne({ id: req.body.roomId }).then((data) => {
      res.json({ data: data.messages[data.messages.length - 1] });
    });
  });
});

//Render les messages dans la room
router.get("/chatRoom/:roomId", (req, res) => {
  const { roomId } = req.params;
  ChatRoom.findOne({ id: roomId }).then((data) => {
    if (data) {
      res.json({ chat: data.messages });
    } else {
      res.json({ error: "Nothing found" });
    }
  });
});

module.exports = router;
