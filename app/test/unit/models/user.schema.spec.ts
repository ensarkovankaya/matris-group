import { expect } from 'chai';
import { describe, it } from 'mocha';
import { User } from '../../../src/schemas/user.schema';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Models -> User', () => {
    it('should throw required validation error for user field', async () => {
        try {
            const user = new User();
            await user.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ValidationError');
            expect(e.errors).to.be.an('object');
            expect(e.errors).to.have.keys(['user']);
            expect(e.errors.user.kind).to.be.eq('required');
        }
    });

    it('should create empty user entry', async () => {
        try {
            const user = new User({user: '1'.repeat(24)});
            await user.validate();
            expect(user.isNew).to.be.eq(true);

            expect(user._id).to.be.an('object');
            expect(user._id.toString()).to.be.a('string');
            expect(user._id.toString()).to.have.lengthOf(24);

            expect(user.user).to.be.eq('1'.repeat(24));

            expect(user.groups).to.be.an('array');
            expect(user.groups).to.be.deep.eq([]);

            expect(user.count).to.be.eq(0);
            expect(user.createdAt).to.be.a('date');
            expect(user.updatedAt).to.be.a('date');

            expect(user.deletedAt).to.be.eq(null);
            expect(user.deleted).to.be.eq(false);
        } catch (e) {
            console.log(e);
            throw e;
        }
    });

    describe('user', () => {
        it('should raise error for user if id not valid', async () => {
            try {
                await new User({user: '-'.repeat(24)}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ValidationError');
                expect(e.errors).to.be.an('object');
                expect(e.errors).to.have.keys(['user']);
                expect(e.errors.user.kind).to.be.eq('regexp');
            }
        });

        it('should raise error for user if id length is bigger than max value', async () => {
            try {
                await new User({user: '1'.repeat(25)}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ValidationError');
                expect(e.errors).to.be.an('object');
                expect(e.errors).to.have.keys(['user']);
                expect(e.errors.user.kind).to.be.eq('maxlength');
            }
        });

        it('should raise error for user if id length is bigger than min value', async () => {
            try {
                await new User({user: '1'.repeat(23)}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ValidationError');
                expect(e.errors).to.be.an('object');
                expect(e.errors).to.have.keys(['user']);
                expect(e.errors.user.kind).to.be.eq('minlength');
            }
        });
    });

    describe('count', () => {
        it('should raise error for count is bigger than max value', async () => {
            try {
                const user = new User({user: '1'.repeat(24), count: 251});
                await user.validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ValidationError');
                expect(e.errors).to.be.an('object');
                expect(e.errors).to.have.keys(['count']);
                expect(e.errors.count.kind).to.be.eq('max');
            }
        });
    });

    describe('groups', () => {
        it('should create user with 2 groups', async () => {
            try {
                const user = new User({
                    user: '1'.repeat(24),
                    groups: [
                        "5b4b57f1fc13ae1730000640",
                        "5b4b57f1fc13ae1730000641"
                    ],
                    count: 2
                });
                await user.validate();
                expect(user.isNew).to.be.eq(true);

                expect(user._id).to.be.an('object');
                expect(user._id.toString()).to.be.a('string');
                expect(user._id.toString()).to.have.lengthOf(24);

                expect(user.groups).to.be.an('array');
                expect(user.groups).to.be.deep.eq([
                    "5b4b57f1fc13ae1730000640",
                    "5b4b57f1fc13ae1730000641"
                ]);

                expect(user.count).to.be.eq(2);

                expect(user.createdAt).to.be.a('date');
                expect(user.updatedAt).to.be.a('date');

                expect(user.deletedAt).to.be.eq(null);
                expect(user.deleted).to.be.eq(false);
            } catch (e) {
                console.log(e);
                throw e;
            }
        });
    });
});
