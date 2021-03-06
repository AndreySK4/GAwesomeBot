const BaseEvent = require("./BaseEvent.js");
const { NewServer: getNewServerData, PostShardedData } = require("../Modules");

class GuildCreate extends BaseEvent {
	async handle ({ guild }) {
		this.bot.IPC.send("guilds", { latest: [guild.id] });
		this.bot.IPC.send("sendAllGuilds", {});
		await Promise.all([guild.members.fetch(), PostShardedData(this.bot)]);
		let serverDocument, shouldMakeDocument = false;
		try {
			serverDocument = await this.db.servers.findOne({ _id: guild.id }).exec();
		} catch (err) {
			shouldMakeDocument = true;
		}
		if (serverDocument) {
			winston.info(`Rejoined server ${guild}`, { svrid: guild.id });
			this.bot.logMessage(await this.db.servers.findOne({ _id: guild.id }).exec(), "info", "I've been re-added to your server! (^-^)");
		} else if (shouldMakeDocument || !serverDocument) {
			winston.info(`Joined server ${guild}`, { svrid: guild.id });
			try {
				await this.db.servers.create(await getNewServerData(this.bot, guild, new this.db.servers({ _id: guild.id })));
			} catch (err) {
				winston.warn(`Failed to create a new server document for new server >.>`, { svrid: guild.id }, err);
			}
			this.bot.logMessage(await this.db.servers.findOne({ _id: guild.id }).exec(), "info", "I've been added to your server! (^-^)");
		}
	}
}

module.exports = GuildCreate;
