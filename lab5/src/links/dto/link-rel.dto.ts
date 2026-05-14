import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class LinkRelDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id!: string;
}
