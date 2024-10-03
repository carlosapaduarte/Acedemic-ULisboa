import { BASE_API_URL } from "./config";
import { InvalidRequest, NetworkError, NotAuthorizedError } from "./error";

const CONTENT_TYPE_JSON = "application/json";

function toFullUrl(request: Request): string {
    return BASE_API_URL + request.path;
}

export type KeyValuePair = {
    name: string,
    value: string
}

type JsonBody = KeyValuePair[]

export type Request = {
    path: string
    method: string
    body?: JsonBody | FormData
}

function toJsonString(fields: KeyValuePair[]): string {
    const body: any = {};
    fields.forEach(field => {
        body[field.name] = field.value;
    });
    return JSON.stringify(body);
}

function validateRequestMethod(request: Request): boolean {
    const method = request.method.toUpperCase();
    return request.path !== undefined && (method === "GET" || method === "POST" || method === "PUT" || method === "DELETE");
}

export async function doFetch(
    request: Request
): Promise<Response> {
    if (request && validateRequestMethod(request)) {
        const headers: any = {};

        // Adds Content Type only if body is of type JSON
        const isBodyTypeJson = !(request.body == undefined || request.body instanceof FormData)
        if (isBodyTypeJson) {
            const contentType = isBodyTypeJson ? CONTENT_TYPE_JSON : undefined
            headers["Content-Type"] = contentType
        }

        // Add JWT token if is stored in local cache
        const jwt = localStorage["jwt"]
        if (jwt) {
            const auth = jwt ? `bearer ${localStorage["jwt"]}` : undefined
            headers["Authorization"] = auth
        }

        // If body is JSON, format with {}
        let formattedBody: any = request.body
        if (isBodyTypeJson)
            formattedBody = toJsonString(formattedBody)

        try {
            const res = await fetch(toFullUrl(request), {
                method: request.method,
                headers,
                //credentials: 'include', // TODO: see what this does later!
                body: formattedBody
            });

            if (res.status == 401)
                return Promise.reject(new NotAuthorizedError())

            return res
        } catch (error: any) {
            // Network exception!
            return Promise.reject(new NetworkError(error.message));
        }
    }

    return Promise.reject(InvalidRequest);
}

export function toJsonBody(obj: any): JsonBody {
    const body: JsonBody = [];
    for (const key in obj) {
        body.push({ name: key, value: obj[key] });
    }
    return body;
}