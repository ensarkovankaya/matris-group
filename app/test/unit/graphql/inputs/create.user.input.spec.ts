import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { CreateUserInput } from '../../../../src/graphql/inputs/create.user.input';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Grapql -> Inputs -> CreateUserInput', () => {
    it('should initialize with default values', () => {
        const input = new CreateUserInput();
        expect(input).to.be.a('object');
        expect(Object.keys(input)).to.be.deep.eq([]);
    });

    it('should raise ArgumentValidationError if id is not string', async () => {
        try {
            const input = new CreateUserInput({id: 1} as any);
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('id', 'isString')).to.be.eq(true);
        }
    });

    it('should raise ArgumentValidationError if id length is shorter than 24', async () => {
        try {
            const input = new CreateUserInput({id: '1'.repeat(23)});
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('id', 'length')).to.be.eq(true);
        }
    });

    it('should raise ArgumentValidationError if id length is longer than 24', async () => {
        try {
            const input = new CreateUserInput({id: 'a'.repeat(25)});
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('id', 'length')).to.be.eq(true);
        }
    });
});
