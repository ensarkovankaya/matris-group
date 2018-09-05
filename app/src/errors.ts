/**
 * If function or method argument not satisfied curten conditions
 */
export class InvalidArgument extends Error {
    public name = 'InvalidArgument';
    public argument: string;

    constructor(argument: string, message?: string) {
        super(message);
        this.argument = argument;
    }
}

export class GroupNotFound extends Error {
    public name = 'GroupNotFound';
}

export class GroupExists extends Error {
    public name = 'GroupExists';
}

export class UserAlreadyInGroup extends Error {
    public name = 'UserAlreadyInGroup';
}

export class UserNotFound extends Error {
    public name = 'UserNotFound';
}

export class UserExists extends Error {
    public name = 'UserExits';
}

export class InvalidDocument extends Error {
    public name = 'InvalidDocument';
}
