const request = require("supertest");
const { app, client, server } = require("./server");

afterAll(async () => {
    await client.close();
    server.close();
});

describe("API Tests", () => {
    test('tests login on the test user', async () => {
        const data = {
            Login: "test",
            Password: "test"
        };
        const res = await request(app).post('/api/login').send(data).expect(200);
        expect(res.body.Error).toBe(null); 
    });

    test('tests login on the test user with the incorrect password', async () => {
        const data = {
            Login: "test",
            Password: "wrong_password_bozo"
        };
        const res = await request(app).post('/api/login').send(data).expect(200);
        expect(res.body.Error).not.toBe(null); 
    });

    test("tests login to a user that doesn't exist", async() => {
        const data = {
            Login: "$BAD_LOGIN$",
            Password: "$BAD_PASSWORD$"
        };
        const res = await request(app).post('/api/login').send(data).expect(200);
        expect(res.body.Error).not.toBe(null);
    });

    test("tests registering a user that already exist", async() => {
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

    test("tests registering a user with bad credentials", async() => {
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

    test('tests retrieving the profile of the test user', async () => {
        const data = {
            _id: "634b740db076952180cb8e5a",
        };
        const res = await request(app).post('/api/retrieveprofile').send(data).expect(200);
        expect(res.body.Error).toBe(null);
        expect(res.body.FirstName).toBe("Test");
        expect(res.body.LastName).toBe("User");
    });

    test("tests retrieving the profile of a user that doesn't exist", async () => {
        const data = {
            _id: "bad_id",
        };
        const res = await request(app).post('/api/retrieveprofile').send(data).expect(200);
        expect(res.body.Error).not.toBe(null);
    });
});
