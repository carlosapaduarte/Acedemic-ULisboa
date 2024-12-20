export class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NetworkError";
    }
}

export class NotAuthorizedError extends Error {
}

export class BackendError extends Error {
    constructor(message: string, public status: number) {
        super(message);
        this.name = "ServerError";
        this.status = status;
    }
}

export class InvalidRequest extends Error {
}