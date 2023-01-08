import { ETwitterStreamEvent, TweetStream, TwitterApi } from 'twitter-api-v2'
import dotenv from 'dotenv'
import { playDummySound, playShipHorn } from './src/sound-control'
import { OSCClient, OSCType, OSCServer } from 'ts-osc';
import { Tesseract } from "tesseract.ts";
dotenv.config()
const textToSpeech = require('@google-cloud/text-to-speech');
require('dotenv').config();
// Import other required libraries
const fs = require('fs');
const util = require('util');
// Creates a client
const client = new textToSpeech.TextToSpeechClient();
async function downloadSpeech(atext: string) {
  var regexp = /#(\S)/g;
  const textWithoutHashtags = atext.replace(regexp, '$1');

  // Construct the request
  const request = {

    input: { text: textWithoutHashtags },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
    // select the type of audio encoding
    audioConfig: { audioEncoding: 'LINEAR16' },
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


async function startStream(){
  try {
    stream = await twitterClient.v2.searchStream()
    console.log('Stream was intialized!')

    stream.on(ETwitterStreamEvent.Data, eventData => {
      const { text } = eventData.data
      //get image url
      var urlRegex = /(https?:\/\/[^\s]+)/g;
      const url = text.match(urlRegex);
      //###############################################################
      const roClient = twitterClient.readOnly


      async function getThings(): Promise<string| undefined> {
        

        // get the user timeline
        const user = await roClient.v2.userByUsername('MahmoudTamaa')
        let userTiemLine = await roClient.v2.userTimeline(user.data.id, { 'tweet.fields': 'created_at,attachments', 'media.fields': 'type,url', expansions: 'attachments.media_keys' })
        const fetchedTweets = userTiemLine.tweets
        const tweet = fetchedTweets[0].attachments?.media_keys
        // console.log(tweet)
        const availableIncludes = userTiemLine.includes

        if (tweet != null) {
          for (const mediaKey of tweet) {
            //  console.log(availableIncludes)
            const media = availableIncludes.media?.find(element => {
              return element.media_key === mediaKey
            })
            console.log(media?.url)
            // Download the image
            const download = require('image-downloader')
            const options = {
              url: media?.url,
              dest: 'image.jpg' // Save to /path/to/dest/image.jpg
            }
            const { filename, image } = await download.image(options)
            console.log(filename)

            //OCR the image
            const something = await new Promise<string>((resolve, reject) => {

              Tesseract
                .recognize('/Users/hfkbremen/ALARM_BOX/node_modules/image-downloader/image.jpg')
                .progress(console.log)
                .then((res) => {
                  console.log(res.text);
                  const eastOrWest = /[E|W].[0-9]{1,3}\W.[0-9]{1,2}./g;
                  const Nord = /[N].[0-9]{1,2}\W.[0-9]{1,2}./g;
                  let coordinates = res.text
                  let eastOrWestMatch = coordinates.match(eastOrWest);
                  let NordMatch = coordinates.match(Nord);
                  if (eastOrWestMatch != null && NordMatch != null) {
                    console.log('coordinates found')
                    // eastOrWestMatch.replace(/[“"]/g, '°');
                    // eastOrWestMatch.replace(/[E].9/g, 'E 0');
                    // eastOrWestMatch.replace(/[W].9/g, 'W 0');
                    // eastOrWestMatch.replace(/‘/g,"'");
                    console.log(eastOrWestMatch)
                    // NordMatch.replace(/[^0-9.]/g, '');
                    // NordMatch.replace(/[“"]/g, '°');
                    // NordMatch.replace(/‘/g,"'");
                    console.log(NordMatch)
                    resolve(eastOrWestMatch[0] +" "+ NordMatch[0])
                  }
                })
                .catch(reject);

            })
            return something

          }
        }
      }
      let coordinates = ''
      if (url.length > 0) {
        console.log(url)
        let imageURL = getThings().then((res) => {
          console.log("dfdslfndsklfnldsnfldsknf",res)
          coordinates = res || ''
        })

        
      }
      //###############################################################
      // get text without url 
      const textWithoutURL = text.replace(urlRegex, '');
      console.log(`tweet without url = "${textWithoutURL}"`)
      //check if it's a SOS call

      if (textWithoutURL.includes('🆘') || textWithoutURL.includes('SOS') || textWithoutURL.includes('🚩') || textWithoutURL.includes('🔴')) {
        if (textWithoutURL.includes('vite') || textWithoutURL.includes('personas')) {
          // Spansih
          console.log('Spain Tweet')
        } else if ((textWithoutURL.includes('persone'))) {
          console.log('it Tweet')
        }
        else if ((textWithoutURL.includes('people'))) {
          // English
          console.log('THIS IS A SOS CALL; TRIGGER THE ALARM!!!!!!!!')
          //get the number of people
          let regexp = /(\d+)\speople/g;
          let matchAll = [...textWithoutURL.matchAll(regexp)];
          console.log(matchAll[0][1]);
          //check if it's null
          let PeopleNumber = parseInt(matchAll[0][1])
          console.log(PeopleNumber);
          //get the time and date of the tweet
          const now = new Date();
          let month = now.getMonth() + 1
          let year = now.getFullYear()
          let day = now.getUTCDate()
          let hour = now.getHours()
          let minute = now.getMinutes()
          let second = now.getSeconds()

          //get the coordinates
          // let coordinates= eventData.data.geo.coordinates
          // let lat=coordinates[0]
          // let lon=coordinates[1]
          // get city from coordinates
          // get tweet image url


          // const geocoder = require('geocoder');
          // const city = await geocoder.reverse({lat:lat, lon:lon});
          // console.log(city.results[0].formatted_address);



          // Client and Server for P5js
          // const client = new OSCClient("localhost", 8000);
          // client.send('/hello', OSCType.Integer, test);

          // const server = new OSCServer("0.0.0.0", 8000);

          // server.on('message', (msg)=>{
          //     console.log(msg);
          // })

          //Client for loacal pure data patch
          const pDClient = new OSCClient("localhost", 9999);
          pDClient.send('/hello', OSCType.Integer, PeopleNumber);

          // downloadSpeech(textWithoutURL).then(()=>{
          //   //Play Noise and Tweet
          //   playShipHorn().then(()=>{
          //     playDummySound()
          //   })
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

async function closeStream() {
  if (stream) {
    stream.close()
  }
}

startStream()


// Enable graceful stop
process.once('SIGINT', closeStream)
process.once('SIGTERM', closeStream)


