const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
    {   role : {
            type :String,
            required : true
        },
        content :{
            type:String,
            required : true
        }
    },
    {timestamp  : true}
)

const Messages = mongoose.model("Messages",messageSchema);
module.exports = Messages