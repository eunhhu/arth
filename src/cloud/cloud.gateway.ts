import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
    namespace: 'cloud',
    cors: {origin: '*'}
})
export class CloudGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    handleConnection(client: Socket, ...args: any[]) {
        console.log('Client connected:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
    }

    @SubscribeMessage('message')
    handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: string
    ): void {
        console.log('Client sent:', payload);
        client.emit('message', payload);
        client.broadcast.emit('message', payload);
    }
}