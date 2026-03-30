import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAgentDto {
  @IsEmail()
  email: string;


  @IsString()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;
}