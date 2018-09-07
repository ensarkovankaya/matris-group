import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { GetUserInput } from '../../../../src/graphql/inputs/get.user.input';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Grapql -> Inputs -> GetUserInput', () => {
    it('should initialize with default values', () => {
        const input = new GetUserInput();
        expect(input).to.be.an('object');
        expect(input.id).to.be.eq('');
        expect(input.deleted).to.be.eq(false);
    });

    it('should raise validation error for default values', async () => {
        try {
            await new GetUserInput().validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('id')).to.be.eq(true);
        }
    });

    it('should raise validation error if id is not string', async () => {
        try {
            await new GetUserInput({id: 1} as any).validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('id', 'isString')).to.be.eq(true);
        }
    });

    it('should raise validation error if id length shorter than 24 character', async () => {
        try {
            await new GetUserInput({id: '1'.repeat(23)} as any).validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('id', 'length')).to.be.eq(true);
        }
    });

    it('should raise validation error if id length longer than 24 character', async () => {
        try {
            await new GetUserInput({id: '1'.repeat(25)} as any).validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('id', 'length')).to.be.eq(true);
        }
    });

    it('should raise validation error if deleted is not a boolean', async () => {
        try {
            await new GetUserInput({id: '1'.repeat(24), deleted: 'a'} as any).validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('deleted', 'isBoolean')).to.be.eq(true);
        }
    });

    it('should raise validation error if deleted is not a boolean', async () => {
        try {
            await new GetUserInput({id: '1'.repeat(24), deleted: 0} as any).validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('deleted', 'isBoolean')).to.be.eq(true);
        }
    });

    it('should be valid if deleted is true', async () => {
        const input = await new GetUserInput({id: '1'.repeat(24), deleted: true}).validate();
        expect(input).to.be.an('object');
        expect(input).to.have.keys(['id', 'deleted']);
        expect(input.id).to.be.eq('1'.repeat(24));
        expect(input.deleted).to.be.eq(true);
    });

    it('should be valid if deleted is false', async () => {
        const input = await new GetUserInput({id: '1'.repeat(24), deleted: false}).validate();
        expect(input).to.be.an('object');
        expect(input).to.have.keys(['id', 'deleted']);
        expect(input.id).to.be.eq('1'.repeat(24));
        expect(input.deleted).to.be.eq(false);
    });

    it('deleted attribute should be false if not given', async () => {
        const input = await new GetUserInput({id: '1'.repeat(24), deleted: false}).validate();
        expect(input).to.be.an('object');
        expect(input).to.have.keys(['id', 'deleted']);
        expect(input.id).to.be.eq('1'.repeat(24));
        expect(input.deleted).to.be.eq(false);
    });

    it('should discard extra fields', async () => {
        const input = await new GetUserInput({id: '1'.repeat(24), unrelatedField: 1} as any).validate();
        expect(input).to.be.an('object');
        expect(input).to.have.keys(['id', 'deleted']);
        expect(input.id).to.be.eq('1'.repeat(24));
        expect(input.deleted).to.be.eq(false);
    });
});
