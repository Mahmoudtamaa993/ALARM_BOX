import mongoose from 'mongoose'
// query-for-distinct-values-in-mongoose

const APTweetSchema = new mongoose.Schema({
  tweet_id: { type: String, required: true },
  created_at: { type: Date, required: true },
  text: { type: String, required: true },
  // define-object-in-array-in-mongoose-schema
  media: [{
    media_type: {
      type: String
    },
    media_url: {
      type: String
    }
  }]
})

const APTweet = mongoose.model('APTweet', APTweetSchema)

export default APTweet
