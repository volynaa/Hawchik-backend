const {bd} = require('../config');

const register = async (server,configs)=> {
	try {
		return await server.register([{
			plugin: require('hapi-mysql2'),
			options: {
				settings: {...bd, connectionLimit: 10},
				decorate: true
			}
		}]);
	} catch (err) {
		console.log(`Ошибка плагина hapi-mysql2: ${err}`);
	}
};
module.exports={register};
