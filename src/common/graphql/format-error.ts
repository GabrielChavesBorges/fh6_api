import { GraphQLFormattedError } from "graphql";

const STATUS_TO_CODE: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHENTICATED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
};

export function formatError(formattedError: GraphQLFormattedError): GraphQLFormattedError {
    const status = formattedError.extensions?.status;
    const code = typeof status === 'number' ? STATUS_TO_CODE[status] : undefined;
    if (!code) {
        return formattedError;
    }

    return { ...formattedError, extensions: { ...formattedError, code }};
}