import { UserModel } from "../models/user.model";
import { hashPassword } from "../utils/password";
import { UserRole } from "../constants/roles";

export const seedInitialData = async () => {
  try {
    const commonPassword = await hashPassword("123456Ab");

    const mockUsers = [
      {
        email: "admin.test1@gmail.com",
        passwordHash: commonPassword,
        firstName: "Senior",
        lastName: "Admin",
        nickName: "ดิว Admin 1",
        role: UserRole.ADMIN,
        isVerified: true,
      },
      {
        email: "admin.test2@gmail.com",
        passwordHash: commonPassword,
        firstName: "System",
        lastName: "Manager",
        nickName: "ดิว Admin 2",
        role: UserRole.ADMIN,
        isVerified: true,
      },
      {
        email: "user.test1@gmail.com",
        passwordHash: commonPassword,
        firstName: "John",
        lastName: "Doe",
        nickName: "Tester 1",
        role: UserRole.USER,
        isVerified: true,
      },
      {
        email: "user.test2@gmail.com",
        passwordHash: commonPassword,
        firstName: "Jane",
        lastName: "Smith",
        nickName: "Tester 2",
        role: UserRole.USER,
        isVerified: true,
      },
    ];

    console.log("Checking initial data...");

    for (const user of mockUsers) {
      const exists = await UserModel.findOne({ email: user.email });

      if (!exists) {
        await UserModel.create(user);
        console.log(`Seeded user: ${user.email}`);
      }
    }

    console.log("Seed process finished.");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};
