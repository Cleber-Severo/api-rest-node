import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import crypto, { randomUUID } from 'node:crypto';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

export async function transactionsRoutes(app: FastifyInstance) {
	app.addHook('preHandler', async (request, reply) => {
		console.log(`[${request.method}] ${request.url}`);
	});

	app.get('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
		try {
			const { sessionId } = request.cookies;

			console.log('get sessionId: ', sessionId);

			const transactions = await knex('transactions').where('session_id', sessionId).select();

			return { transactions };
		} catch (error) {
			console.log(error);
		}
	});

	app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
		const getTransactionSchema = z.object({
			id: z.string().uuid(),
		});

		const { id } = getTransactionSchema.parse(request.params);

		const transaction = await knex('transactions').where('id', id).first();

		return { transaction };
	});

	app.get('/summary', { preHandler: [checkSessionIdExists] }, async () => {
		const summary = await knex('transactions').sum('amount', { as: 'amount' }).first();

		return { summary };
	});

	app.post('/', async (request, reply) => {
		const createTransactionBodySchema = z.object({
			title: z.string(),
			amount: z.number(),
			type: z.enum(['credit', 'debit']),
		});

		const { amount, title, type } = createTransactionBodySchema.parse(request.body);

		let sessionId = request.cookies.sessionId;

		if (!sessionId) {
			sessionId = randomUUID();

			reply.cookie('sessionId', sessionId, {
				path: '/',
				maxAge: 60 * 60 * 24 * 7, // 7 dias
			});
		}

		console.log('sessionId: ', sessionId);
		await knex('transactions').insert({
			id: crypto.randomUUID(),
			title,
			amount: type === 'credit' ? amount : amount * -1,
			session_id: sessionId,
		});

		return reply.status(201).send('sucesso');
	});
}
