import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller("api/sys")
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get("os")
  async os(): Promise<any> {
    try{ return this.systemService.getOSInfo() } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("cpu")
  async cpu(): Promise<any> {
    try{ return this.systemService.getCPU() } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("memory")
  async memory(): Promise<any> {
    try{ return this.systemService.getMemory() } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("battery")
  async battery(): Promise<any> {
    try{ return this.systemService.getBattery() } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("storage")
  async storage(): Promise<any> {
    try{ return this.systemService.getStorage() } catch (error) { return Promise.reject({error: error.message}) }
  }
}
