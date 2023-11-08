const express = require('express');
const Messages = require('../modals/messages')
const router = express.Router();
const {
    controllMessages
} = require('../controller/messageController');

router.post('/home', async(req,res)=>{
    try{
        const {user,content} = req.body
        console.log(msg)
      
        console.log(msg);
        const cursor =  new Messages({user,content});
            
        if(cursor){
            await cursor.save()
            const messg = await Messages.find()
            if(messg){
                res.status(201).send({
                    success : true,
                    data : messg,            
                })    
            }
            else{
                return res.status(200).send('data is not there');
            }  
        }
        else{
            res.status(201).send({
                success : false,
                msg : "data is not addede"
            })
        }
        
    }
    catch(error){
        console.log('error : ', error)
    }
});


module.exports = router;