const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
//const crypto = require('crypto');
// const nodemailer = require("nodemailer")
const cors = require('cors');
const dotenv = require('dotenv')
const Messages = require('./modals/messages')
const OpenAI = require("openai")
const fs = require("fs")

const apikey = process.env.API_KEY ||"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"

dotenv.config({});


const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));


// var corsOptions = {
//     origin: 'http://192.168.0.106:19000',
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser : true,
    useUnifiedTopology :true
}).then(()=>{console.log("Connected MongoDB");
}).catch((err)=>{
    console.log("Error in connecting MongoDb");
})

app.listen(port,()=>{
    console.log(`Server running on port : ${port}`);
})

//endpoints for calling ova
//app.use('/',require('./routes/messsageRout'))
app.post('/home',async(req,res)=>{
    try{
        console.log(req.body)
        const messages = req.body;
       
        for (const message of messages) {
            await Messages.create(message);
        }
 
        res.status(201).send({
            success : true, 
            msg : "data added"        
        })    
          
    }
    catch(error){
        console.log('error : ', error)
        return res.status(200).send({
            msg :'data is not added',
            success : false
        });
    }
})

app.get('/home', async(req,res)=>{
    try{
        const messg = await Messages.find()
        const arrayMessages = messg.map(item => ({
            role: item.role,
            content: item.content,
        }));
        if(messg){
            res.status(201).send({
                success : true,
                realData : messg,
                data : arrayMessages,
                msg : "got previous data"
            })
        }
        else{
            res.status(200).send({
                success : false,
                msg : "no previous data found"
            })
        }
    }catch(error){
        console.log(error)
    }
})

app.get("/clearallmessages",async(req,res)=>{
    try{
        const cursor = await Messages.deleteMany({});
        if(cursor){
            res.status(200).send({
                success : true,
                msg : 'deleted all messages'
            })
        }
        else{
            res.status(404).send({
                success : false,
                msg : 'unsucessfull for deleting messages'
            })
        }
    }
    catch(error){
        console.log(error);
    }
})

app.post("/callaudioapi",async(req,res)=>{
    try{
        const uri = req.body.uri
        const Openai = new OpenAI({
            apiKey : apikey
        })
        const transcription = await Openai.audio.transcriptions.create({
            file : uri,
            model : 'whisper-1'
        })
        if(transcription.text){
            res.status(201).send({
                success : true,
                txt : transcription.text,
                msg : "got transcription"
            })
        }
        else{
            res.status(201).send({
                success : false,
                msg : "doesn't got transcription"
            })
        }

    }
    catch(error){
        console.log(error)
    }
})