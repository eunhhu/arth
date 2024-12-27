import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SystemService } from "./system.service";
import { Logger } from "@nestjs/common";

@WebSocketGateway({
    namespace: 'sys',
    cors: {origin: '*'}
})
export class SystemGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private interval: NodeJS.Timer;
    private logger = new Logger('SystemGateway');

    constructor(private readonly systemService: SystemService) {
        this.logger.log('SystemGateway initialized');
        if(this.systemService.isValid()) this.interval = setInterval(async () => {
            const cpu = await this.systemService.getCPU();
            const memory = await this.systemService.getMemory();
            const battery = await this.systemService.getBattery();
            const storage = await this.systemService.getStorage();
            this.server.emit("update-info", {
                os: this.systemService.getOSInfo(),
                cpu, memory, battery, storage
            });
        }, 500);
    }

    handleConnection(client: Socket, ...args: any[]) {}

    handleDisconnect(client: Socket) {}

    @SubscribeMessage('message')
    handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() ...args: any[]
    ): void {
        client.emit('message', ...args);
        client.broadcast.emit('message', ...args);
    }
}