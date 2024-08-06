import { InvalidRequest, NetworkError } from "./error"

const base_api_url = 'http://localhost:8080/'
const CONTENT_TYPE_JSON = 'application/json'

function toFullUrl(request: Request): string {
    return base_api_url + request.path
}

export type Request = {
    path: string
    method: string
    body?: Body
}

type Body = KeyValuePair[]

export type KeyValuePair = {
    name: string,
    value: string
}

function buildBody(fields: KeyValuePair[]): string {
    const body: any = {}
    fields.forEach(field => {
        body[field.name] = field.value
    })
    return JSON.stringify(body)
}

function validateRequestMethod(request: Request): boolean {
    const method = request.method.toUpperCase()
    return request.path !== undefined && (method === 'GET' || method === 'POST' || method === 'PUT' || method === 'DELETE')
}

export async function doFetch(
    request: Request,
): Promise<Response> {
    if (request && validateRequestMethod(request)) {
        
        const headers: any = {
            'Content-Type': CONTENT_TYPE_JSON
        }

        try {
            return await fetch(toFullUrl(request), {
                method: request.method,
                headers,
                //credentials: 'include', // TODO: see what this does later!
                body: request.body ? buildBody(request.body) : undefined
            })
        } catch (error: any) {
            // Network exception!
            return Promise.reject(new NetworkError(error.message))
        }
    }

    return Promise.reject(InvalidRequest)
}

export function toBody(obj: any): Body {
    const body: Body = []
    for (const key in obj) {
        body.push({ name: key, value: obj[key] })
    }
    return body
}