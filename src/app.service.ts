import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    constructor(@Inject('PIN') private pin: string) {}

    checkPin(pin: string) {
        return pin === this.pin ? 'success' : 'fail';
    }
}
