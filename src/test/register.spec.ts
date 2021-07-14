import User from "../api/models/user";
import request from "supertest";
import app from "../api/app";
import db from "../db";

describe("POST /api/auth/register", function () {
    beforeAll(async function () {
        await db.connect();
    });

    afterEach(async function () {
        await User.deleteMany({});
    });

    afterAll(async function () {
        db.close();
    });

    describe("given a username, first name, last name, email, role, birthDate, password and confirm password", function () {
        it("should respond with a 200 status code", async function () {
            const response = await request(app).post("/api/auth/register").send({
                username: "testuser",
                firstName: "Test",
                lastName: "User",
                birthDate: "1998-04-23",
                email: "test@gmail.com",
                role: 0,
                password: "securepassword",
                confirmPassword: "securepassword"
            });
            expect(response.statusCode).toBe(200);
        });

        it("should respond with a content-type json header", async function () {
            const response = await request(app).post("/api/auth/register").send({
                username: "testuser",
                firstName: "Test",
                lastName: "User",
                birthDate: "1998-04-23",
                email: "test@gmail.com",
                role: 0,
                password: "securepassword",
                confirmPassword: "securepassword"
            });
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
        });

        it("should respond with object containing _id", async function () {
            const response = await request(app).post("/api/auth/register").send({
                username: "testuser",
                firstName: "Test",
                lastName: "User",
                birthDate: "1998-04-23",
                email: "test@gmail.com",
                role: 0,
                password: "securepassword",
                confirmPassword: "securepassword"
            });
            expect(response.body._id).toBeDefined();
        });
    });

    describe("given incomplete data within the request body", () => {
        it("should respond with 400 status code if one of the values is missing", async function() {
            const dataSets = [
                {
                    firstName: "Test",
                    lastName: "User",
                    birthDate: "1998-04-23",
                    email: "test@gmail.com",
                    role: 0,
                    password: "securepassword",
                    confirmPassword: "securepassword",
                },
                {
                    username: "testuser",
                    lastName: "User",
                    birthDate: "1998-04-23",
                    email: "test@gmail.com",
                    role: 0,
                    password: "securepassword",
                    confirmPassword: "securepassword",
                },
                {
                    username: "testuser",
                    firstName: "Test",
                    birthDate: "1998-04-23",
                    email: "test@gmail.com",
                    role: 0,
                    password: "securepassword",
                    confirmPassword: "securepassword",
                },
                {
                    username: "testuser",
                    firstName: "Test",
                    lastName: "User",
                    email: "test@gmail.com",
                    role: 0,
                    password: "securepassword",
                    confirmPassword: "securepassword",
                },
                {
                    username: "testuser",
                    firstName: "Test",
                    lastName: "User",
                    birthDate: "1998-04-23",
                    role: 0,
                    password: "securepassword",
                    confirmPassword: "securepassword",
                },
                {
                    username: "testuser",
                    firstName: "Test",
                    lastName: "User",
                    birthDate: "1998-04-23",
                    email: "test@gmail.com",
                    password: "securepassword",
                    confirmPassword: "securepassword",
                },
                {
                    username: "testuser",
                    firstName: "Test",
                    lastName: "User",
                    birthDate: "1998-04-23",
                    email: "test@gmail.com",
                    role: 0,
                    confirmPassword: "securepassword",
                },
                {
                    username: "testuser",
                    firstName: "Test",
                    lastName: "User",
                    birthDate: "1998-04-23",
                    email: "test@gmail.com",
                    role: 0,
                    password: "securepassword",
                },
            ];
            for (let obj in dataSets) {
                const response = await request(app).post("/api/auth/register").send(obj);
                expect(response.statusCode).toBe(400);
            }
        });
    });
});
