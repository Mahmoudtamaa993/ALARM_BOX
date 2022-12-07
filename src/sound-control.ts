
// @ts-ignore
import APlay from 'node-aplay'

export function playDummySound () {
  const soundToPlay = new APlay('/home/pi/Twits/output.wav')
  soundToPlay.play()
  
  soundToPlay.on('complete', function () {
    console.log('Done with dummy sound playback!')
  })
}
export function playShipHorn () {
  return new Promise((resolve, reject)=>{

  try{
    const soundToPlay = new APlay('/home/pi/Twits/Shiphorn.wav')
    soundToPlay.play()
    soundToPlay.on('complete', function () {
    console.log('Done with dummy sound playback!')
    return resolve(null)
  })
  }catch(error){
    return reject(error)
  }
})
}