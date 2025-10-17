import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/list',
    method: 'GET',
    schema: {
      tags: ['Book'],
      // summary: 'List all users',
      description: 'List all users',
    },
    handler: async (_req, res) => {
      res.send({ message: 'Protected route user list' });
    },
  });
};

export default protectedRoute;
