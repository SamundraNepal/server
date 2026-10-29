import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class SingUpDTO {
  @IsNotEmpty()
  firstName!: string;

  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  emailAddress!: string;

  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/(?=.*[@$!%*?&])/, {
    message: 'Password must contain at least one special character e.g @ , $',
  })
  password!: string;

  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/(?=.*[@$!%*?&])/, {
    message: 'Password must contain at least one special character e.g @ , $',
  })
  confirmPassword!: string;

  image!: File | null;
}
