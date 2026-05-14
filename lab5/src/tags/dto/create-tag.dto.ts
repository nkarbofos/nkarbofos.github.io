import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'nestjs' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
}
