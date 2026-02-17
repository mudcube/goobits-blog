export class AuthPrincipalResolutionError extends Error {
    code = "AUTH_PRINCIPAL_RESOLUTION_FAILED";
    status;
    constructor(message = "Unable to resolve authenticated principal", status = 401) {
        super(message);
        this.name = "AuthPrincipalResolutionError";
        this.status = status;
    }
}
export class AuthAdapterCapabilityError extends Error {
    code = "AUTH_ADAPTER_CAPABILITY_UNSUPPORTED";
    status;
    constructor(message = "Adapter capability not supported", status = 501) {
        super(message);
        this.name = "AuthAdapterCapabilityError";
        this.status = status;
    }
}
//# sourceMappingURL=auth.js.map