const Joi = require('joi')

exports.plugin = {
	name: 'courier',
	version: '0.0.1',
	register: async (server,options) => {
		const pool = server.mysql.pool
		server.route({
			method: 'GET',
			path: '/courier',
			handler: async (req) => {
				try {
					const [rows] = await pool.query(`SELECT * FROM courier`)
					return {err: options.answer[200], data: rows}
				} catch (err) {
					console.log(err)
					return {err: options.answer[504]}
				}
			},
			options:{
				description: 'Список курьеров',
				tags: ['api','courier'],
				auth: false
			}
		});
		server.route({
			method: 'POST',
			path: '/courier',
			config: {
				async handler(req){
					const {name,phone}=req.payload;
					const [[check]] = await pool.query(`SELECT id FROM courier WHERE phone=?`, phone);
					if(check){
						return {err: options.answer[405]};
					}
					await pool.query(`INSERT courier (name,phone) VALUES (?,?)`, [name,phone]);
					return {err:options.answer[200]}
				},
				description: 'Добавить курьера',
				tags: ['api','courier'],
				auth: false,
				validate: {
					payload: Joi.object({
						name: Joi.string().min(3).max(20).required(),
						phone: Joi.string().min(11).max(12).required()
					})
				}
			},

		});
		server.route({
			method: 'DELETE',
			path: '/courier',
			config: {
				async handler(req) {
					const {id}=req.payload;
					const [{affectedRows}] = await pool.query(`DELETE FROM courier WHERE id=?`, [id]);
					if(!affectedRows) return {err: options.answer[414]};
					return {err:options.answer[200]}
				},
				description: 'Удалить курьера',
				tags: ['api'],
				auth: false,
				validate: {
					payload: Joi.object({
						id: Joi.number().required()
					})
				}
			}
		});
		server.route({
			method: 'PUT',
			path: '/courier',
			config: {
				async handler(req) {
					const {id,name,phone}=req.payload;
					const [[check]] = await pool.query(`SELECT id FROM courier WHERE id=?`, id);
					if(!check){
						return {err: options.answer[414]};
					}
					await pool.query(`UPDATE courier SET name =?,SET phone =? WHERE id =?`, [name,phone,id]);
					return {err:options.answer[200]}
				},
				description: 'Редактировать курьера',
				tags: ['api'],
				validate: {
					payload: Joi.object({
						id: Joi.number().required(),
						name: Joi.string().min(3).max(20).required(),
						phone: Joi.string().min(11).max(12).required()
					})
				}
			}
		});
	}
}