
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		username: String,
		email: String,
		password: String
	},
	{ collection: 'users' }
)

const model = mongoose.model('UserSchema', UserSchema)

module.exports = model
