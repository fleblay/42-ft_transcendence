import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValideIdPipe implements PipeTransform<any, Promise<any>> {
  async transform(value: any): Promise<any> {
    const id = parseInt(value, 10);
    const isID = !isNaN(id) && !(id < 0 || id > 2147483647);
    if (!isID) {
      throw new BadRequestException('Invalid ID');
    }
    return id;
  }
}