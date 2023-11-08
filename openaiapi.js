
import  axios from 'axios';

// apiKey = "YOUR_API_KEY"
//const chatgpturl = "https://api.openai.com/v1/chat/completions"; //'https://api.openai.com/v1/engines/text-davin'

// const client = axios.create({
//     headers: {
//         Authorization: "Bearer " + apiKey,
//         "Content-Type": "application/json",
//     }
// })


// export const apiCall = async(prompt,messages) =>{
//     try{
//         const res = await client(chatgpturl,{
//             model: "gpt-3.5-turbo",
//             messages
//         })
//         let answer = res.data?.choices[0]?.message?.content;
//         messages.push({role: 'assistant', content: answer.trim()});
//         // console.log('got chat response', answer);
//         return Promise.resolve({success: true, data: messages}); 
//     }
//     catch(err){
//         console.log('error: ',err);
//         return Promise.resolve({success: false, msg: err.message});
//     }
// }
const chatgptUrl = 'https://api.openai.com/v1/chat/completions';
const dalleUrl = 'https://api.openai.com/v1/images/generations';

const apiCall = async (prompt, messages)=>{
    
    // // Logic 1 : this will check the prompt from chatgpt if user wants to create an image
    try{
        // const res = await client.post(chatgptUrl, {
        //     model: "gpt-3.5-turbo",
        //     messages: [{
        //         role: 'user',
        //         content: `Does this message want to generate an AI picture, image, art or anything similar? ${prompt} . Simply answer with a yes or no.`
        //     }]
        // });
        // var isArt = res.data?.choices[0]?.message?.content;
        prompt = prompt.toLowerCase();
        var isArt = prompt.includes('image' ||'images') || prompt.includes('sketch'||'sketches') || prompt.includes('art'||'arts') || prompt.includes('picture'||'picture') || prompt.includes('drawing') || prompt.includes('photo'||'photos')|| prompt.includes('pic'||'pics');
        //isArt = isArt.trim();
        if(isArt){
            console.log('dalle api call');
            return dalleApiCall(prompt, messages)
        }else{
            console.log('chatgpt api call')
            return chatgptApiCall(prompt, messages);
        }

    }catch(err){
        console.log('error :-> ',err);
        return Promise.resolve({success: false, msg: err.message});
    }

    // // Logic 2 : sometimes chatgpt does not understand the art messages but thats fine, you can use this approach :)

    // prompt = prompt.toLowerCase();
    // let isArt = prompt.includes('image') || prompt.includes('sketch') || prompt.includes('art') || prompt.includes('picture') || prompt.includes('drawing');
    // if(isArt){
    //     console.log('dalle api call');
    //     return dalleApiCall(prompt, messages)
    // }else{
    //     console.log('chatgpt api call')
    //     return chatgptApiCall(prompt, messages);
    // }
    
}

const chatgptApiCall = async (prompt, messages)=>{
    try{
        const res = await axios.post(chatgptUrl, {
            model: "gpt-3.5-turbo",
            messages
        },{
            headers: {
                Authorization: "Bearer " + apiKey,
                "Content-Type": "application/json",
            }
        })

        let answer = res.data?.choices[0]?.message?.content;
        messages.push({role: 'assistant', content: answer.trim()});
        // console.log('got chat response', answer);
        
        let backmsg = await sendBack(messages)
        console.log(backmsg)
        
        return Promise.resolve({success: true, data: messages}); 

    }catch(err){
        console.log('chatgptApiCall error: ',err);
        return Promise.resolve({success: false, msg: err.message});
    }
}

const dalleApiCall = async (prompt, messages)=>{
    try{
        const res = await axios.post(dalleUrl, {
            prompt,
            n: 1,
            size: "512x512"
        },{
            headers: {
                Authorization: "Bearer " + apiKey,
                "Content-Type": "application/json",
            }
        })

        let url = res?.data?.data[0]?.url;

        // console.log('got image url: ',url);
        messages.push({role: 'assistant', content: url});

        await sendBack(messages)
        
        return Promise.resolve({success: true, data: messages});

    }catch(err){
        console.log('dalleApiCall error: ',err);
        return Promise.resolve({success: false, msg: err.message});
    }
}

const sendBack = async(messages) =>{
    try{
        //backend call
        // console.log(messages)
        // const msgData ={
        //     user : messages.role,
        //     content : messages.content
        // }
        //console.log(JSON.stringify(msgData));
        const response = await axios.post("http://10.0.2.2:8000/home",messages);
        if(response.data.success){
            console.log(response.data.msg)
        }
        else{
            console.log(response.data.msg)
            //return response.data
            
        }
    }catch(error){
        console.log("Error => ",error)
        //return error
    }
}

const audioApiCall = async(uri) =>{
    try{
        // const uri = recording.getURI();
        //   const filetype = uri.split(".").pop();
        //   let filename = uri.split("/").pop();
        //   //filename = filename.split(".").slice(0,-1)

        //   const formData = new FormData();
        //   formData.append('file', {
        //     uri,
        //     type: 'audio/m4a',
        //     name: filename,
        //   });
        //   formData.append('model', 'whisper-1'); 

        // const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        //     headers: {
        //     'Authorization': `Bearer ${apiKey}`,
        //     'Content-Type': 'multipart/form-data'
        //     }
        // });
        const dta = {
            uri
        }
        const res = await axios.post("http://10.0.2.2:8000/callaudioapi",dta)
        if (res.data.success ) {
            const textt = res.data.txt;
            console.log(res.data.msg, textt);
            return {"success" : true, "text" : textt};
        } else {
            console.error('Error processing audio', response.data);
            return {success : fasle};
    
        }

    }
    catch(error){
        console.log("Audio api error : ", error)
    }
}

module.exports = {
    apiCall,
    audioApiCall
}
