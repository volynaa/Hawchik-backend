const Joi = require('joi')

exports.plugin = {
	name: 'goods',
	version: '0.0.1',
	register: async (server,options) => {
		const pool = server.mysql.pool
		server.route({
			method: 'GET',
			path: '/goods',
			handler: async (req) => {
				try {
					const [rows] = await pool.query(`SELECT * FROM goods`)
					if(rows.length) return {err: options.answer[200], data: rows}
					else return {err: options.answer[414]}
				} catch (err) {
					console.log(err)
					return {err: options.answer[504]}
				}
			},
			options:{
				description: 'Список товаров',
				tags: ['api', 'goods'],
				auth: false
			}
		});
		server.route({
			method: 'GET',
			path: '/shops/{id_shops}/goods',
			handler: async (req) => {
				try {
					const {id_shops}=req.params;
					const [rows] = await pool.query(`SELECT * FROM goods WHERE id_shops = ?`, [id_shops])
					if(rows.length) return {err: options.answer[200], data: rows}
					else return {err: options.answer[414]}
				} catch (err) {
					console.log(err)
					return {err: options.answer[504]}
				}
			},
			options:{
				description: 'Список товара для магазина',
				tags: ['api', 'shops', 'goods'],
				auth: false
			}
		});
		server.route({
			method: 'POST',
			path: '/shops/goods',
			handler: async (req) => {
				try {
					const {name, id_shops, price, weight} = req.payload;
					const [[check]] = await pool.query(`SELECT id FROM goods WHERE name=?`, name);
					if (check) {
						return {err: options.answer[405]}
					}
					await pool.query(`INSERT goods (name,id_shops,price,weight) VALUES (?,?,?,?)`, [name, id_shops, price, weight]);
					return {err: options.answer[200]}
				} catch (err) {
					console.log(err)
					return {err: options.answer[504]}
				}
			},
			options: {
				description: 'Добавить товар в магазин',
				tags: ['api', 'shops', 'goods'],
				auth: false,
				validate: {
					payload: Joi.object({
						name: Joi.string().min(3).max(20).required(),
						id_shops: Joi.number().required(),
						price: Joi.number().required(),
						weight: Joi.string().min(2).max(5).required(),
					})
				}
			},

		});
		server.route({
			method: 'DELETE',
			path: '/shops/goods',
			config: {
				async handler(req) {
					const {id}=req.payload;
					const [{affectedRows}] = await pool.query(`DELETE FROM goods WHERE id=?`, [id]);
					if(!affectedRows) return {err: options.answer[414]};
					return {err:options.answer[200]}
				},
				description: 'Удалить товар в магазине',
				tags: ['api', 'shops', 'goods'],
				auth: false,
				validate: {
					payload: Joi.object({
						id: Joi.number().required(),
					})
				}
			}
		});
		server.route({
			method: 'PUT',
			path: '/shops/goods',
			config: {
				async handler(req) {
					const {name,price,weight,id}=req.payload;
					const [[check]] = await pool.query(`SELECT id FROM goods WHERE id=?`, id);
					if(!check){
						return {err: options.answer[414]};
					}
					await pool.query(`UPDATE goods SET name =?, price =?, weight =? WHERE id =?`, [name,price,weight,id]);
					return {err:options.answer[200]}
				},
				description: 'Редактировать товар',
				tags: ['api'],
				validate: {
					payload: Joi.object({
						id: Joi.number().required(),
						name: Joi.string().min(3).max(20).required(),
						price: Joi.number().required(),
						weight: Joi.string().min(2).max(5).required(),
					})
				}
			}
		});
	}
}