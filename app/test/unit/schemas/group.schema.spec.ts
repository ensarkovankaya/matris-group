import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Group } from '../../../src/schemas/group.schema';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Schemas -> Group', () => {
    it('should throw required validation error for name and slug', async () => {
        try {
            const group = new Group();
            await group.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ValidationError');
            expect(e.errors).to.be.an('object');
            expect(e.errors).to.have.keys(['slug', 'name']);
            expect(e.errors.name.kind).to.be.eq('required');
            expect(e.errors.slug.kind).to.be.eq('required');
        }
    });

    it('should create empty group', async () => {
        try {
            const group = new Group({name: 'Group Name', slug: 'group-name'});
            await group.validate();
            expect(group.isNew).to.be.eq(true);

            expect(group._id).to.be.an('object');
            expect(group._id.toString()).to.be.a('string');
            expect(group._id.toString()).to.have.lengthOf(24);

            expect(group.name).to.be.eq('Group Name');
            expect(group.slug).to.be.eq('group-name');

            expect(group.users).to.be.an('array');
            expect(group.users).to.be.deep.eq([]);

            expect(group.count).to.be.eq(0);
            expect(group.createdAt).to.be.a('date');
            expect(group.updatedAt).to.be.a('date');

            expect(group.deletedAt).to.be.eq(null);
            expect(group.deleted).to.be.eq(false);
        } catch (e) {
            console.log(e);
            throw e;
        }
    });

    describe('name', () => {
        it('should throw matches error if name includes "-"', async () => {
            try {
                const group = new Group({name: 'Group-Name', slug: 'group-name'});
                await group.validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ValidationError');
                expect(e.errors).to.be.an('object');
                expect(e.errors).to.have.keys(['name']);
                expect(e.errors.name.kind).to.be.eq('regexp');
            }
        });
        it('should throw matches error if name includes "*"', async () => {
            try {
                const group = new Group({name: 'Group Name *', slug: 'group-name'});
                await group.validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ValidationError');
                expect(e.errors).to.be.an('object');
                expect(e.errors).to.have.keys(['name']);
                expect(e.errors.name.kind).to.be.eq('regexp');
            }
        });
        it('should create group with name "Admin"', async () => {
            try {
                const group = new Group({name: 'Admin', slug: 'admin'});
                await group.validate();
                expect(group.isNew).to.be.eq(true);

                expect(group._id).to.be.an('object');
                expect(group._id.toString()).to.be.a('string');
                expect(group._id.toString()).to.have.lengthOf(24);

                expect(group.name).to.be.eq('Admin');
                expect(group.slug).to.be.eq('admin');

                expect(group.users).to.be.an('array');
                expect(group.users).to.be.deep.eq([]);

                expect(group.count).to.be.eq(0);

                expect(group.createdAt).to.be.a('date');
                expect(group.updatedAt).to.be.a('date');

                expect(group.deletedAt).to.be.eq(null);
                expect(group.deleted).to.be.eq(false);
            } catch (e) {
                console.log(e);
                throw e;
            }
        });
        it('should create group with name "2018 Users"', async () => {
            try {
                const group = new Group({name: '2018 Users', slug: '2018-users'});
                await group.validate();
                expect(group.isNew).to.be.eq(true);

                expect(group._id).to.be.an('object');
                expect(group._id.toString()).to.be.a('string');
                expect(group._id.toString()).to.have.lengthOf(24);

                expect(group.name).to.be.eq('2018 Users');
                expect(group.slug).to.be.eq('2018-users');

                expect(group.users).to.be.an('array');
                expect(group.users).to.be.deep.eq([]);

                expect(group.count).to.be.eq(0);

                expect(group.createdAt).to.be.a('date');
                expect(group.updatedAt).to.be.a('date');

                expect(group.deletedAt).to.be.eq(null);
                expect(group.deleted).to.be.eq(false);
            } catch (e) {
                console.log(e);
                throw e;
            }
        });
    });

    describe('users', () => {
        it('should create group with 2 user', async () => {
            try {
                const group = new Group({
                    name: 'Admins',
                    slug: 'admins',
                    users: [
                        "5b4b57f1fc13ae1730000640",
                        "5b4b57f1fc13ae1730000641"
                    ],
                    count: 2
                });
                await group.validate();
                expect(group.isNew).to.be.eq(true);

                expect(group._id).to.be.an('object');
                expect(group._id.toString()).to.be.a('string');
                expect(group._id.toString()).to.have.lengthOf(24);

                expect(group.name).to.be.eq('Admins');
                expect(group.slug).to.be.eq('admins');

                expect(group.users).to.be.an('array');
                expect(group.users).to.be.deep.eq([
                    "5b4b57f1fc13ae1730000640",
                    "5b4b57f1fc13ae1730000641"
                ]);

                expect(group.count).to.be.eq(2);

                expect(group.createdAt).to.be.a('date');
                expect(group.updatedAt).to.be.a('date');

                expect(group.deletedAt).to.be.eq(null);
                expect(group.deleted).to.be.eq(false);
            } catch (e) {
                console.log(e);
                throw e;
            }
        });
    });

    describe('count', () => {
        it('should raise error for count is bigger than max value', async () => {
            try {
                const group = new Group({name: 'Group Name', slug: 'group-name', count: 251});
                await group.validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ValidationError');
                expect(e.errors).to.be.an('object');
                expect(e.errors).to.have.keys(['count']);
                expect(e.errors.count.kind).to.be.eq('max');
            }
        });
    });
});
