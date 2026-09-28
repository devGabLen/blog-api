import { describe, it, expect, vi, beforeEach } from "vitest";

import type { RegisterUserDto } from "../../../../src/application/dtos/auth.dto";
import type { User } from "../../../../src/domain/entities/user.entity";
import type { UserRepository } from "../../../../src/domain/repositories/user.repository";
import { RegisterUserUseCase } from "../../../../src/application/use-cases/auth/register-user.use-case";
import { AppError } from "../../../../src/shared/errors/app-error";

describe("RegisterUserUseCase", () => {
  let userRepository: UserRepository;
  let passwordHasher: { hash: (password: string) => Promise<string> };
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    userRepository = {
      create: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };
    passwordHasher = {
      hash: vi.fn().mockResolvedValue("hashed_password"),
    };
    useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  });

  it("should register a user successfully", async () => {
    const input: RegisterUserDto = {
      name: "Juan Pérez",
      email: "juan@example.com",
      password: "password123",
    };

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    const mockUser: User = {
      id: "uuid-123",
      name: "Juan Pérez",
      email: "juan@example.com",
      passwordHash: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(userRepository.create).mockResolvedValue(mockUser);

    const result = await useCase.execute(input);

    expect(result).toEqual(mockUser);
    expect(userRepository.findByEmail).toHaveBeenCalledWith("juan@example.com");
    expect(passwordHasher.hash).toHaveBeenCalledWith("password123");
    expect(userRepository.create).toHaveBeenCalled();
  });

  it("should throw ConflictError when email already exists", async () => {
    const input: RegisterUserDto = {
      name: "Juan Pérez",
      email: "juan@example.com",
      password: "password123",
    };

    const existingUser: User = {
      id: "uuid-123",
      name: "Juan Pérez",
      email: "juan@example.com",
      passwordHash: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(userRepository.findByEmail).mockResolvedValue(existingUser);

    await expect(useCase.execute(input)).rejects.toThrow(AppError);
    await expect(useCase.execute(input)).rejects.toThrow(
      "Ya existe una cuenta registrada con este email",
    );
  });

  it("should normalize email to lowercase", async () => {
    const input: RegisterUserDto = {
      name: "Juan Pérez",
      email: "JUAN@EXAMPLE.COM",
      password: "password123",
    };

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    const mockUser: User = {
      id: "uuid-123",
      name: "Juan Pérez",
      email: "juan@example.com",
      passwordHash: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(userRepository.create).mockResolvedValue(mockUser);

    await useCase.execute(input);

    expect(userRepository.findByEmail).toHaveBeenCalledWith("juan@example.com");
  });

  it("should trim name and email", async () => {
    const input: RegisterUserDto = {
      name: "  Juan Pérez  ",
      email: "  juan@example.com  ",
      password: "password123",
    };

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    const mockUser: User = {
      id: "uuid-123",
      name: "Juan Pérez",
      email: "juan@example.com",
      passwordHash: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(userRepository.create).mockResolvedValue(mockUser);

    await useCase.execute(input);

    expect(userRepository.findByEmail).toHaveBeenCalledWith("juan@example.com");
  });
});
