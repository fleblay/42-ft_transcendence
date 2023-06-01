import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class ModifyMemberDto {
    @IsString()
    @IsOptional()
    role? : "owner" | "admin" | "regular";

    @IsBoolean()
    @IsOptional()
    ban?: boolean;

    @IsBoolean()
    @IsOptional()
    kick? : boolean;

    @IsDateString()
    @IsOptional()
    mute?: string;
}



