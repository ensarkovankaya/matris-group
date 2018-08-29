import { GraphQLSchema } from 'graphql';
import { buildSchemaSync, useContainer } from 'type-graphql';
import { Container } from "typedi";
import { getLogger } from '../logger';
import { isProduction } from '../utils';

import { OptionsData } from 'express-graphql';
import * as graphqlHTTP from 'express-graphql';
import { GroupResolver } from './resolvers/group.resolver';
import { formatArgumentValidationError } from './validation.error.handler';

useContainer(Container);

const logger = getLogger('GraphQL');

export const getRootSchema = (): GraphQLSchema => {
    try {
        return buildSchemaSync({
            resolvers: [GroupResolver]
        });
    } catch (err) {
        logger.error('Root schema creation failed', err);
        throw err;
    }
};

export const getGraphQLHTTPServer = () => graphqlHTTP((): OptionsData => {
    try {
        return {
            schema: getRootSchema(),
            graphiql: !isProduction(),
            formatError: formatArgumentValidationError
        };
    } catch (err) {
        logger.error('GraphQL server creation failed.', err);
        throw err;
    }
});
