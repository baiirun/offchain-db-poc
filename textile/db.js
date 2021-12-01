import { Client, PrivateKey, ThreadID } from '@textile/hub';
/**
 * Centralized Textile Hub Auth
 *
 * There's two ways to do auth with the centralized Textile Hub. They generally follow typical web2 authentication schemes with key/secret pairs
 * being used to request access via a token.
 * 1. "Dev mode" – This makes it so the Hub only requires your user key and does not require your user group secret when interacting with the hub
 *                 client and the hub server. You only require your user key in order to "authenticate" and get a token for operations.
 * 2. "Prod mode" – This requires your user group secret and your user key to be able to authenticate and get a token for operations on the client
 *                  and server.
 *
 * This demo uses "Dev mode" and is not intended to be used in production. Since this is a free account and there's nothing security-related within
 * this demo app it's not a big deal to just share within the team. We can also make "Organizations" within the Hub and have multiple users with multiple
 * key/secret pairs that way.
 *
 * **The Demo has the secret key associated with this user group hard coded already**
 *
 * Docs:
 * https://docs.textile.io/hub/apis/
 * https://docs.textile.io/hub/apis/#non-signing-user-group-keys
 */
/**
 * Storage in ThreadDB
 *
 * The hierarchy of ThreadDB is similar to what you'd expect to find in MongoDB.
 * * A Thread can contain multiple Databases.
 * * A Database can contain multiple Collections. (Tables)
 * * A Collection can contain multiple Instances. (Rows)
 *
 * As far as I can tell, Storage in ThreadDB is scoped to a user group, so if you do not have access to the user group's key/secret pair you cannot access
 * the data in that user groups' Threads.
 */
export const keyInfo = {
    key: 'blyf6xqz42ww57wgxxjbrmvq5aa',
    // token: eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0.eyJpYXQiOjE2MzcxNzY2ODYsImlzcyI6ImJiYWFyZWlnd2pvYXd1ZWc1a3ZobWMzNjI3Z3Zja2htZTd6emZlbnVqYXVqcHRodGd6Y21odHRvYTZ1Iiwic3ViIjoiYmJhYXJlaWczcG5sc2F5dzNyZmd3cmQ1M3NrbTc0NzdrZmtxZmg2b2F4Y21yd2Vmenh6cGJqbHY0bmEifQ.UNSiJDj1dJzoqWVUE8vmuO-wlsup3t0zQlKkV891lB5BUKHHhLiReGromPM6qfos3VtQDxM0as324Zoy9fQzDw
    // secret: 'b6miidj7lfmqnoczuoynt4bqyveaiuwou5c7nooa'
};
// Since we are using unsigned keys we don't need to pass a secret and set a signature
export async function setupClient(auth) {
    // Generate a client with only key info and not auth signatures. There is also
    // Client.withUserAuth(auth) which requires an authentication signature.
    // See createApiSIG above ^
    const client = await Client.withKeyInfo(auth);
    // As far as I can tell the Token actually gets set internally in the client when calling
    // `getToken.` You don't actually have to pass the token to anything. If this identity
    // changes, then you will lose access to the data associated with this identity.
    const token = await client.getToken(PrivateKey.fromString('bbaareieq5pk4mua5mb447k5ft3gy4qsdjzx5y6wwiwik4kp6gdsitrfmzu'));
    return client;
}
async function createTable(client) {
    // Create a new DB with the name NASA and no id. If we don't pass an ID it gets autogenerated.
    const threadId = await client.newDB(undefined, 'nasa');
    // This will be an instance of "astronauts" collection in the "nasa" DB. Empty _id means it will be autogenerated.
    const lightyear = {
        name: 'Lightyear',
        missions: 5,
        _id: '',
    };
    const buzz = {
        name: 'Buzz',
        missions: 5,
        _id: '',
    };
    // Create a new collection from an object. We name it "astronauts" and generate the schema
    // from the buzz object
    await client.newCollectionFromObject(threadId, buzz, { name: 'astronauts' });
    // Store the buzz object in the new collection as an instance (row)
    const instanceIds = await client.create(threadId, 'astronauts', [buzz, lightyear]);
    return {
        threadId,
        instanceIds,
    };
}
export async function createAstronaut(client, astronaut) {
    // You can create multiple instances at once by passing them as an array. client.create also returns an array
    // of the instance IDs of the created Instances.
    const [newAstronautId] = await client.create(await getThreadId(client, 'nasa'), 'astronauts', [astronaut]);
    return newAstronautId;
}
export async function findAstronaut(client, astronautId) {
    const threadId = await getThreadId(client, 'nasa');
    return await client.findByID(threadId, 'astronauts', astronautId);
}
export async function deleteAstronaut(client, astronautId) {
    const threadId = await getThreadId(client, 'nasa');
    await client.delete(threadId, 'astronauts', [astronautId]);
    return astronautId;
}
export async function findAllAstronauts(client) {
    const threadId = await getThreadId(client, 'nasa');
    return await client.find(threadId, 'astronauts', {});
}
async function listCollections(client) {
    const threadId = await getThreadId(client, 'nasa');
    return await client.listCollections(threadId);
}
// The interactions around ThreadIDs are a little confusing. A ThreadID is actually an object. If you call
// `client.getThread` you get `GetThreadResponse` which has an `id` property. This is _not_ the same as the
// ThreadID. You can use the ThreadID.fromString method to convert the GetThreadResponse.id to a ThreadID.
export async function getThreadId(client, threadName) {
    const thread = await client.getThread(threadName);
    return ThreadID.fromString(thread.id);
}
export async function startListener(client, threadID, callback) {
    const filters = [{ actionTypes: ['CREATE', 'DELETE'] }];
    return client.listen(threadID, filters, callback);
}
// const { threadId } = await createTable(client);
// const astronautId = await createAstronaut(client, {
//     name: 'Carl',
//     missions: 5000,
//     _id: '',
// });
// console.log(await findAllAstronauts(client));
