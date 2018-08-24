import * as http from 'http';
import "reflect-metadata";
import { Container } from 'typedi';
import { getLogger } from './logger';  // Required for TypeGraphQL and Typedi
import { Server } from "./server";

const logger = getLogger('bootstrap');

/**
 * Initialize server, connect database and run app.
 * @param port: Port to listen to
 * @param host: Host to listen to
 */
const bootstrap = async (port: number, host: string) => {
    // Init express server
    const express = Container.get<Server>(Server);

    express.config(); // Configure
    express.routes(); // Configure Routes
    express.connect(); // Connect to database

    // Create http server
    const server = http.createServer(express.app);

    // Listen
    server.listen(port, host, () => logger.info(`Server listening on host ${host} port ${port}.`, {host, port}));
};

// Run server
bootstrap(parseInt(process.env.PORT || '3000', 10), process.env.HOST || '0.0.0.0')
    .catch(err => {
        logger.error('Server starting failed.', err);
        process.exit(1);
    });
