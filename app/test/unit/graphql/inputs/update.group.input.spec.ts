import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { UpdateGroupInput } from '../../../../src/graphql/inputs/update.group.input';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Grapql -> Inputs -> UpdateGroupInput', () => {
    it('should be invalid with default values', async () => {
        try {
            await new UpdateGroupInput().validate();
            throw new UpdateGroupInput();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('name')).to.be.eq(true);
            expect(e.hasError('id')).to.be.eq(true);
        }
    });

    describe('Id', () => {
        it('should raise validation error if id is number', async () => {
            try {
                await new UpdateGroupInput({id: 1} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('id', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if id is boolean', async () => {
            try {
                await new UpdateGroupInput({id: true} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('id', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if id is object', async () => {
            try {
                await new UpdateGroupInput({id: {}} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('id', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if id is null', async () => {
            try {
                await new UpdateGroupInput({id: null} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('id', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if id is shorter than 24 character', async () => {
            try {
                await new UpdateGroupInput({id: '1'.repeat(23)} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('id', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if id is longer than 24 character', async () => {
            try {
                await new UpdateGroupInput({id: '1'.repeat(25)} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('id', 'length')).to.be.eq(true);
            }
        });
    });

    describe('Name', () => {
        it('should raise validation error if name is number', async () => {
            try {
                await new UpdateGroupInput({name: 1} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if name is null', async () => {
            try {
                await new UpdateGroupInput({name: null} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if name is object', async () => {
            try {
                await new UpdateGroupInput({name: {}} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'isString')).to.be.eq(true);
            }
        });

        it('should raise validation error if name is shorter than 1', async () => {
            try {
                await new UpdateGroupInput({name: ''} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if name is longer than 35', async () => {
            try {
                await new UpdateGroupInput({name: 'a'.repeat(36)} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'length')).to.be.eq(true);
            }
        });

        it('should raise validation error if name is not match with regex "^[a-zA-Z0-9 ]+$"', async () => {
            try {
                await new UpdateGroupInput({name: 'Not_a_Valid_Name'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'matches')).to.be.eq(true);
            }

            try {
                await new UpdateGroupInput({name: 'Group : A'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'matches')).to.be.eq(true);
            }

            try {
                await new UpdateGroupInput({name: 'Group 1-1'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'matches')).to.be.eq(true);
            }

            try {
                await new UpdateGroupInput({name: 'Group?-*'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('name', 'matches')).to.be.eq(true);
            }
        });
    });

    it('should be valid', async () => {
        const input = await new UpdateGroupInput({name: 'Group 1', id: '1'.repeat(24)}).validate();
        expect(input).to.be.an('object');
        expect(input).to.be.deep.eq({name: 'Group 1', id: '1'.repeat(24)});
    });
});
