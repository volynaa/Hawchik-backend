const Joi = require('joi')

exports.plugin = {
	name: 'clients',
	version: '0.0.1',
	register: async (server,options) => {
		const pool = server.mysql.pool
		server.route({
			method: 'GET',
			path: '/clients',
			handler: async (req) => {
				try {
					const [rows] = await pool.query(`SELECT * FROM clients`)
					return {err: options.answer[200], data: rows}
				} catch (err) {
					console.log(err)
					return {err: options.answer[504]}
				}
			},
			options:{
				description: 'Список клиентов',
				tags: ['api','clients'],
				auth: false
			}
		});
		server.route({
			method: 'POST',
			path: '/clients',
			config: {
				async handler(req){
					const {name,phone}=req.payload;
					const [[check]] = await pool.query(`SELECT id FROM clients WHERE phone=?`, phone);
					if(check){
						return {err: options.answer[405]};
					}
					await pool.query(`INSERT clients (name,phone) VALUES (?,?)`, [name,phone]);
					return {err:options.answer[200]}
				},
				description: 'Добавить клиента',
				tags: ['api','clients'],
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
			path: '/clients',
			config: {
				async handler(req) {
					const {id}=req.payload;
					const [{affectedRows}] = await pool.query(`DELETE FROM clients WHERE id=?`, [id]);
					if(!affectedRows) return {err: options.answer[414]};
					return {err:options.answer[200]}
				},
				description: 'Удалить клиента',
				tags: ['api','clients'],
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
			path: '/clients',
			config: {
				async handler(req) {
					const {id,name,phone}=req.payload;
					const [[check]] = await pool.query(`SELECT id FROM clients WHERE id=?`, id);
					if(!check){
						return {err: options.answer[414]};
					}
					await pool.query(`UPDATE clients SET name =?,SET phone =? WHERE id =?`, [name,phone,id]);
					return {err:options.answer[200]}
				},
				description: 'Редактировать клиента',
				tags: ['api','clients'],
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