const Joi = require('joi')

exports.plugin = {
	name: 'shops',
	version: '0.0.1',
	register: async (server,options) => {
		const pool = server.mysql.pool
		server.route({
			method: 'GET',
			path: '/shops',
			handler: async (req) => { // TODO изменил
				try {
					const [rows] = await pool.query(`SELECT * FROM shops`)
					return {err: options.answer[200], data: rows}
				} catch (err) { // TODO изменил
					console.log(err)
					return {err: options.answer[504]}
				} // TODO изменил
			},
			options:{ // TODO изменил
				description: 'Список магазинов',
				tags: ['api','shops'],
				auth: false
			}
		});
		server.route({
			method: 'POST',
			path: '/shops',
			config: {
				async handler(req){
					const {name}=req.payload;
					const [[check]] = await pool.query(`SELECT id FROM shops WHERE name=?`, name);
					if(check){
						return {err: options.answer[405]};
					}
					await pool.query(`INSERT shops (name) VALUES (?)`, [name]);
					return {err:options.answer[200]}
				},
				description: 'Добавить магазин',
				tags: ['api','shops'],
				auth: false,
				validate: {
					payload: Joi.object({
						name: Joi.string().min(3).max(20).required(),
					})
				}
			},

		});
		server.route({
			method: 'DELETE',
			path: '/shops',
			config: {
				async handler(req) {
					const {id}=req.payload;
					const [{affectedRows}] = await pool.query(`DELETE FROM shops WHERE id=?`, [id]);
					if(!affectedRows) return {err: options.answer[414]};
					return {err:options.answer[200]}
				},
				description: 'Удалить магазин',
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
			path: '/shops',
			config: {
				async handler(req) {
					const {id,name}=req.payload;
					const [[check]] = await pool.query(`SELECT id FROM shops WHERE id=?`, id);
					if(!check){
						return {err: options.answer[414]};
					}
					await pool.query(`UPDATE shops SET name =? WHERE id =?`, [name,id]);
					return {err:options.answer[200]}
				},
				description: 'Редактировать магазин',
				tags: ['api'],
				validate: {
					payload: Joi.object({
						id: Joi.number().required(),
						name: Joi.string().min(3).max(20).required()
					})
				}
			}
		});
	}
}