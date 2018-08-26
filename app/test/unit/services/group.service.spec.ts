import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'reflect-metadata';
import { Container } from 'typedi';
import { GroupService } from '../../../src/services/group.service';

describe('Unit -> Services -> GroupService', () => {

    it('should initialize', () => {
        const service = Container.get<GroupService>('GroupService');
        expect(service).to.be.instanceof(GroupService);
        expect(service.toGroup).to.be.a('function');
        expect(service.get).to.be.a('function');
        expect(service.getUserGroups).to.be.a('function');
        expect(service.create).to.be.a('function');
        expect(service.delete).to.be.a('function');
        expect(service.undelete).to.be.a('function');
        expect(service.addUser).to.be.a('function');
        expect(service.removeUser).to.be.a('function');
        expect(service.normalize).to.be.a('function');
    });

    /* it('should normalize given names', () => {
        const service = Container.get<GroupService>('GroupService');

    });

    describe('Crate', () => {
        it('should create group', async () => {
            const name = generateRandomString(10);
        });
    }); */
});
