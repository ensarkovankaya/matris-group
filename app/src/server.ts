import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as cors from "cors";
import * as express from "express";
import * as expressValidator from 'express-validator';
import * as helmet from "helmet";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import { getGraphQLHTTPServer } from './graphql';
import { getLogger, Logger } from './logger';

export class Server {
    // set app to be of type express.Application
    public app: express.Application;
    private logger: Logger;

    constructor() {
        this.logger = getLogger('Server');
        this.app = express();
        this.config();
        this.routes();
    }

    /**
     * Connect Database
     * @param {string} username: Database user name
     * @param {string} password: Database password
     * @param {string} host: Database host
     * @param {number} port: Database port
     * @return {Promise<void>}
     */
    public async connect(username: string, password: string, host: string, port: number): Promise<void> {
        try {
            await mongoose.connect(`mongodb://${username}:${password}@${host}:${port}`);
            this.logger.debug('Database Connected', {host, port, username});
        } catch (err) {
            this.logger.error('Database Connection Failed', err, {host, port, username});
            throw err;
        }
    }

    // Setup application config
    private config() {
        try {
            this.app.use(bodyParser.json());
            this.app.use(morgan("dev"));
            this.app.use(compression());
            this.app.use(helmet());
            this.app.use(cors());
            this.app.use(expressValidator());

            // cors
            this.app.use((req, res, next) => {
                res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.header(
                    "Access-Control-Allow-Headers",
                    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials",
                );
                res.header("Access-Control-Allow-Credentials", "true");
                next();
            });

            // Logs incoming requests
            this.app.use((req, res, next) => {
                this.logger.http('Incoming Request', req, res);
                next();
            });
        } catch (err) {
            this.logger.error('Configuration failed', err);
            throw err;
        }
    }

    // Setup application routes
    private routes(): void {
        try {
            this.app.use('/', getGraphQLHTTPServer());
        } catch (err) {
            this.logger.error('Route configuration failed', err);
            throw err;
        }
    }
}
