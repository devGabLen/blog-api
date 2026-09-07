import type { LoginUserDto } from "../../dtos/auth.dto";
import type { User } from "../../../domain/entities/user.entity";
import type { UserRepository } from "../../../domain/repositories/user.repository";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

export interface PasswordComparator {
  compare(password: string, passwordHash: string): Promise<boolean>;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordComparator: PasswordComparator,
  ) {}

  async execute(input: LoginUserDto): Promise<User> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError(
        "Email o contraseña incorrectos",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const passwordMatches = await this.passwordComparator.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AppError(
        "Email o contraseña incorrectos",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    return user;
  }
}
