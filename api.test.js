const request = require("supertest");
const jwt = require("jsonwebtoken");
const { app, client, server } = require("./server");

let TEST_USER_A_JWT;
let TEST_USER_A_ID;

let TEST_USER_B_JWT;
let TEST_USER_B_ID;

beforeAll(async () => {
    // Create test case users (if they don't already exist) and get their JWT tokens
    await request(app)
        .post('/api/register')
        .send({
            Login: "$TEST_USER_A$",
            Password: "$TEST_USER_PASSWORD$",
            Email: "dummy@email.com",
            FirstName: "Test",
            LastName: "User",
            School: "",
            Work: ""
        })
        .expect(200);

    const loginARes = await request(app)
        .post('/api/login')
        .send({
            Login: "$TEST_USER_A$",
            Password: "$TEST_USER_PASSWORD$"
        })
        .expect(200);

    TEST_USER_A_JWT = loginARes.body.JwtToken.accessToken;
    TEST_USER_A_ID = jwt
        .decode(TEST_USER_A_JWT, {complete:true})
        .payload
        .userId
        .toString();

    await request(app)
        .post('/api/register')
        .send({
            Login: "$TEST_USER_B$",
            Password: "$TEST_USER_PASSWORD$",
            Email: "dummy@email.com",
            FirstName: "Test",
            LastName: "User",
            School: "",
            Work: ""
        })
        .expect(200);

    const loginBRes = await request(app)
        .post('/api/login')
        .send({
            Login: "$TEST_USER_B$",
            Password: "$TEST_USER_PASSWORD$"
        })
        .expect(200);

    TEST_USER_B_JWT = loginBRes.body.JwtToken.accessToken;
    TEST_USER_B_ID = jwt
        .decode(TEST_USER_B_JWT, {complete:true})
        .payload
        .userId
        .toString();
});

afterAll(async () => {
    await client.close();
    server.close();
});

