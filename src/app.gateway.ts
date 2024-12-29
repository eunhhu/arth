import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
    namespace: 'app',
    cors: {origin: '*'}
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    handleConnection(client: Socket, ...args: any[]) {}
    
    handleDisconnect(client: Socket) {}

    @SubscribeMessage('route')
    route(
        @ConnectedSocket() client: Socket,
        @MessageBody() collection: string,
    ): void {
        client.join(collection);
    }
}