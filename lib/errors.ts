export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export class InventoryError extends AppError {
    constructor(message: string) {
        super(message, 409); // Conflict
    }
}

export class PaymentError extends AppError {
    constructor(message: string) {
        super(message, 402); // Payment Required
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400); // Bad Request
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = "Forbidden") {
        super(message, 403);
    }
}
