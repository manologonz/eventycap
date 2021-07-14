import { UserRole } from "../api/models/user";

export const user = {
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    birthDate: "1998-04-23",
    email: "test@gmail.com",
    role: UserRole.CREATOR,
    password: "securepassword",
    confirmPassword: "securepassword",
};

export const creds = {
    username: user.username,
    email: user.email,
    password: user.password
}