export function checkApiKey(req: Request): boolean {
    const apiKeyHeader = req.headers.get('x-api-key');
    const validKey = process.env.API_KEY;

    return apiKeyHeader === validKey;
}
