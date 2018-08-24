import { expect } from 'chai';
import { after, before, describe, it } from 'mocha';
import { DatabaseService } from '../../../src/services/database.service';

const database = new DatabaseService();

before('Connect to Database', async () => {

    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const host = process.env.MONGODB_HOST;
    const port = parseInt(process.env.MONGODB_PORT, 10);

    await database.connect(username, password, host, port);
});

after('Disconnect from Database', async () => await database.disconnect());

describe.only('Unit -> Services -> Database', () => {
    it('should initialize database', async () => {
        const db = new DatabaseService();
        expect(db).to.be.an('object');
        expect(db.logger).to.be.an('object');
        expect(db.createGroup).to.be.a('function');
        expect(db.updateGroup).to.be.a('function');
        expect(db.deleteGroup).to.be.a('function');
        expect(db.createUser).to.be.a('function');
        expect(db.updateUser).to.be.a('function');
        expect(db.deleteUser).to.be.a('function');
    });

    describe('Group', () => {
        describe('Create', () => {
            it('should create group with name', async () => {
                const db = new DatabaseService();
                const name = (Math.random() + 1).toString(36).substring(7);
                const group = await db.createGroup({name, slug: name.toLowerCase()});

                expect(group._id).to.be.an('object');
                expect(group._id.toString()).to.have.lengthOf(24);

                expect(group.name).to.be.eq(name);
                expect(group.slug).to.be.eq(name);
            });
        });
    });
});
