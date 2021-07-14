import request from "supertest";
import User from "../api/models/user";
import RefreshToken from "../api/models/refreshtoken";
import app from "../api/app";
import db from "../db";
import { user, creds } from "./utils";

describe("POST /api/auth/login", function () {
    beforeAll(async function () {
        await db.connect();
        const res = await request(app).post("/api/auth/register").send(user);
        console.log(res.body)
    });

    afterAll(async function () {
        await User.deleteMany({});
        await RefreshToken.deleteMany({});
        await db.close();
    });

    describe("given user credentials", function () {
        it("it should respond with status code 200", async function () {
            const response = await request(app)
                .post("/api/auth/login")
                .send(creds);
            console.log(creds)
            console.log(response.body);
            expect(response.statusCode).toBe(200);
        });
    });
});
