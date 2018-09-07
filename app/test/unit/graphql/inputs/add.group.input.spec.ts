import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { AddGroupInput } from '../../../../src/graphql/inputs/add.group.input';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Grapql -> Inputs -> AddGroupInput', () => {
    it('should initialize with default values', async () => {
        const input = new AddGroupInput();
        expect(input).to.be.an('object');
        expect(Object.keys(input)).to.be.deep.eq([]);
    });

    it('should raise ArgumentValidationError for empty object', async () => {
        try {
            const input = new AddGroupInput();
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('userId', 'isMongoId')).to.be.eq(true);
            expect(e.hasError('groupId', 'isMongoId')).to.be.eq(true);
        }
    });

    it('should raise ArgumentValidationError if userId not a string', async () => {
        try {
            const input = new AddGroupInput({userId: 2, groupId: '1'.repeat(24)} as any);
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('userId', 'isMongoId')).to.be.eq(true);
            expect(e.hasError('groupId')).to.be.eq(false);
        }
    });

    it('should raise ArgumentValidationError if userId is shorter than 24', async () => {
        try {
            const input = new AddGroupInput({userId: '1'.repeat(23), groupId: '1'.repeat(24)} as any);
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('userId', 'isMongoId')).to.be.eq(true);
            expect(e.hasError('groupId')).to.be.eq(false);
        }
    });

    it('should raise ArgumentValidationError if userId is longer than 24', async () => {
        try {
            const input = new AddGroupInput({userId: '1'.repeat(25), groupId: '1'.repeat(24)} as any);
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('userId', 'isMongoId')).to.be.eq(true);
            expect(e.hasError('groupId')).to.be.eq(false);
        }
    });

    it('should raise ArgumentValidationError if groupId not a string', async () => {
        try {
            const input = new AddGroupInput({groupId: 2, userId: '1'.repeat(24)} as any);
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('groupId', 'isMongoId')).to.be.eq(true);
            expect(e.hasError('userId')).to.be.eq(false);
        }
    });

    it('should raise ArgumentValidationError if groupId is shorter than 24', async () => {
        try {
            const input = new AddGroupInput({groupId: '1'.repeat(23), userId: '1'.repeat(24)} as any);
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('groupId', 'isMongoId')).to.be.eq(true);
            expect(e.hasError('userId')).to.be.eq(false);
        }
    });

    it('should raise ArgumentValidationError if groupId is longer than 24', async () => {
        try {
            const input = new AddGroupInput({groupId: '1'.repeat(25), userId: '1'.repeat(24)} as any);
            await input.validate();
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('ArgumentValidationError');
            expect(e.hasError('groupId', 'isMongoId')).to.be.eq(true);
            expect(e.hasError('userId')).to.be.eq(false);
        }
    });
});
