import { 
    ConnectedSocket, 
    MessageBody, 
    OnGatewayConnection, 
    OnGatewayDisconnect, 
    SubscribeMessage, 
    WebSocketGateway, 
    WebSocketServer 
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CloudService } from "./cloud.service";

@WebSocketGateway({
    namespace: 'cloud',
    cors: { origin: '*' }
})
export class CloudGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly cloudService: CloudService) {}

    private controls = new Map<string, string[]>();

    @WebSocketServer() server: Server;

    handleConnection(client: Socket): void {
        this.controls.set(client.id, []);
    }

    handleDisconnect(client: Socket): void {
        this.controls.delete(client.id);
    }

    @SubscribeMessage('route')
    async route(
        @ConnectedSocket() client: Socket,
        @MessageBody() path: string[],
    ): Promise<void> {
        this.controls.set(client.id, path);
        try {
            const result = await this.cloudService.list('/' + path.join('/'));
            client.emit('list', result);
        } catch (error) {
            client.emit('list', { error: error.message });
        }
    }

    @SubscribeMessage('stat')
    async stat(
        @ConnectedSocket() client: Socket,
        @MessageBody() path: string,
    ): Promise<void> {
        try {
            const result = await this.cloudService.stat(path);
            client.emit('stat', result);
        } catch (error) {
            client.emit('stat', { error: error.message });
        }
    }

    folderRemoved(path: string[]): void {
        this.controls.forEach((value, key) => {
            const valuePath = value.join('/');
            const removedPath = path.join('/');
            if (valuePath.startsWith(removedPath) || valuePath === path.slice(0, -1).join('/')) {
                this.server.to(key).emit('folderRemoved', path.slice(0, -1));
            }
        });
    }

    folderRenamed(path: string[], name: string): void {
        this.controls.forEach((value, key) => {
            const valuePath = value.join('/');
            const targetPath = path.join('/');
            if (valuePath.startsWith(targetPath) || valuePath === path.slice(0, -1).join('/')) {
                this.server.to(key).emit('folderRenamed', path, name);
            }
        });
    }

    async fileCreated(path: string[]): Promise<void> {
        const file = await this.cloudService.stat(path.join('/'));
        this.controls.forEach((value, key) => {
            const valuePath = value.join('/');
            const parentPath = path.slice(0, -1).join('/');
            if (valuePath === parentPath) {
                this.server.to(key).emit('fileCreated', file);
            }
        });
    }

    async routeUpdated(path: string[]): Promise<void> {
        const result = await this.cloudService.list('/' + path.join('/'));
        this.controls.forEach((value, key) => {
            const valuePath = value.join('/');
            const targetPath = path.join('/');
            if (valuePath === targetPath) {
                this.server.to(key).emit('list', result);
            }
        });
    }
}