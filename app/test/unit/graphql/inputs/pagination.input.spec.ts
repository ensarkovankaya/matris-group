import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { PaginationInput } from '../../../../src/graphql/inputs/pagination.input';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Grapql -> Inputs -> PaginationInput', () => {

    it('should initialize with default values', async () => {
        const input = await new PaginationInput().validate();
        expect(input).to.be.an('object');
        expect(input).to.be.deep.eq({page: 1, offset: 0, limit: 10});
    });

    describe('Page', () => {
        it('should raise validation error if page is string', async () => {
            try {
                await new PaginationInput({page: 'a'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('page', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if page is boolean', async () => {
            try {
                await new PaginationInput({page: true} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('page', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if page is object', async () => {
            try {
                await new PaginationInput({page: {}} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('page', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if page is null', async () => {
            try {
                await new PaginationInput({page: null} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('page', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if page is less than 1', async () => {
            try {
                await new PaginationInput({page: 0}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('page', 'min')).to.be.eq(true);
            }
        });

        it('should be valid if page is 1', async () => {
            await new PaginationInput({page: 1}).validate();
        });

        it('should be valid if page is 2', async () => {
            await new PaginationInput({page: 2}).validate();
        });

        it('should be valid if page is 10', async () => {
            await new PaginationInput({page: 10}).validate();
        });

        it('should be valid if page is 35', async () => {
            await new PaginationInput({page: 35}).validate();
        });

        it('should be valid if page is 350', async () => {
            await new PaginationInput({page: 350}).validate();
        });
    });

    describe('Offset', () => {
        it('should raise validation error if offset is string', async () => {
            try {
                await new PaginationInput({offset: 'a'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('offset', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if offset is boolean', async () => {
            try {
                await new PaginationInput({offset: true} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('offset', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if offset is object', async () => {
            try {
                await new PaginationInput({offset: {}} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('offset', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if offset is null', async () => {
            try {
                await new PaginationInput({offset: null} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('offset', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if offset is less than 0', async () => {
            try {
                await new PaginationInput({offset: -1}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('offset', 'min')).to.be.eq(true);
            }
        });

        it('should be valid if offset is 1', async () => {
            await new PaginationInput({offset: 1}).validate();
        });

        it('should be valid if offset is 2', async () => {
            await new PaginationInput({offset: 2}).validate();
        });

        it('should be valid if offset is 10', async () => {
            await new PaginationInput({offset: 10}).validate();
        });

        it('should be valid if offset is 35', async () => {
            await new PaginationInput({offset: 35}).validate();
        });

        it('should be valid if offset is 350', async () => {
            await new PaginationInput({offset: 350}).validate();
        });
    });

    describe('Limit', () => {
        it('should raise validation error if limit is string', async () => {
            try {
                await new PaginationInput({limit: 'a'} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('limit', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if limit is boolean', async () => {
            try {
                await new PaginationInput({limit: true} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('limit', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if limit is object', async () => {
            try {
                await new PaginationInput({limit: {}} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('limit', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if limit is null', async () => {
            try {
                await new PaginationInput({limit: null} as any).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('limit', 'isNumber')).to.be.eq(true);
            }
        });

        it('should raise validation error if limit is 0', async () => {
            try {
                await new PaginationInput({limit: 0}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('limit', 'isIn')).to.be.eq(true);
            }
        });

        it('should raise validation error if limit is 33', async () => {
            try {
                await new PaginationInput({limit: 33}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('limit', 'isIn')).to.be.eq(true);
            }
        });

        it('should raise validation error if limit is 1000', async () => {
            try {
                await new PaginationInput({limit: 1000}).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('limit', 'isIn')).to.be.eq(true);
            }
        });

        it('should be valid if limit is 5', async () => {
            const input = await new PaginationInput({limit: 5}).validate();
            expect(input).to.be.an('object');
            expect(input.limit).to.be.eq(5);
        });

        it('should be valid if limit is 10', async () => {
            const input = await new PaginationInput({limit: 10}).validate();
            expect(input).to.be.an('object');
            expect(input.limit).to.be.eq(10);
        });

        it('should be valid if limit is 25', async () => {
            const input = await new PaginationInput({limit: 25}).validate();
            expect(input).to.be.an('object');
            expect(input.limit).to.be.eq(25);
        });

        it('should be valid if limit is 50', async () => {
            const input = await new PaginationInput({limit: 50}).validate();
            expect(input).to.be.an('object');
            expect(input.limit).to.be.eq(50);
        });

        it('should be valid if limit is 100', async () => {
            const input = await new PaginationInput({limit: 100}).validate();
            expect(input).to.be.an('object');
            expect(input.limit).to.be.eq(100);
        });

        it('should be valid if limit is 150', async () => {
            const input = await new PaginationInput({limit: 150}).validate();
            expect(input).to.be.an('object');
            expect(input.limit).to.be.eq(150);
        });
    });
});
