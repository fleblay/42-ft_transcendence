import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validate } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ValidUUIDPipe implements PipeTransform<any, Promise<any>> {
  async transform(value: any): Promise<any> {

    console.log("ValidUUIDPipe: value", value);
    const isValidUUID = validate(value, { each: true, groups: ['uuid'] });
    if (!isValidUUID) {
      throw new BadRequestException('Invalid UUID');
    }

    return value;
  }
}