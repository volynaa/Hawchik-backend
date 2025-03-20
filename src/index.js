const Server = require("./server"), {server,answers,swagger} = require("./config/config.json");
const {server:options} = require('./config') // TODO изменил

const start = async (config) => {
	try {
		const server = await Server.init(config);
		await server.start();
		console.log(`Server running at: ${server.info.uri}/documentation`);

	} catch (err) {
		console.error("Error starting server: ", err.message);
		throw err;
	}
};

start({server,answers,swagger,options}).then(); // TODO изменил