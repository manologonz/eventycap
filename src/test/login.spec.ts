
import request from "supertest";
import User from "../api/models/user";
import app from "../api/app";
import db from "../db";
import { user, creds } from "./utils";

describe("POST /api/auth/login", function () {
    beforeAll(async function () {
        await db.connect();
        const res = await request(app).post("/api/auth/register").send(user);
    });

    afterAll(async function () {
        await User.deleteMany({});
        await db.close();
    });

    describe("given user credentials", function () {
        it("it should respond with status code 200", async function () {
            console.log("it works :)");
        });
    });
});
