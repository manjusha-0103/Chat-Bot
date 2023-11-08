import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
  TextInput,

} from "react-native";

import * as Speech from "expo-speech";
import { Fontisto } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import { Entypo } from "@expo/vector-icons";
import {apiCall, audioApiCall} from '../openaiapi'
import { Alert } from "react-native";
//import Voice from "@react-native-community/voice";
import { Permissions } from "expo";
import axios from "axios";
import Voice from "@react-native-voice/voice";
import { Audio } from "expo-av";
import OpenAI from "openai";
import FileSystem from 'expo-file-system'
import * as Clipboard from 'expo-clipboard';

const dummyMessages = [
  {
    role: "user",
    content: "How are you?",
  },
  {
    role: "assistant",
    content: "I'm fine, How may i help you today.",
  },
  {
    role: "user",
    content: "create an image of a dog playing with cat",
  },
  {
    role: "assistant",
    content:
      "https://storage.googleapis.com/pai-images/ae74b3002bfe4b538493ca7aedb6a300.jpeg",
  },
];


const Home = () => {
  const scrollViewRef = useRef();

  const [openMenu, setOpenMenu] = useState(false);
  const [isrecording, setIsrecording] = useState(false);
  const [recorddata, setRecordData] = useState();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [recordtext, setRecordText] = useState("");
  const [menu, setMenu] = useState(false)

  // const speechStartHandler = async(e) => {
  //     console.log("speech start event", e);
  // };
  // const speechEndHandler = async(e) => {
  //     setIsrecording(false);
  //     console.log("speech stop event", e);
  // };
  // const speechResultsHandler = async(e) => {
  //     console.log("speech event: ", e);
  //     const text = e.value[0];
  //     setRecordData(text);
  // };

  // const speechErrorHandler = async(e) => {
  //     console.log("speech error: ", e);
  // };
  const startRecording = async () => {
    try {
      setIsrecording(!isrecording);
      console.log("started")
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
     
        setRecordData(recording);
        //await recording.startAsync()
        console.log("uri : ",recording.getURI())
        //await speechToText(recording)
        
        
         // await recording.stopAndUnloadAsync()
          // const uri = recording.getURI()
          // const openai = new OpenAI({
          //   apiKey: apikey, 
          // })
          // const transcription = openai.audio.transcriptions.create({
          //   file : uri,
          //   model : "whisper-1",

          // })
          // console.log(transcription.text)
           const uri = recording.getURI();
           console.log(uri)
          // const filetype = uri.split(".").pop();
          // let filename = uri.split("/").pop();
          // //filename = filename.split(".").slice(0,-1)

          // const formData = new FormData();
          // formData.append('file', {
          //   uri,
          //   type: 'audio/m4a',
          //   name: filename,
          // });
          // formData.append('model', 'whisper-1');

  
          // const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
          //   headers: {
          //     Authorization: `Bearer ${apikey}`,
          //     'Content-Type': 'multipart/form-data',
          //   },
          //   });
          const response = await audioApiCall(uri)
                console.log(response)
                //setRecordData(undefined);
                await startRecording()
        }
       
            
      
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  };
  const toggleListening = async () => {
    //console.log("Voice object:", Voice);
    try {
      if (isrecording) {
        console.log("Mic Off")
        setRecordData(undefined);
        await recorddata.stopAndUnloadAsync();
        setIsrecording(!isrecording);
        //await Voice.stop();
        //setIsrecording(false);
        //setRecordText("");
        //setRecordData("");       
      }
      else {
        try{
          //await Voice.start("en-US");
          await startRecording();
        }
        catch(error){
          console.error("Failed to start recording", error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateScrollView = () => {
    setTimeout(() => {
      scrollViewRef?.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const startTextToSpeach = async (textt) => {
    try {
      if (!textt.content.includes("https")) {
        Speech.speak(textt.content);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleInput = async () => {
    if (inputText) {
      try {
        Speech.stop();
        let newMessages = [...messages];
        newMessages.push({ role: "user", content: inputText });
        setMessages([...newMessages]);
        updateScrollView();

        apiCall(inputText.trim(), newMessages).then((res) => {
          console.log("got api data");
          //setLoading(false);
          if (res.success) {
            setMessages([...res.data]);
            setInputText("");
            updateScrollView();

            // now play the response to user
            startTextToSpeach(res.data[res.data.length - 1]);
          } else {
            console.log(res.msg);
            Alert.alert("Error", res.msg);
          }
        });
      } catch (error) {
        console.log("*****************************", error);
      }
    } else {
      try {
        Speech.stop();
        setInputText("");
        let newMessages = [...messages];
        newMessages.push({ role: "user", content: recordtext });
        setMessages([...newMessages]);
        updateScrollView();

        apiCall(recordtext.trim(), newMessages).then((res) => {
          console.log("got api data");
          //setLoading(false);
          if (res.success) {
            setMessages([...res.data]);
            setRecordText("");
            updateScrollView();

            // now play the response to user
            startTextToSpeach(res.data[res.data.length - 1]);
          } else {
            console.log(res.msg);
            Alert.alert("Error", res.msg);
          }
        });
      } catch (error) {
        console.log("*****************************", error);
      }
    }
  };
  const getPreviosData = async () => {
    try {
      updateScrollView();
      const res = await axios.get("http://10.0.2.2:8000/home");
      if (res.data.success) {
        console.log(res.data.msg);
        //console.log(res.data.data)
        setMessages(res.data.data);
      } else {
        console.log(res.data.msg);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const clearMessages = async () => {
    try {
      const res = await axios.get("http://10.0.2.2:8000/clearallmessages");
      if (res.data.success) {
        Alert.alert(res.data.msg);
        console.log(res.data.msg);
      } else {
        Alert.alert(res.data.msg);
        console.log(res.data.msg);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const makesound = async(e) =>{
    try{
      if (e) {
        Speech.speak(e);
      }
    }
    catch(error){
      console.log(error)
    }
  }
  const copyToClipboard = async (e) => {
    try{
      await Clipboard.setStringAsync(e);
      Alert.alert("Coppied");
    }catch(error){
      console.log(error)
    }
  };
  useEffect(() => {
    getPreviosData();
    // voice handler events
    // Voice.onSpeechStart = speechStartHandler;
    // Voice.onSpeechEnd = speechEndHandler;
    // Voice.onSpeechResults = speechResultsHandler;
    // Voice.onSpeechError = speechErrorHandler;

    // return () => {
    //   // destroy the voice instance after component unmounts
    //   Voice.destroy().then(Voice.removeAllListeners);
    // };
  }, []);

  return (
    <SafeAreaView
      style={{
        backgroundColor: "black",
        paddingVertical: 10,
        height: "100%",
        marginTop: 20,
        flexDirection: "coloumn",
      }}
    >
      <View style={{ height: "15%", marginBottom: 20 }}>
        <View
          style={{
            height: 60,
            width: "100%",
            backgroundColor: "#573cc2",
            paddingVertical: 10,
            paddingHorizontal: 10,
            position: "absolute",
            flexDirection: "row",
            alignItems: "center",
            gap: 75,
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: "white",
            }}
          >
            Ask Anything to Bot...
          </Text>
          <Pressable
            onPress={() => {
              setOpenMenu(!openMenu);
            }}
          >
            <Entypo name="dots-three-vertical" size={24} color="white" />
          </Pressable>
          {openMenu && (
            <>
              <View
                style={{
                  position: "absolute",
                  backgroundColor: "black",
                  height: 200,
                  width: 200,
                  opacity: 0.8,
                  right: 40,
                  top: 0.5,
                  borderRadius: 5,
                  padding: 10,
                  flexDirection: "coloumn",
                  gap: 10,
                }}
              >
                <Pressable onPress={clearMessages}>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 18,
                      fontWeight: 500,
                    }}
                  >
                    Clear all mesasges
                  </Text>
                </Pressable>

                <Pressable>
                  <Text
                    style={{ color: "white", fontSize: 18, fontWeight: 500 }}
                  >
                    Delete
                  </Text>
                </Pressable>
                <Pressable>
                  <Text
                    style={{ color: "white", fontSize: 18, fontWeight: 500 }}
                  >
                    Settings
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            height: "80%",
            paddingHorizontal: 10,
          }}
        >
          {messages.map((item, idx) => {
            if (item.role == "assistant") {
              if (item.content.startsWith("https")) {
                return (
                  <>
                    <View
                      key={idx}
                      style={{
                        maxWidth: "60%",
                        backgroundColor: "rgb(30 88 122)",
                        marginVertical: 10,
                        height: "fit-content",
                        padding: 10,
                        width: "fit-content",
                        borderTopRightRadius: 10,
                        borderBottomRightRadius: 10,
                        borderBottomLeftRadius: 0,
                        borderTopLeftRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",

                        //alignSelf: item.role === "user" && "flex-end",
                      }}
                    >
                      <Image
                        key={idx}
                        source={{ uri: item.content }}
                        style={{
                          height: 200,
                          width: 200,
                          resizeMode: "contain",
                        }}
                      />
                    </View>
                  </>
                );
              } else {
                return (
                  <>
                    
                    <View
                      onLongPress={()=>{setMenu(!menu)}}
                      key={idx}
                      style={{
                      
                        maxWidth: "80%",
                        backgroundColor: "rgb(30 88 122)",
                        marginVertical: 10,
                        height: "fit-content",
                        padding: 10,
                        width: "fit-content",
                        marginRight: 100,
                        borderTopRightRadius: 10,
                        borderBottomRightRadius: 10,
                        borderBottomLeftRadius: 0,
                        borderTopLeftRadius: 10,
                      }}
                    >
                      {menu&&
                      <>
                        <View key ={idx}
                          style ={{
                              position : "absolute",
                              flexDirection : "row",
                              alignItems : "center",
                              justifyContent: 'space-around',
                              backgroundColor : "#231b30",
                              width : 150,
                              height : 40,
                              padding : 5,
                              marginLeft : 20,
                              borderRadius : 5,
                              top : -30
                          }}
                        >
                          <Foundation name="sound" size={30} color="gray" onPress={()=>{makesound(item.content)}}/>
                          <MaterialIcons name="delete" size={30} color="gray" />
                          <MaterialIcons name="content-copy" size={24} color="gray" onPress={()=>{copyToClipboard(item.content)}}/>
                        </View>
                      </>
                    }
                      <Text
                        style={{
                          color: "white",
                          fontSize: 15,
                          fontWeight: "600",
                        }}
                        key={idx}
                      >
                        {item.content}
                      </Text>
                    </View>
                  </>
                );
              }
            } else {
              return (
                <>
                  
                  <View
                    onLongPress={()=>{setMenu(!menu)}}
                    key={idx}
                    style={{
                      maxWidth: "80%",
                      backgroundColor: "rgb(26 60 128)",
                      marginVertical: 10,
                      height: "fit-content",
                      padding: 10,
                      width: "fit-content",
                      marginRight: 0,
                      borderTopRightRadius: 10,
                      borderBottomRightRadius: 0,
                      borderBottomLeftRadius: 10,
                      borderTopLeftRadius: 10,
                      alignSelf: "flex-end",
                    }}
                  >
                    {menu&&
                      <>
                        <View key ={idx}
                          style ={{
                              position : "absolute",
                              flexDirection : "row",
                              alignItems : "center",
                              justifyContent: 'space-around',
                              backgroundColor : "#231b30",
                              width : 100,
                              height : 40,
                              padding : 5,
                              right : 20,
                              borderRadius : 5,
                              top : -30
                              
                          }}
                        >
                          <MaterialIcons name="delete" size={30} color="gray" />
                          <MaterialIcons name="content-copy" size={24} color="gray" onPress={()=>{copyToClipboard(item.content)}}/>
                        </View>
                      </>
                    }
                    <Text
                      style={{
                        color: "white",
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                      key={idx}
                    >
                      {item.content}
                    </Text>
                  </View>
                </>
              );
            }
          })}
        </View>
      </ScrollView>
      {inputText || recordtext && (
        <View
          style={{
            width: "80%",
            height: "fit-content",
            backgroundColor: "rgb(111 77 169)",
            borderTopLeftRadius: 50,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            paddingLeft: 20,
            padding: 10,
            margin: 10,
            opacity: 0.8,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 15,
              fontWeight: "600",
            }}
          >
            {inputText || recordtext}
          </Text>
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          height: "10%",
          paddingHorizontal: 10,
          gap: 10,
          marginBottom: 10,
        }}
      >
        <TextInput
          style={{
            width: "80%",
            height: 50,
            backgroundColor: "#212121",
            borderRadius: 10,
            paddingHorizontal: 10,
            fontSize: 20,
            fontWeight: "600",
            color: "#a9a9ab",
          }}
          value={inputText}
          onChangeText={(t) => {
            setInputText(t);
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#573cc2",
            width: "17%",
            height: 50,
            borderRadius: 50,
            alignItems: "center",
            paddingVertical: 10,
          }}
          onPress={inputText ? handleInput : toggleListening}
        >
          {inputText ? (
            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: "white",
              }}
            >
              Send
            </Text>
          ) : (
            <>
              {isrecording ? (
                <Fontisto name="mic" size={28} color="black" />
              ) : (
                <FontAwesome5 name="microphone-slash" size={28} color="black" />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
export default Home;
