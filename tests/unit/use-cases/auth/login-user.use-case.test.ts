import { describe, it, expect, vi, beforeEach } from "vitest";

import type { LoginUserDto } from "../../../../src/application/dtos/auth.dto";
import type { User } from "../../../../src/domain/entities/user.entity";
import type { UserRepository } from "../../../../src/domain/repositories/user.repository";
import { LoginUserUseCase } from "../../../../src/application/use-cases/auth/login-user.use-case";
import { AppError } from "../../../../src/shared/errors/app-error";

describe("LoginUserUseCase", () => {
  let userRepository: UserRepository;
  let passwordComparator: {
    compare: (password: string, hash: string) => Promise<boolean>;
  };
  let useCase: LoginUserUseCase;

  beforeEach(() => {
    userRepository = {
      create: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };
    passwordComparator = {
      compare: vi.fn(),
    };
    useCase = new LoginUserUseCase(userRepository, passwordComparator);
  });

  it("should login successfully with valid credentials", async () => {
    const input: LoginUserDto = {
      email: "juan@example.com",
      password: "password123",
    };

    const mockUser: User = {
      id: "uuid-123",
      name: "Juan Pérez",
      email: "juan@example.com",
      passwordHash: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(passwordComparator.compare).mockResolvedValue(true);

    const result = await useCase.execute(input);

    expect(result).toEqual(mockUser);
    expect(userRepository.findByEmail).toHaveBeenCalledWith("juan@example.com");
    expect(passwordComparator.compare).toHaveBeenCalledWith(
      "password123",
      "hashed_password",
    );
  });

  it("should throw UnauthorizedError when user not found", async () => {
    const input: LoginUserDto = {
      email: "juan@example.com",
      password: "password123",
    };

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(AppError);
    await expect(useCase.execute(input)).rejects.toThrow(
      "Email o contraseña incorrectos",
    );
  });

  it("should throw UnauthorizedError when password is incorrect", async () => {
    const input: LoginUserDto = {
      email: "juan@example.com",
      password: "wrongpassword",
    };

    const mockUser: User = {
      id: "uuid-123",
      name: "Juan Pérez",
      email: "juan@example.com",
      passwordHash: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(passwordComparator.compare).mockResolvedValue(false);

    await expect(useCase.execute(input)).rejects.toThrow(AppError);
    await expect(useCase.execute(input)).rejects.toThrow(
      "Email o contraseña incorrectos",
    );
  });

  it("should normalize email to lowercase", async () => {
    const input: LoginUserDto = {
      email: "JUAN@EXAMPLE.COM",
      password: "password123",
    };

    const mockUser: User = {
      id: "uuid-123",
      name: "Juan Pérez",
      email: "juan@example.com",
      passwordHash: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(passwordComparator.compare).mockResolvedValue(true);

    await useCase.execute(input);

    expect(userRepository.findByEmail).toHaveBeenCalledWith("juan@example.com");
  });
});
