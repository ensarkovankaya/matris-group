import { expect } from 'chai';
import { after, before, describe, it } from 'mocha';
import { Group } from '../../../src/schemas/group.schema';
import { User } from '../../../src/schemas/user.schema';
import { DatabaseService } from '../../../src/services/database.service';

const database = new DatabaseService();

before('Connect to Database', async () => {

    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const host = process.env.MONGODB_HOST;
    const port = parseInt(process.env.MONGODB_PORT, 10);

    await database.connect(username, password, host, port);
});

const genereateRandomString = (length: number): string => {
    let string = "";
    while (string.length < length) {
        string += (Math.random() + 1).toString(36).substring(7);
    }
    return string.slice(0, length);
};

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
                const name = genereateRandomString(4);
                const group = await db.createGroup({name, slug: name.toLowerCase()});

                expect(group).to.be.instanceof(Group);

                expect(group._id).to.be.an('object');
                expect(group._id.toString()).to.have.lengthOf(24);

                expect(group.name).to.be.eq(name);
                expect(group.slug).to.be.eq(name);

                expect(group.createdAt).to.be.a('date');
                expect(group.updatedAt).to.be.a('date');

                expect(group.deletedAt).to.be.eq(null);
                expect(group.deleted).to.be.eq(false);
            });
        });

        describe('Update', () => {
            it('should update group name', async () => {
                const db = new DatabaseService();
                const name = genereateRandomString(5);
                const newName = genereateRandomString(5);
                const group = await db.createGroup({name, slug: name.toLowerCase()});

                await db.updateGroup(group._id.toString(), {name: newName});

                const updated = await db.findOneGroupBy({_id: group._id.toString()});

                expect(updated.name).to.be.eq(newName);
            });
        });

        describe('Delete', () => {
            it('should delete group', async () => {
                const db = new DatabaseService();
                const name = genereateRandomString(10);
                const group = await db.createGroup({name, slug: name.toLowerCase()});

                await db.deleteGroup(group._id.toString());

                const deleted = await db.findOneGroupBy({_id: group._id.toString()});
                expect(deleted).to.be.eq(null);
            });
        });
    });

    describe('User', () => {
        describe('Create', () => {
            it('should create user entry', async () => {
                const db = new DatabaseService();
                const id = genereateRandomString(24);
                const user = await db.createUser({
                    user: id,
                    groups: [
                        '2'.repeat(24),
                        '3'.repeat(24)
                    ],
                    count: 2
                });

                expect(user).to.be.instanceof(User);

                expect(user._id).to.be.an('object');
                expect(user._id.toString()).to.have.lengthOf(24);

                expect(user.user).to.be.eq(id);

                expect(user.groups).to.be.an('array');
                expect(user.groups).to.be.deep.eq([
                    '2'.repeat(24),
                    '3'.repeat(24)
                ]);
                expect(user.count).to.be.eq(2);

                expect(user.createdAt).to.be.a('date');
                expect(user.updatedAt).to.be.a('date');

                expect(user.deletedAt).to.be.eq(null);
                expect(user.deleted).to.be.eq(false);
            });
        });

        describe('Update', () => {
            it('should update user entry', async () => {
                const db = new DatabaseService();
                const user = await db.createUser({
                    user: genereateRandomString(24)
                });

                expect(user.groups).to.be.an('array');
                expect(user.groups).to.have.lengthOf(0);
                expect(user.count).to.be.eq(0);

                await db.updateUser(user.user, {
                    groups: [
                        '2'.repeat(24),
                        '3'.repeat(24)
                    ],
                    count: 2
                });

                const updated = await db.findOneUserBy({user: user.user});

                expect(updated._id.toString()).to.be.eq(user._id.toString());

                expect(updated).to.be.instanceof(User);
                expect(updated.count).to.be.eq(2);

                expect(updated.groups).to.be.an('array');
                expect(updated.groups).to.have.lengthOf(2);

            });
        });

        describe('Delete', () => {
            it('should delete user entry', async () => {
                const db = new DatabaseService();
                const user = await db.createUser({
                    user: genereateRandomString(24)
                });

                expect(user).to.be.instanceof(User);

                await db.deleteUser(user.user);

                const isDeleted = await db.findOneUserBy({_id: user._id.toString()});
                expect(isDeleted).to.be.eq(null);
            });
        });
    });
});
