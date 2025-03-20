const Joi = require('joi')

exports.plugin = {
	name: 'orders',
	version: '0.0.1',
	register: async (server,options) => {
		const pool = server.mysql.pool
		server.route({
			method: 'GET',
			path: '/courier/{id_courier}/orders',
			handler: async (req) => {
				try {
					const {id_courier}=req.params;
					const [rows] = await pool.query(`SELECT * FROM orders WHERE id_courier= ?`, [id_courier])
					if(rows.length) return {err: options.answer[200], data: rows}
					else return {err: options.answer[414]}
				} catch (err) {
					console.log(err)
					return {err: options.answer[504]}
				}
			},
			options:{
				description: 'Заказ курьера',
				tags: ['api', 'courier', 'orders'],
				auth: false
			}
		});
		server.route({
			method: 'POST',
			path: '/courier/orders',
			handler: async (req) => {
				try {
					const {id_courier, list, address,money,paid, type_payment} = req.payload;
					const [[check]] = await pool.query(`SELECT id FROM courier WHERE id=?`, id_courier);
					if (!check) {
						return {err: options.answer[405]}
					}
					await pool.query(`INSERT orders (id_courier, list, address,money,paid,type_payment) VALUES (?,?,?,?,?,?)`, [id_courier, JSON.stringify(list), address,money,paid,type_payment]);
					return {err: options.answer[200]}
				} catch (err) {
					console.log(err)
					return {err: options.answer[504]}
				}
			},
			options: {
				description: 'Добавить заказ курьеру',
				tags: ['api', 'courier', 'orders'],
				auth: false,
				validate: {
					payload: Joi.object({
						id_courier: Joi.number().required(),
						list: Joi.array().required(),
						address: Joi.string().min(2).required(),
						money: Joi.number().required().default(0),
						paid: Joi.number().default(null),
						type_payment: Joi.number().default(null)
					})
				}
			},

		});
		server.route({
			method: 'DELETE',
			path: '/courier/orders',
			config: {
				async handler(req) {
					const {id}=req.payload;
					const [{affectedRows}] = await pool.query(`DELETE FROM orders WHERE id=?`, [id]);
					if(!affectedRows) return {err: options.answer[414]};
					return {err:options.answer[200]}
				},
				description: 'Удалить товар в магазине',
				tags: ['api', 'courier', 'orders'],
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
			path: '/courier/orders',
			config: {
				async handler(req) {
					const {id,id_courier,list,address,money,paid,type_payment}=req.payload;
					let [[check]] = await pool.query(`SELECT id FROM orders WHERE id=?`, id);
					if(!check){
						return {err: options.answer[414]};
					}
					[[check]] = await pool.query(`SELECT id FROM courier WHERE id=?`, id_courier);
					if (!check) {
						return {err: options.answer[405]}
					}
					await pool.query(`UPDATE orders SET id_courier =?, list =?, address =?, money =?, paid =?, type_payment =? WHERE id =?`, [id_courier, JSON.stringify(list), address,money,paid,type_payment,id]);
					return {err:options.answer[200]}
				},
				description: 'Редактировать товар',
				tags: ['api', 'courier', 'orders'],
				validate: {
					payload: Joi.object({
						id: Joi.number().required(),
						id_courier: Joi.number().required(),
						list: Joi.array().required(),
						address: Joi.string().min(2).required(),
						money: Joi.number().required().default(0),
						paid: Joi.number().default(null),
						type_payment: Joi.number().default(null)
					})
				}
			}
		});
	}
}