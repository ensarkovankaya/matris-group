import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { GetGroupInput } from '../../../../src/graphql/inputs/get.group.input';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Grapql -> Inputs -> GetGroupInput', () => {
    it('should initialize with default values', () => {
        const input = new GetGroupInput();
        expect(input).to.be.a('object');
        expect(Object.keys(input)).to.be.deep.eq([]);
    });

    it('should validate empty', async () => {
        await new GetGroupInput().validate();
    });

    describe('Id', () => {
        it('should raise validation error if id is not string', async () => {
            try {
                await new GetGroupInput({id: 1} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('id', 'isMongoId')).to.be.eq(true);
            }
        });
        it('should validate', async () => {
            await new GetGroupInput({id: '1'.repeat(24)}).validate();
        });
        it('should raise validation error if id is shorter than 24 character', async () => {
            try {
                await new GetGroupInput({id: '1'.repeat(23)}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('id', 'length')).to.be.eq(true);
            }
        });
        it('should raise validation error if id is longer than 24 character', async () => {
            try {
                await new GetGroupInput({id: '1'.repeat(25)}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('id', 'length')).to.be.eq(true);
            }
        });
    });

    describe('name', () => {
        it('should raise validation error if name is not string', async () => {
            try {
                await new GetGroupInput({name: 1} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if name is shorter than 1', async () => {
            try {
                await new GetGroupInput({name: ''} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if name is longer than 35', async () => {
            try {
                await new GetGroupInput({name: 'a'.repeat(36)} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if name is not match with regex "^[a-zA-Z0-9 ]+$"', async () => {
            try {
                await new GetGroupInput({name: 'Not_a_Valid_Name'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'matches')).to.be.eq(true);
            }

            try {
                await new GetGroupInput({name: 'Group : A'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'matches')).to.be.eq(true);
            }

            try {
                await new GetGroupInput({name: 'Group 1-1'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'matches')).to.be.eq(true);
            }

            try {
                await new GetGroupInput({name: 'Group?-*'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'matches')).to.be.eq(true);
            }
        });

        it('should be valid with name "Group 1"', async () => {
            await new GetGroupInput({name: 'Group 1'} as any).validate();
        });

        it('should be valid with name "Group Çarşamba"', async () => {
            await new GetGroupInput({name: 'Group Çarşamba'} as any).validate();
        });

        it('should be valid with name "Hazırlık 1"', async () => {
            await new GetGroupInput({name: 'Hazırlık 1'} as any).validate();
        });

        it('should be valid with name "Öğretmenler"', async () => {
            await new GetGroupInput({name: 'Öğretmenler'} as any).validate();
        });

        it('should be valid with name "Admins"', async () => {
            await new GetGroupInput({name: 'Admins'} as any).validate();
        });

        it('should be valid with name "Yöneticiler"', async () => {
            await new GetGroupInput({name: 'Yöneticiler'} as any).validate();
        });
    });

    describe('Slug', () => {
        it('should raise validation error if slug is not string', async () => {
            try {
                await new GetGroupInput({slug: 1} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'isString')).to.be.eq(true);
            }
        });
        it('should raise validation error if slug is shorter than 1', async () => {
            try {
                await new GetGroupInput({slug: ''} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if slug is longer than 35', async () => {
            try {
                await new GetGroupInput({slug: 'a'.repeat(36)} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if slug is mnot lowercase', async () => {
            try {
                await new GetGroupInput({slug: 'Group1'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'isLowercase')).to.be.eq(true);
            }
        });

        it('should raise validation error if slug is not match with regex "^[a-z0-9\-]+$"', async () => {
            try {
                await new GetGroupInput({slug: 'Not_a_Valid_slug'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'matches')).to.be.eq(true);
            }

            try {
                await new GetGroupInput({slug: 'group a'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'matches')).to.be.eq(true);
            }

            try {
                await new GetGroupInput({slug: 'çarşamba'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'matches')).to.be.eq(true);
            }

            try {
                await new GetGroupInput({slug: 'yöneticiler'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'matches')).to.be.eq(true);
            }

            try {
                await new GetGroupInput({slug: 'öğretmenler'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('slug', 'matches')).to.be.eq(true);
            }
        });

        it('should be valid with slug "group-1"', async () => {
            await new GetGroupInput({slug: 'group-1'} as any).validate();
        });

        it('should be valid with slug "group-carsamba"', async () => {
            await new GetGroupInput({slug: 'group-carsamba'} as any).validate();
        });

        it('should be valid with slug "hazirlik-1"', async () => {
            await new GetGroupInput({slug: 'hazirlik-1'} as any).validate();
        });

        it('should be valid with slug "ogretmenler"', async () => {
            await new GetGroupInput({slug: 'ogretmenler'} as any).validate();
        });

        it('should be valid with slug "admins"', async () => {
            await new GetGroupInput({slug: 'admins'} as any).validate();
        });

        it('should be valid with slug "yoneticiler"', async () => {
            await new GetGroupInput({slug: 'yoneticiler'} as any).validate();
        });
    });
});
