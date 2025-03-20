const laabr = require('laabr')
laabr.token('_payload', r => {
	try{
		if(r.req.headers?.['content-type']?.includes('multipart') && r?.payload){
			const obj = {...r.payload};
			Object.keys(obj).forEach((i) => {
				if(typeof obj[i] === 'object' && typeof obj[i]?.hapi?.filename) obj[i] = '*file*';
			})
			return JSON.stringify(obj);
		}
		return JSON.stringify(r.payload||{});
	} catch{return '{}'}
});
const register = async (server)=> {
	try {
		return await server.register([{
			plugin: laabr,
			options: {
				formats: {
					onPostStart: ':time[utc] :start :level :message' ,
					log:':time[utc] :level :message',
					request:':time[utc] :level :message',
					response:':time[utc] :method :url :status :_payload (:responseTime ms)',
					'request-error':':time[utc] :level :error'
				},
				tokens: { start:  () => '[start]' },
				indent: 0
			}
		}
		]);
	} catch (err) {
		console.log(`Ошибка при регистрации плагина laabr: ${err}`);
	}
};
module.exports = {register};