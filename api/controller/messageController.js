const Messages = require('../modals/messages')

const controllMessage = async(req,res)=>{
    try{
        const msg = req.body.Messages;
        const query = await Messages.insertMany(msg)
    }
    catch(error){
        console.log(error)
    }
}

module.exports={
    controllMessage,
}