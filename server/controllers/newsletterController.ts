import Subscriber from '../models/Subscriber.js'
import { handle } from '../utils/http.js'
import { emailAddress, record } from '../utils/validation.js'

export const subscribe = handle(async (req, res) => {
    const email = emailAddress(record(req.body).email)
    // Upsert makes repeat subscriptions safe without exposing whether an address is already registered.
    await Subscriber.updateOne({email}, {$set: {isActive: true}, $setOnInsert: {email}}, {upsert: true, runValidators: true})
    res.json({success: true, message: 'You are on the list. Thank you for subscribing.'})
})
