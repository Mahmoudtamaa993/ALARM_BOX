import { ETwitterStreamEvent, TweetStream, TwitterApi } from 'twitter-api-v2'
import dotenv from 'dotenv'
import { playDummySound,playShipHorn } from './src/sound-control'
import {OSCClient, OSCType, OSCServer} from 'ts-osc';
dotenv.config()
const textToSpeech = require('@google-cloud/text-to-speech');
require('dotenv').config();
// Import other required libraries
const fs = require('fs');
const util = require('util');
// Creates a client
const client = new textToSpeech.TextToSpeechClient();
async function downloadSpeech(atext:string) {
  var regexp = /#(\S)/g;
  const textWithoutHashtags = atext.replace(regexp, '$1');
  
  // Construct the request
  const request = {
    
    input: {text: textWithoutHashtags},
    // Select the language and SSML voice gender (optional)
    voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
    // select the type of audio encoding
    audioConfig: {audioEncoding: 'LINEAR16'},
  };

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile('output.wav', response.audioContent, 'binary');
  console.log('Audio content written to file: output.wav');
}

// Instanciate with desired auth type (here's Bearer v2 auth)
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN as string)

let stream: TweetStream | null = null

async function startStream () {
  try {
    stream = await twitterClient.v2.searchStream()
    console.log('Stream was intialized!')

    stream.on(ETwitterStreamEvent.Data, eventData => {
      const { text } = eventData.data

      console.log(`tweet text = "${text}"`)

      if (text.includes('🆘') || text.includes('SOS')|| text.includes('🚩')|| text.includes('🔴'))   {
        if  (text.includes('vite') || text.includes('personas')) {
          // Spansih
          console.log('Spain Tweet')
        } else if ((text.includes('persone'))){
          console.log('it Tweet')  
        }
        else{
          // English
          console.log('THIS IS A SOS CALL; TRIGGER THE ALARM!!!!!!!!')
          // let regexp = /(\d+)\speople/;
          // let matchAll = text.match(regexp);
          // console.log(matchAll[1]); // check if it's null

          let regexp = /(\d+)\speople/g;

          let matchAll = [...text.matchAll(regexp)];

          console.log(matchAll[0][1]);
          const now = new Date();
          let test=now.getMonth() +1
          let test1=now.getFullYear()
          let test2=now.getUTCDate()
          console.log(test)
          console.log(test1)
          console.log(test2)
          const client = new OSCClient("localhost", 8000);

          client.send('/hello', OSCType.Integer, test);

          const server = new OSCServer("0.0.0.0", 8000);

          server.on('message', (msg)=>{
              console.log(msg);
          })

          


          // downloadSpeech(text).then(()=>{
          //   // Filter the text to words and send them with OSC
          //   let PeopleNumber: RegExp= (\d+)\speople;
          //   let getNumber= peopleNumber.test(text);
          //   console.log(getNumber)

          // //   Play Noise and Tweet
          // //   playShipHorn().then(()=>{
          // //     playDummySound()
          // //   })
          // });        
        }
      } else {
        console.log('we have no interest in this tweet.')
      }
    })

    // Awaits for a tweet
    stream.on(
      // Emitted when Node.js {response} emits a 'error' event (contains its payload).
      ETwitterStreamEvent.ConnectionError,
      err => console.log('Connection error!', err)
    )

    stream.on(
      // Emitted when Node.js {response} is closed by remote or using .close().
      ETwitterStreamEvent.ConnectionClosed,
      () => console.log('Connection has been closed.')
    )

    stream.on(
      // Emitted when a Twitter sent a signal to maintain connection active
      ETwitterStreamEvent.DataKeepAlive,
      () => console.log('Twitter has a keep-alive packet.')
    )

    // Enable reconnect feature
    stream.autoReconnect = true
  } catch (err) {
    console.log('Stream  init error')
    console.error(err)
  }
}

async function closeStream () {
  if (stream) {
    stream.close()
  }
}

startStream()


// Enable graceful stop
process.once('SIGINT', closeStream)
process.once('SIGTERM', closeStream)


