const BaseEvent = require("./BaseEvent");
const { PostShardedData } = require("../Modules");

class GuildDelete extends BaseEvent {
	async handle ({ guild }) {
		// TODO: Gilbert: the IPC guild thingie
		this.bot.IPC.send("sendAllGuilds", {});
		await PostShardedData(this.bot);
		winston.info(`Left server ${guild} :(`, { svrid: guild.id });
	}
}

module.exports = GuildDelete;
