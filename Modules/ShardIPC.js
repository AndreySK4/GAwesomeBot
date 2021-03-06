const cJSON = require("circular-json");

const EventEmitter = require("events");

class SharderIPC extends EventEmitter {
	constructor (sharder, winston) {
		super();
		this.sharder = sharder;
		this.winston = winston;
		this.setMaxListeners(0);
	}

	listen () {
		this.winston.verbose("Started sharder listener.");
		this.sharder.on("message", (shard, msg) => {
			this.winston.silly("Recieved message from shard.", { msg: msg, shard: shard.id });
			try {
				const payload = cJSON.parse(msg);
				this.emit(payload.subject, payload, shard);
			} catch (err) {
				if (!msg._Eval && !msg.sEval) this.winston.warn("Unable to handle message from shard :C\n", { msg: msg, shard: shard.id, err: err });
			}
		});
	}

	send (subject, payload, shard) {
		try {
			this.winston.silly("Sending message to shard", { subject: subject, payload: payload, shard: shard });
			payload.subject = subject;

			if (shard === "*") {
				this.sharder.broadcast(cJSON.stringify(payload)).catch(err => {
					throw err;
				});
			} else {
				shard = this.sharder.shards.get(shard);
				if (!shard) shard = this.sharder.shards.get(0);
				shard.send(payload).catch(err => {
					throw err;
				});
			}
		} catch (err) {
			this.winston.warn("Failed to send message to shard :C\n", { subject: subject, payload: payload, shard: shard, err: err });
		}
	}
}

class ShardIPC extends EventEmitter {
	constructor (client, winston, proc) {
		super();
		this.shardClient = client.shard;
		this.winston = winston;
		this.proc = proc;
		this.client = client;
		this.setMaxListeners(0);
	}

	listen () {
		this.winston.verbose("Started shard listener.");
		this.proc.on("message", msg => {
			try {
				this.winston.silly("Received message from sharder.", { msg: msg });
				if (msg._Eval) {
					let result = this.client._eval(msg._Eval);
					if (result instanceof Map) result = Array.from(result.entries());
					this.shardClient.send({ _Eval: msg._Eval, _result: result });
				}
				let payload = msg;
				if (typeof msg === "string") payload = cJSON.parse(msg);
				this.emit(payload.subject, payload);
			} catch (err) {
				if (!msg._Eval && !msg._SEval) this.winston.warn("Unable to handle message from master :C\n", err);
			}
		});
	}

	async send (subject, payload) {
		try {
			this.winston.silly("Sending message to master", { subject: subject, payload: payload });
			payload.subject = subject;
			this.proc.send(cJSON.stringify(payload), err => {
				if (err) throw err;
			});
		} catch (err) {
			this.winston.warn("Failed to send message to master :C\n", err, { payload: payload, subject: subject });
		}
	}
}

module.exports = {
	SharderIPC: SharderIPC,
	ShardIPC: ShardIPC,
};
