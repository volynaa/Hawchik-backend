const Hapi = require('@hapi/hapi')
const init = async (configs) => {
	const {host,port} = configs.server;
	const server = new Hapi.Server({
		host: host,
		port: port,
		routes: {
			cors: {
				origin: ['*'],
				credentials: true
			},
			validate:{ // TODO добовил
				failAction(request, h, err) {
					throw err; // TODO отдавать на фронт что именно не так с параметрами запроса
				}
			}
		}
	});

	for(const plugin of configs.server.plugins)
		await require('./plugins/'+plugin).register(server,configs);
	for(const module of configs.server.modules)
		await server.register({plugin:require('./modules/'+module),options:{...configs.options, answer:configs.answers}}); // TODO изменил
	return server;
};

module.exports = {init};