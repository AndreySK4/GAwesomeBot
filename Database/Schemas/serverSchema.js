const mongoose = require("mongoose");

// Server Schema
module.exports = new mongoose.Schema({
	_id: {
		type: String,
		required: true,
	},
	added_timestamp: {
		type: Date,
		default: Date.now,
	},
	config: require("./serverConfigSchema.js"),
	extensions: [require("./modulesSchema.js")],
	members: [require("./serverMembersSchema.js")],
	games: [require("./serverGamesSchema.js")],
	channels: [require("./serverChannelsSchema")],
	command_usage: mongoose.Schema.Types.Mixed,
	messages_today: {
		type: Number,
		default: 0,
	},
	stats_timestamp: {
		type: Date,
		default: Date.now,
	},
	voice_data: [new mongoose.Schema({
		_id: {
			type: String,
			required: true,
		},
		started_timestamp: {
			type: Date,
			required: true,
		},
	})],
	logs: [new mongoose.Schema({
		timestamp: {
			type: Date,
			required: false,
			default: Date.now,
		},
		level: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		userid: {
			type: String,
			required: false,
		},
		channelid: {
			type: String,
			required: false,
		},
	}, { _id: false })],
	modlog: require("./serverModlogSchema.js"),
});
