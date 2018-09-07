import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { GroupFilterInput } from '../../../../src/graphql/inputs/group.filter.input';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Grapql -> Inputs -> GroupFilterInput', () => {

    it('should validate empty', async () => {
        const input = await new GroupFilterInput().validate();
        expect(input).to.be.an('object');
        expect(Object.keys(input)).to.be.deep.eq([]);
    });

    describe('Deleted', () => {
        it('should raise validation error if deleted is string', async () => {
            try {
                await new GroupFilterInput({deleted: 'a'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('deleted', 'isBoolean')).to.be.eq(true);
            }
        });

        it('should raise validation error if deleted is number', async () => {
            try {
                await new GroupFilterInput({deleted: 1} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('deleted', 'isBoolean')).to.be.eq(true);
            }
        });

        it('should be valid if deleted is true', async () => {
            const input = await new GroupFilterInput({deleted: true}).validate();
            expect(input).to.be.an('object');
            expect(input).to.have.keys(['deleted']);
            expect(input.deleted).to.be.eq(true);
        });
    });

    describe('Name', () => {
        it('should raise validation error if name is number', async () => {
            try {
                await new GroupFilterInput({name: 1} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if name is object', async () => {
            try {
                await new GroupFilterInput({name: {}} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if name is boolean', async () => {
            try {
                await new GroupFilterInput({name: true} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if name length is less than 1', async () => {
            try {
                await new GroupFilterInput({name: ''}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if name length is more than 35', async () => {
            try {
                await new GroupFilterInput({name: 'a'.repeat(36)}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if name includes invalid characters', async () => {
            try {
                await new GroupFilterInput({name: 'Group ?-_'}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'matches')).to.be.eq(true);
            }
        });

        it('should be valid if name is "Öğrenciler"', async () => {
            const input = await new GroupFilterInput({name: 'Öğrenciler'}).validate();
            expect(input).to.be.an('object');
            expect(input).to.be.deep.eq({name: 'Öğrenciler'});
        });

        it('should be valid if name is "Yöneticiler"', async () => {
            const input = await new GroupFilterInput({name: 'Yöneticiler'}).validate();
            expect(input).to.be.an('object');
            expect(input).to.be.deep.eq({name: 'Yöneticiler'});
        });
    });

    describe('Slug', () => {
        it('should raise validation error if slug is number', async () => {
            try {
                await new GroupFilterInput({slug: 1} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if slug is object', async () => {
            try {
                await new GroupFilterInput({slug: {}} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if slug is boolean', async () => {
            try {
                await new GroupFilterInput({slug: true} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if slug length is less than 1', async () => {
            try {
                await new GroupFilterInput({slug: ''}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if slug length is more than 35', async () => {
            try {
                await new GroupFilterInput({slug: 'a'.repeat(36)}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if slug is not lowercase', async () => {
            try {
                await new GroupFilterInput({slug: 'Group'}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'isLowercase')).to.be.eq(true);
            }
        });

        it('should raise validation error if slug includes empty spaces', async () => {
            try {
                await new GroupFilterInput({slug: 'group 1 '}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'matches')).to.be.eq(true);
            }
        });

        it('should raise validation error if slug includes invalid characters', async () => {
            try {
                await new GroupFilterInput({slug: 'group-*?'}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'matches')).to.be.eq(true);
            }
        });

        it('should be valid if slug is "ogrenciler"', async () => {
            const input = await new GroupFilterInput({slug: 'ogrenciler'}).validate();
            expect(input).to.be.an('object');
            expect(input).to.be.deep.eq({slug: 'ogrenciler'});
        });

        it('should be valid if slug is "yoneticiler"', async () => {
            const input = await new GroupFilterInput({slug: 'yoneticiler'}).validate();
            expect(input).to.be.an('object');
            expect(input).to.be.deep.eq({slug: 'yoneticiler'});
        });
    });

    describe('Users', () => {
        it('should raise validation error if users is string', async () => {
            try {
                await new GroupFilterInput({users: 'user1'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('users', 'isArray')).to.be.eq(true);
            }
        });

        it('should raise validation error if users is number', async () => {
            try {
                await new GroupFilterInput({users: 1} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('users', 'isArray')).to.be.eq(true);
            }
        });

        it('should raise validation error if users is boolean', async () => {
            try {
                await new GroupFilterInput({users: true} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('users', 'isArray')).to.be.eq(true);
            }
        });

        it('should raise validation error if users is boolean', async () => {
            try {
                await new GroupFilterInput({users: true} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('users', 'isArray')).to.be.eq(true);
            }
        });

        it('should raise validation error if users is conatins number', async () => {
            try {
                await new GroupFilterInput({users: ['a'.repeat(24), 1]} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('users', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if users is conatins boolean', async () => {
            try {
                await new GroupFilterInput({users: ['a'.repeat(24), true]} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('users', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if users is conatins object', async () => {
            try {
                await new GroupFilterInput({users: ['a'.repeat(24), {}]} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('users', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if users is conatins null', async () => {
            try {
                await new GroupFilterInput({users: ['a'.repeat(24), null]} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('users', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if any user id is shorter than 24 character', async () => {
            try {
                await new GroupFilterInput({users: ['a'.repeat(24), 'b'.repeat(23)]} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('users', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if any user id is longer than 24 character', async () => {
            try {
                await new GroupFilterInput({users: ['a'.repeat(24), 'b'.repeat(25)]} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('users', 'length')).to.be.eq(true);
            }
        });
    });

    it('should be valid', async () => {
        const input = await new GroupFilterInput({
            deleted: true,
            name: 'Group 1',
            slug: 'group-1',
            users: ['a'.repeat(24), 'b'.repeat(24)]
        }).validate();
        expect(input).to.be.an('object');
        expect(input).to.be.deep.eq({
            deleted: true,
            name: 'Group 1',
            slug: 'group-1',
            users: ['a'.repeat(24), 'b'.repeat(24)]
        });
    });

    it('should discard extra fields', async () => {
        const input = await new GroupFilterInput({
            deleted: true,
            extra: 'field'
        } as any).validate();
        expect(input).to.be.an('object');
        expect(input).to.deep.eq({deleted: true});
    });
});
