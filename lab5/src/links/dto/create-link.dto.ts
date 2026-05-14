import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId!: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Optional review id' })
  @IsOptional()
  @IsUUID()
  reviewId?: string;

  @ApiProperty({ example: 'Lab 1 landing page' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  linkName!: string;

  @ApiProperty({ example: 'https://username.github.io/project/' })
  @IsUrl({ require_protocol: true })
  @MaxLength(255)
  githubPagesUrl!: string;
}
