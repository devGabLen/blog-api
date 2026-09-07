import { randomUUID } from "node:crypto";

import type { RegisterUserDto } from "../../dtos/auth.dto";
import type { User } from "../../../domain/entities/user.entity";
import type { UserRepository } from "../../../domain/repositories/user.repository";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserDto): Promise<User> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(
        "Ya existe una cuenta registrada con este email",
        HTTP_STATUS.CONFLICT,
      );
    }

    const now = new Date();
    const passwordHash = await this.passwordHasher.hash(input.password);

    const user: User = {
      id: randomUUID(),
      name: input.name.trim(),
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    return this.userRepository.create(user);
  }
}
