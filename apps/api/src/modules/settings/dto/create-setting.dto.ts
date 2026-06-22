import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty({ message: 'A chave é obrigatória' })
  key: string;

  @IsNotEmpty({ message: 'O valor é obrigatório' })
  value: any;
}
