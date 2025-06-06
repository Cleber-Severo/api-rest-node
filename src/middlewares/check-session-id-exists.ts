import { FastifyReply, FastifyRequest } from 'fastify';

export function checkSessionIdExists(
	request: FastifyRequest,
	reply: FastifyReply,
	done: (err?: Error) => void,
) {
	const sessionId = request.cookies.sessionId;

	if (!sessionId) {
		return reply.status(401).send({
			error: 'Unauthorized',
		});
	}

	if (!sessionId) {
		reply.status(401).send({ error: 'Unauthorized' });
	} else {
		done(); // ✅ chama o próximo middleware ou handler
	}
}
