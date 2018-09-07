import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { CreateGroupInput } from '../../../../src/graphql/inputs/create.group.input';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Grapql -> Inputs -> CreateGroupInput', () => {
    it('should initialize with default values', () => {
        const input = new CreateGroupInput();
        expect(input).to.be.a('object');
        expect(Object.keys(input)).to.be.deep.eq([]);
    });

    it('should raise ArgumentValidationError if name is not string', async () => {
        try {
            const input = new CreateGroupInput({name: 1} as any);
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('name', 'isString')).to.be.eq(true);
        }
    });

    it('should raise ArgumentValidationError if name length is shorter than 1', async () => {
        try {
            const input = new CreateGroupInput({name: ''});
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('name', 'length')).to.be.eq(true);
        }
    });

    it('should raise ArgumentValidationError if name length is longer than 35', async () => {
        try {
            const input = new CreateGroupInput({name: 'a'.repeat(36)});
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('name', 'length')).to.be.eq(true);
        }
    });
});
