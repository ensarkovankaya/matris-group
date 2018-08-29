import { expect } from 'chai';
import { after, before, beforeEach, describe, it } from 'mocha';
import { Group } from '../../src/schemas/group.schema';
import { User } from '../../src/schemas/user.schema';
import { DatabaseService } from '../../src/services/database.service';
import { generateRandomString } from '../../src/utils';

const database = new DatabaseService();

before('Connect to Database', async () => {

    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const host = process.env.MONGODB_HOST;
    const port = parseInt(process.env.MONGODB_PORT, 10);

    await database.connect(username, password, host, port);
});

const resetDatabase = async () => {
    try {
        await User.remove({}).exec();
    } catch (e) {
        console.log('Reseting User collection failed');
        throw e;
    }

    try {
        await Group.remove({}).exec();
    } catch (e) {
        console.log('Reseting Group collection failed');
        throw e;
    }
};

beforeEach('Reset Database', () => resetDatabase());

describe('E2E -> Database', () => {

    it('database should be clean', async () => {
        const users = await User.find().count().exec();
        expect(users).to.be.eq(0);

        const groups = await Group.find().count().exec();
        expect(groups).to.be.eq(0);
    });

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
                const name = generateRandomString(4);
                const group = await database.createGroup({name, slug: name.toLowerCase()});

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
                const name = generateRandomString(5);
                const newName = generateRandomString(5);
                const group = await database.createGroup({name, slug: name.toLowerCase()});

                await database.updateGroup(group._id.toString(), {name: newName});

                const updated = await database.findOneGroupBy({_id: group._id.toString()});

                expect(updated.name).to.be.eq(newName);
            });
        });

        describe('Delete', () => {
            it('should delete group', async () => {
                const name = generateRandomString(10);
                const group = await database.createGroup({name, slug: name.toLowerCase()});

                await database.deleteGroup(group._id.toString());

                const deleted = await database.findOneGroupBy({_id: group._id.toString()});
                expect(deleted).to.be.eq(null);
            });
        });

        describe('FilterGroup', () => {
            describe('Delete', () => {
                it('should return only deleted groups', async () => {
                    const group1 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5)
                    });
                    await group1.validate();
                    await group1.save();

                    const group2 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5)
                    });
                    await group2.validate();
                    await group2.save();

                    const group3 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        deleted: true,
                        deletedAt: new Date()
                    });
                    await group3.validate();
                    await group3.save();

                    const result = await database.filterGroup({deleted: true});

                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                    expect(result.docs).to.be.an('array');
                    expect(result.docs).to.have.lengthOf(1);

                    expect(result.total).to.be.eq(1);
                    expect(result.limit).to.be.eq(10);
                    expect(result.offset).to.be.eq(0);
                    expect(result.page).to.be.eq(1);
                    expect(result.pages).to.be.eq(1);

                    const group = result.docs[0];

                    expect(group).to.instanceOf(Group);

                    expect(group._id.toString()).to.be.eq(group3._id.toString());
                });

                it('should return only not deleted groups', async () => {
                    const group1 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5)
                    });
                    await group1.validate();
                    await group1.save();

                    const group2 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        deleted: true,
                        deletedAt: new Date()
                    });
                    await group2.validate();
                    await group2.save();

                    const group3 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        deleted: true,
                        deletedAt: new Date()
                    });
                    await group3.validate();
                    await group3.save();

                    const result = await database.filterGroup({deleted: false});

                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                    expect(result.docs).to.be.an('array');
                    expect(result.docs).to.have.lengthOf(1);

                    expect(result.total).to.be.eq(1);
                    expect(result.limit).to.be.eq(10);
                    expect(result.offset).to.be.eq(0);
                    expect(result.page).to.be.eq(1);
                    expect(result.pages).to.be.eq(1);

                    const group = result.docs[0];

                    expect(group).to.instanceOf(Group);

                    expect(group._id.toString()).to.be.eq(group1._id.toString());
                });
            });

            describe('DeletedAt', () => {
                describe('EQ', () => {
                    it('should return groups eq to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            deleted: true,
                            deletedAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 2, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            deleted: true,
                            deletedAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({deletedAt: {eq: date1}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const group = result.docs[0];

                        expect(group).to.instanceOf(Group);

                        expect(group._id.toString()).to.be.eq(group1._id.toString());
                    });
                });

                describe('GT', () => {
                    it('should return groups after than to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            deleted: true,
                            deletedAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            deleted: true,
                            deletedAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({deletedAt: {gt: new Date(2017, 0, 2, 0, 0, 0)}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const group = result.docs[0];

                        expect(group).to.instanceOf(Group);

                        expect(group._id.toString()).to.be.eq(group2._id.toString());
                    });
                });

                describe('GTE', () => {
                    it('should return groups after or equal than to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            deleted: true,
                            deletedAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            deleted: true,
                            deletedAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({deletedAt: {gte: date1}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(2);

                        expect(result.total).to.be.eq(2);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        expect(result.docs.map(d => d._id.toString())).to.be.deep.eq([
                            group1._id.toString(),
                            group2._id.toString()
                        ]);
                    });
                });

                describe('LT', () => {
                    it('should return groups before than date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            deleted: true,
                            deletedAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            deleted: true,
                            deletedAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({deletedAt: {lt: new Date(2017, 0, 2, 0, 0, 0)}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const doc = result.docs[0];

                        expect(doc).to.be.instanceof(Group);
                        expect(doc._id.toString()).to.be.eq(group1._id.toString());
                    });
                });

                describe('LTE', () => {
                    it('should return groups before or equal than to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            deleted: true,
                            deletedAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            deleted: true,
                            deletedAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({deletedAt: {lte: date2}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(2);

                        expect(result.total).to.be.eq(2);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        expect(result.docs.map(d => d._id.toString())).to.be.deep.eq([
                            group1._id.toString(),
                            group2._id.toString()
                        ]);
                    });
                });
            });

            describe('CreatedAt', () => {
                describe('EQ', () => {
                    it('should return groups eq to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            createdAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 2, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            createdAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({createdAt: {eq: date1}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const group = result.docs[0];

                        expect(group).to.instanceOf(Group);

                        expect(group._id.toString()).to.be.eq(group1._id.toString());
                    });
                });

                describe('GT', () => {
                    it('should return groups after than to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            createdAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            createdAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({createdAt: {gt: new Date(2017, 0, 2, 0, 0, 0)}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const group = result.docs[0];

                        expect(group).to.instanceOf(Group);

                        expect(group._id.toString()).to.be.eq(group2._id.toString());
                    });
                });

                describe('GTE', () => {
                    it('should return groups after or equal than to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            createdAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            createdAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({createdAt: {gte: date1}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(2);

                        expect(result.total).to.be.eq(2);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        expect(result.docs.map(d => d._id.toString())).to.be.deep.eq([
                            group1._id.toString(),
                            group2._id.toString()
                        ]);
                    });
                });

                describe('LT', () => {
                    it('should return groups before than date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            createdAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            createdAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({createdAt: {lt: new Date(2017, 0, 2, 0, 0, 0)}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const doc = result.docs[0];

                        expect(doc).to.be.instanceof(Group);
                        expect(doc._id.toString()).to.be.eq(group1._id.toString());
                    });
                });

                describe('LTE', () => {
                    it('should return groups before or equal than to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            createdAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            createdAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({createdAt: {lte: date2}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(2);

                        expect(result.total).to.be.eq(2);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        expect(result.docs.map(d => d._id.toString())).to.be.deep.eq([
                            group1._id.toString(),
                            group2._id.toString()
                        ]);
                    });
                });
            });

            describe('UpdatedAt', () => {
                describe('EQ', () => {
                    it('should return groups eq to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            updatedAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 2, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            updatedAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({updatedAt: {eq: date1}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const group = result.docs[0];

                        expect(group).to.instanceOf(Group);

                        expect(group._id.toString()).to.be.eq(group1._id.toString());
                    });
                });

                describe('GT', () => {
                    it('should return groups after than to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            updatedAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            updatedAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({updatedAt: {gt: new Date(2017, 0, 2, 0, 0, 0)}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const group = result.docs[0];

                        expect(group).to.instanceOf(Group);

                        expect(group._id.toString()).to.be.eq(group2._id.toString());
                    });
                });

                describe('GTE', () => {
                    it('should return groups after or equal than to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            updatedAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            updatedAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({updatedAt: {gte: date1}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(2);

                        expect(result.total).to.be.eq(2);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        expect(result.docs.map(d => d._id.toString())).to.be.deep.eq([
                            group1._id.toString(),
                            group2._id.toString()
                        ]);
                    });
                });

                describe('LT', () => {
                    it('should return groups before than date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            updatedAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            updatedAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({updatedAt: {lt: new Date(2017, 0, 2, 0, 0, 0)}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const doc = result.docs[0];

                        expect(doc).to.be.instanceof(Group);
                        expect(doc._id.toString()).to.be.eq(group1._id.toString());
                    });
                });

                describe('LTE', () => {
                    it('should return groups before or equal than to date', async () => {
                        const date1 = new Date(2017, 0, 1, 0, 0, 0);
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            updatedAt: date1
                        });
                        await group1.validate();
                        await group1.save();

                        const date2 = new Date(2017, 0, 3, 0, 0, 0);
                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            updatedAt: date2
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({updatedAt: {lte: date2}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(2);

                        expect(result.total).to.be.eq(2);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        expect(result.docs.map(d => d._id.toString())).to.be.deep.eq([
                            group1._id.toString(),
                            group2._id.toString()
                        ]);
                    });
                });
            });

            describe('Count', () => {
                describe('EQ', () => {
                    it('should return groups eq to date', async () => {
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 3
                        });
                        await group1.validate();
                        await group1.save();

                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 5
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({count: {eq: 3}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const group = result.docs[0];

                        expect(group).to.instanceOf(Group);

                        expect(group._id.toString()).to.be.eq(group1._id.toString());
                    });
                });

                describe('GT', () => {
                    it('should return groups after than to date', async () => {
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 3
                        });
                        await group1.validate();
                        await group1.save();

                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 5
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({count: {gt: 4}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const group = result.docs[0];

                        expect(group).to.instanceOf(Group);

                        expect(group._id.toString()).to.be.eq(group2._id.toString());
                    });
                });

                describe('GTE', () => {
                    it('should return groups after or equal than', async () => {
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 3
                        });
                        await group1.validate();
                        await group1.save();

                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 5
                        });
                        await group2.validate();
                        await group2.save();

                        const group3 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 10
                        });
                        await group3.validate();
                        await group3.save();

                        const result = await database.filterGroup({count: {gte: 5}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(2);

                        expect(result.total).to.be.eq(2);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        expect(result.docs.map(d => d._id.toString())).to.be.deep.eq([
                            group2._id.toString(),
                            group3._id.toString()
                        ]);
                    });
                });

                describe('LT', () => {
                    it('should return groups before than', async () => {
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 3
                        });
                        await group1.validate();
                        await group1.save();

                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 5
                        });
                        await group2.validate();
                        await group2.save();

                        const result = await database.filterGroup({count: {lt: 5}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(1);

                        expect(result.total).to.be.eq(1);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        const doc = result.docs[0];

                        expect(doc).to.be.instanceof(Group);
                        expect(doc._id.toString()).to.be.eq(group1._id.toString());
                    });
                });

                describe('LTE', () => {
                    it('should return groups before or equal than', async () => {
                        const group1 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 3
                        });
                        await group1.validate();
                        await group1.save();

                        const group2 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 5
                        });
                        await group2.validate();
                        await group2.save();

                        const group3 = new Group({
                            name: generateRandomString(5),
                            slug: generateRandomString(5),
                            count: 10
                        });
                        await group3.validate();
                        await group3.save();

                        const result = await database.filterGroup({count: {lte: 5}});

                        expect(result).to.be.an('object');
                        expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                        expect(result.docs).to.be.an('array');
                        expect(result.docs).to.have.lengthOf(2);

                        expect(result.total).to.be.eq(2);
                        expect(result.limit).to.be.eq(10);
                        expect(result.offset).to.be.eq(0);
                        expect(result.page).to.be.eq(1);
                        expect(result.pages).to.be.eq(1);

                        expect(result.docs.map(d => d._id.toString())).to.be.deep.eq([
                            group1._id.toString(),
                            group2._id.toString()
                        ]);
                    });
                });
            });

            describe('Name', () => {
                it('should return Group with requested name', async () => {
                    const name = generateRandomString(5);
                    const group1 = new Group({
                        name,
                        slug: generateRandomString(5)
                    });
                    await group1.validate();
                    await group1.save();

                    const group2 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5)
                    });
                    await group2.validate();
                    await group2.save();

                    const result = await database.filterGroup({name});

                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                    expect(result.docs).to.be.an('array');
                    expect(result.docs).to.have.lengthOf(1);

                    expect(result.total).to.be.eq(1);
                    expect(result.limit).to.be.eq(10);
                    expect(result.offset).to.be.eq(0);
                    expect(result.page).to.be.eq(1);
                    expect(result.pages).to.be.eq(1);

                    const doc = result.docs[0];
                    expect(doc).to.be.instanceof(Group);
                    expect(doc._id.toString()).to.be.eq(group1._id.toString());
                });
            });

            describe('Slug', () => {
                it('should return Group with requested slug', async () => {
                    const slug = generateRandomString(5);
                    const group1 = new Group({
                        name: generateRandomString(5),
                        slug
                    });
                    await group1.validate();
                    await group1.save();

                    const group2 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5)
                    });
                    await group2.validate();
                    await group2.save();

                    const result = await database.filterGroup({slug});

                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                    expect(result.docs).to.be.an('array');
                    expect(result.docs).to.have.lengthOf(1);

                    expect(result.total).to.be.eq(1);
                    expect(result.limit).to.be.eq(10);
                    expect(result.offset).to.be.eq(0);
                    expect(result.page).to.be.eq(1);
                    expect(result.pages).to.be.eq(1);

                    const doc = result.docs[0];
                    expect(doc).to.be.instanceof(Group);
                    expect(doc._id.toString()).to.be.eq(group1._id.toString());
                });
            });

            describe('Users', () => {
                it('should return group with requested user', async () => {
                    const user1 = generateRandomString(24);
                    const user2 = generateRandomString(24);
                    const user3 = generateRandomString(24);
                    const user4 = generateRandomString(24);

                    const group1 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        users: [user1, user3],
                        count: 1
                    });
                    await group1.validate();
                    await group1.save();

                    const group2 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        users: [user2, user4],
                        count: 1
                    });
                    await group2.validate();
                    await group2.save();

                    const result = await database.filterGroup({users: [user1]});

                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                    expect(result.docs).to.be.an('array');
                    expect(result.docs).to.have.lengthOf(1);

                    expect(result.total).to.be.eq(1);
                    expect(result.limit).to.be.eq(10);
                    expect(result.offset).to.be.eq(0);
                    expect(result.page).to.be.eq(1);
                    expect(result.pages).to.be.eq(1);

                    const doc = result.docs[0];
                    expect(doc).to.be.instanceof(Group);
                    expect(doc._id.toString()).to.be.eq(group1._id.toString());
                });

                it('should return both groups with requested user', async () => {
                    const user1 = generateRandomString(24);
                    const user2 = generateRandomString(24);
                    const user3 = generateRandomString(24);

                    const group1 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        users: [user1, user2],
                        count: 2
                    });
                    await group1.validate();
                    await group1.save();

                    const group2 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        users: [user2, user3],
                        count: 2
                    });
                    await group2.validate();
                    await group2.save();

                    const group3 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        users: [user1, user3],
                        count: 2
                    });
                    await group3.validate();
                    await group3.save();

                    const result = await database.filterGroup({users: [user2]});

                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                    expect(result.docs).to.be.an('array');
                    expect(result.docs).to.have.lengthOf(2);

                    expect(result.total).to.be.eq(2);
                    expect(result.limit).to.be.eq(10);
                    expect(result.offset).to.be.eq(0);
                    expect(result.page).to.be.eq(1);
                    expect(result.pages).to.be.eq(1);

                    expect(result.docs.map(d => d._id.toString())).to.be.deep.eq([
                        group1._id.toString(),
                        group2._id.toString(),
                    ]);
                });

                it('should return both groups with requested user', async () => {
                    const user1 = generateRandomString(24);
                    const user2 = generateRandomString(24);
                    const user3 = generateRandomString(24);
                    const user4 = generateRandomString(24);

                    const group1 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        users: [user1, user2, user3],
                        count: 2
                    });
                    await group1.validate();
                    await group1.save();

                    const group2 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        users: [user2, user3],
                        count: 2
                    });
                    await group2.validate();
                    await group2.save();

                    const group3 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        users: [user1, user3, user4],
                        count: 3
                    });
                    await group3.validate();
                    await group3.save();

                    const group4 = new Group({
                        name: generateRandomString(5),
                        slug: generateRandomString(5),
                        users: [user1, user4],
                        count: 2
                    });
                    await group4.validate();
                    await group4.save();

                    const result = await database.filterGroup({users: [user2, user3]});

                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['docs', 'total', 'limit', 'offset', 'page', 'pages']);

                    expect(result.docs).to.be.an('array');
                    expect(result.docs).to.have.lengthOf(3);

                    expect(result.total).to.be.eq(3);
                    expect(result.limit).to.be.eq(10);
                    expect(result.offset).to.be.eq(0);
                    expect(result.page).to.be.eq(1);
                    expect(result.pages).to.be.eq(1);

                    expect(result.docs.map(d => d._id.toString())).to.be.deep.eq([
                        group1._id.toString(),
                        group2._id.toString(),
                        group3._id.toString()
                    ]);
                });
            });
        });

        describe('FindOneGroupBy', () => {
            it('should find groups by _id', async () => {
                const group1 = new Group({
                    name: generateRandomString(5),
                    slug: generateRandomString(5)
                });
                await group1.validate();
                await group1.save();

                const group2 = new Group({
                    name: generateRandomString(5),
                    slug: generateRandomString(5)
                });
                await group2.validate();
                await group2.save();

                const doc = await database.findOneGroupBy({_id: group1._id.toString()});

                expect(doc).to.be.an('object');
                expect(doc).to.be.instanceof(Group);
                expect(doc._id.toString()).to.be.eq(group1._id.toString());
            });

            it('should find groups by name', async () => {
                const name = generateRandomString(5);
                const group1 = new Group({
                    name,
                    slug: generateRandomString(5)
                });
                await group1.validate();
                await group1.save();

                const group2 = new Group({
                    name: generateRandomString(5),
                    slug: generateRandomString(5)
                });
                await group2.validate();
                await group2.save();

                const doc = await database.findOneGroupBy({name});

                expect(doc).to.be.an('object');
                expect(doc).to.be.instanceof(Group);
                expect(doc._id.toString()).to.be.eq(group1._id.toString());
            });

            it('should find groups by slug', async () => {
                const slug = generateRandomString(5);
                const group1 = new Group({
                    name: generateRandomString(5),
                    slug
                });
                await group1.validate();
                await group1.save();

                const group2 = new Group({
                    name: generateRandomString(5),
                    slug: generateRandomString(5)
                });
                await group2.validate();
                await group2.save();

                const doc = await database.findOneGroupBy({slug});

                expect(doc).to.be.an('object');
                expect(doc).to.be.instanceof(Group);
                expect(doc._id.toString()).to.be.eq(group1._id.toString());
            });
        });
    });

    describe('User', () => {
        describe('Create', () => {
            it('should create user entry', async () => {
                const id = generateRandomString(24);
                const user = await database.createUser(id, {
                    groups: [
                        '2'.repeat(24),
                        '3'.repeat(24)
                    ],
                    count: 2
                });

                expect(user).to.be.instanceof(User);

                expect(user._id).to.be.an('object');
                expect(user._id.toString()).to.have.lengthOf(24);

                expect(user.id).to.be.eq(id);

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
                const user = await database.createUser(generateRandomString(24), {});

                expect(user.groups).to.be.an('array');
                expect(user.groups).to.have.lengthOf(0);
                expect(user.count).to.be.eq(0);

                await database.updateUser(user.id, {
                    groups: [
                        '2'.repeat(24),
                        '3'.repeat(24)
                    ],
                    count: 2
                });

                const updated = await database.findOneUserBy({id: user.id});

                expect(updated._id.toString()).to.be.eq(user._id.toString());

                expect(updated).to.be.instanceof(User);
                expect(updated.count).to.be.eq(2);

                expect(updated.groups).to.be.an('array');
                expect(updated.groups).to.have.lengthOf(2);

            });
        });

        describe('Delete', () => {
            it('should delete user entry', async () => {
                const user = await database.createUser(generateRandomString(24), {});

                expect(user).to.be.instanceof(User);

                await database.deleteUser(user.id);

                const isDeleted = await database.findOneUserBy({_id: user._id.toString()});
                expect(isDeleted).to.be.eq(null);
            });
        });

        describe('FilterUser', () => {
            it('should return PaginationResult', async () => {
                const u1 = await new User({id: generateRandomString(24)}).save({validateBeforeSave: true});
                const u2 = await new User({id: generateRandomString(24)}).save({validateBeforeSave: true});
                const u3 = await new User({id: generateRandomString(24)}).save({validateBeforeSave: true});
                const u4 = await new User({id: generateRandomString(24)}).save({validateBeforeSave: true});
                const u5 = await new User({id: generateRandomString(24)}).save({validateBeforeSave: true});

                const result = await database.filterUser({});
                expect(result).to.be.an('object');
                expect(result).to.have.keys(['docs', 'total', 'limit', 'page', 'pages', 'offset']);
                expect(result.total).to.be.eq(5);
                expect(result.page).to.be.eq(1);
                expect(result.limit).to.be.eq(10);
                expect(result.pages).to.be.eq(1);
                expect(result.offset).to.be.eq(0);
                expect(result.docs).to.have.lengthOf(5);
                expect(result.docs.map(d => d.id)).to.be.deep.eq([u1.id, u2.id, u3.id, u4.id, u5.id]);
            });
        });
    });
});

after('Disconnect from Database', async () => {
    await resetDatabase();
    await database.disconnect();
});
