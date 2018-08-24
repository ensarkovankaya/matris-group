import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as cors from "cors";
import * as express from "express";
import * as expressValidator from 'express-validator';
import * as helmet from "helmet";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import { Service } from "typedi";
import { getGraphQLHTTPServer } from './graphql';
import { getLogger, Logger } from './logger';
import { DatabaseService } from './services/database.service';

@Service('Server')
export class Server {
    // set app to be of type express.Application
    public app: express.Application;
    private logger: Logger;

    constructor(private db: DatabaseService) {
        this.logger = getLogger('Server');
        this.app = express();
    }

    /**
     * Connect Database
     * @return {Promise<void>}
     */
    public async connect(): Promise<void> {
        const username = process.env.MONGODB_USERNAME;
        const password = process.env.MONGODB_PASSWORD;
        const host = process.env.MONGODB_HOST;
        const port = parseInt(process.env.MONGODB_PORT, 10);

        return await this.db.connect(username, password, host, port);
    }

    // Setup application config
    public config() {
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
    public routes(): void {
        try {
            this.app.use('/', getGraphQLHTTPServer());
        } catch (err) {
            this.logger.error('Route configuration failed', err);
            throw err;
        }
    }
}