describe("API Tests", () => {
    test('login on the test user', async () => {
        const data = {
            Login: "$TEST_USER_A$",
            Password: "$TEST_USER_PASSWORD$"
        };
        const res = await request(app).post('/api/login').send(data).expect(200);
        expect(res.body.Error).toBe(null); 
    });

    test('login on the test user with the incorrect password', async () => {
        const data = {
            Login: "$TEST_USER_A$",
            Password: "wrong_password_bozo"
        };
        const res = await request(app).post('/api/login').send(data).expect(200);
        expect(res.body.Error).not.toBe(null); 
    });

    test("login to a user that doesn't exist", async() => {
        const data = {
            Login: "$BAD_LOGIN$",
            Password: "$BAD_PASSWORD$"
        };
        const res = await request(app).post('/api/login').send(data).expect(200);
        expect(res.body.Error).not.toBe(null);
    });

    test("registering a user that already exist", async() => {
        const data = {
            Login: "test",
            Password: "totally_secure_password",
            FirstName: "Test",
            LastName: "User",
            School: "",
            Work: ""
        };
        const res = await request(app).post('/api/register').send(data).expect(200);
        expect(res.body.Error).not.toBe(null);
    });

    test("registering a user with bad credentials", async() => {
        let data = {
            Login: "",
            Password: "password",
            FirstName: "name",
            LastName: "name",
            School: "",
            Work: ""
        };
        let res = await request(app).post('/api/register').send(data).expect(200);
        expect(res.body.Error).not.toBe(null);

        data = {
            Login: "login",
            Password: "",
            FirstName: "name",
            LastName: "name",
            School: "",
            Work: ""
        };
        res = await request(app).post('/api/register').send(data).expect(200);
        expect(res.body.Error).not.toBe(null);

        data = {
            Login: "login",
            Password: "password",
            FirstName: "",
            LastName: "name",
            School: "",
            Work: ""
        };
        res = await request(app).post('/api/register').send(data).expect(200);
        expect(res.body.Error).not.toBe(null);

        data = {
            Login: "login",
            Password: "password",
            FirstName: "name",
            LastName: "",
            School: "",
            Work: ""
        };
        res = await request(app).post('/api/register').send(data).expect(200);
        expect(res.body.Error).not.toBe(null);

        data = {
            Login: "",
            Password: "",
            FirstName: "",
            LastName: "",
            School: "",
            Work: ""
        };
        res = await request(app).post('/api/register').send(data).expect(200);
        expect(res.body.Error).not.toBe(null);
    });

    test('retrieving the profile of the test user', async () => {
        const data = {
            _id: "634b740db076952180cb8e5a",
        };
        const res = await request(app).post('/api/retrieveprofile').send(data).expect(200);
        expect(res.body.Error).toBe(null);
        expect(res.body.FirstName).toBe("Test");
        expect(res.body.LastName).toBe("User");
    });

    test("retrieving the profile of a user that doesn't exist", async () => {
        const data = {
            _id: "bad_id",
        };
        const res = await request(app).post('/api/retrieveprofile').send(data).expect(200);
        expect(res.body.Error).not.toBe(null);
    });

    test("following another user", async () => {
        let data = {
            _id: TEST_USER_A_ID,
            ToFollow: "$TEST_USER_B$",
            JwtToken: TEST_USER_A_JWT
        };
        let res = await request(app).post('/api/follow').send(data).expect(200);
        expect(res.body.Error).toBe(null);

        data = {
            _id: TEST_USER_B_ID,
            ToFollow: "$TEST_USER_A$",
            JwtToken: TEST_USER_B_JWT
        };
        res = await request(app).post('/api/follow').send(data).expect(200);
        expect(res.body.Error).toBe(null);
    });

    test("unfollowing another user", async () => {
        let data = {
            _id: TEST_USER_B_ID,
            ToUnfollow: TEST_USER_A_ID,
            JwtToken: TEST_USER_B_JWT
        };
        let res = await request(app).post('/api/unfollow').send(data).expect(200);
        expect(res.body.Error).toBe(null);

        data = {
            _id: TEST_USER_A_ID,
            ToUnfollow: TEST_USER_B_ID,
            JwtToken: TEST_USER_A_JWT
        };
        res = await request(app).post('/api/unfollow').send(data).expect(200);
        expect(res.body.Error).toBe(null);
    });

    test("trying to follow ourselves", async () => {
        const data = {
            _id: TEST_USER_A_ID,
            ToFollow: "$TEST_USER_A$",
            JwtToken: TEST_USER_A_JWT
        };
        const res = await request(app).post('/api/follow').send(data).expect(200);
        expect(res.body.Error).not.toBe(null);
    });

    test("creating, joining, and deleting a channel + messages", async () => {
        // Create the channel
        const newChannelInfo = {
            JwtToken: TEST_USER_A_JWT,
            Title: "$TEST CHANNEL$"
        };
        let res = await request(app).post('/api/createchannel').send(newChannelInfo).expect(200);
        expect(res.body.Error).toBe(null);

        // Should be the only channel the user has
        res = await request(app)
            .post('/api/getchannels')
            .send({ JwtToken: TEST_USER_A_JWT })
            .expect(200);
        expect(res.body.Error).toBe(null);
        expect(res.body.Channels.length).toBe(1);

        // Create the invite code
        const channelId = res.body.Channels[0];
        const inviteCodeInfo = {
            JwtToken: TEST_USER_A_JWT,
            Channel: channelId
        };
        res = await request(app)
            .post('/api/getinvitecode')
            .send(inviteCodeInfo)
            .expect(200);
        expect(res.body.Error).toBe(null);

        // Join the channel
        const joinInfo = {
            JwtToken: TEST_USER_B_JWT,
            InviteCode: res.body.InviteCode
        };
        res = await request(app)
            .post('/api/joinchannel')
            .send(joinInfo)
            .expect(200);
        expect(res.body.Error).toBe(null);

        // Should be the only channel the user has
        res = await request(app)
            .post('/api/getchannels')
            .send({ JwtToken: TEST_USER_B_JWT })
            .expect(200);
        expect(res.body.Error).toBe(null);
        expect(res.body.Channels.length).toBe(1);

        // Both users should be in the members list and should be the only ones
        res = await request(app)
            .post('/api/listmembers')
            .send({ 
                JwtToken: TEST_USER_A_JWT,
                Channel: channelId,
                Offset: 0,
                Count: 999
            })
            .expect(200);
        expect(res.body.Error).toBe(null);
        expect(res.body.Members.length).toBe(2);

        // Send a message
        res = await request(app)
            .post('/api/sendmessage')
            .send({ 
                JwtToken: TEST_USER_A_JWT,
                Channel: channelId,
                Message: "$TEST MESSAGE$"
            })
            .expect(200);
        expect(res.body.Error).toBe(null);

        // Get the message
        res = await request(app)
            .post('/api/getmessages')
            .send({ 
                JwtToken: TEST_USER_B_JWT,
                Channel: channelId,
                Before: Date.now(),
                Count: 999
            })
            .expect(200);
        expect(res.body.Error).toBe(null);
        expect(res.body.Messages.length).toBe(1);

        // Delete the channel
        res = await request(app)
            .post('/api/deletechannel')
            .send({ 
                JwtToken: TEST_USER_A_JWT,
                Channel: channelId
            })
            .expect(200);
        expect(res.body.Error).toBe(null);

        // Both users should have 0 channels now
        res = await request(app)
            .post('/api/getchannels')
            .send({ JwtToken: TEST_USER_A_JWT })
            .expect(200);
        expect(res.body.Error).toBe(null);
        expect(res.body.Channels.length).toBe(0);

        res = await request(app)
            .post('/api/getchannels')
            .send({ JwtToken: TEST_USER_B_JWT })
            .expect(200);
        expect(res.body.Error).toBe(null);
        expect(res.body.Channels.length).toBe(0);
    });
});
