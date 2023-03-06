var express = require("express");
const ChatRoom = require("../models/chatRoom");
var router = express.Router();

// recupère les conversations de l'utilisateur
router.get("/rooms", (req, res) => {
    ChatRoom.find()
    .then(data => {
        if(data){
            res.json({rooms: data})
        } else {
            res.json({rooms: 'No room found'})
        }
    })
})

// création d'une nouvelle conversation
router.post("/newRoom", (req, res) => {
    const {id, name} = req.body
    ChatRoom.findOne({id: req.body.id})
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
})

module.exports = router;
