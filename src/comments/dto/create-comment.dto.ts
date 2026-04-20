import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsMongoId()
  @IsNotEmpty()
  taskId!: string;
}
