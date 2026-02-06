import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';

/**
 * Optional API key authentication.
 * If WATCHTOWER_API_KEY env is set, requests must include a matching
 * `x-watchtower-key` header. If the env is unset, all requests pass through.
 */
export function apiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
): void {
  const expectedKey = process.env['WATCHTOWER_API_KEY'];
  if (!expectedKey) {
    done();
    return;
  }

  const providedKey = request.headers['x-watchtower-key'];
  if (providedKey === expectedKey) {
    done();
    return;
  }

  reply.status(401).send({ error: 'unauthorized' });
}
