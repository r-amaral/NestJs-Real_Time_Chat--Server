import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayInit,
  OnGatewayConnection,
} from "@nestjs/websockets";

@WebSocketGateway({
  cors: "*",
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger(AppGateway.name);

  private connectedUsers: Set<string> = new Set<string>();
  private notifiedUsers: Set<string> = new Set<string>();

  afterInit() {
    this.logger.log(`Server On`);
  }

  async handleConnection(socket: Socket) {
    const { name, userId } = socket.handshake.query;
    this.connectedUsers.add(userId as string);

    if (!this.notifiedUsers.has(userId as string)) {
      socket.emit("userEntered", userId);

      this.logger.log(`Usuário ${name} entrou na sala`);
      this.notifiedUsers.add(userId as string);
    }
  }

  async handleDisconnect(socket: Socket) {
    const { name, userId } = socket.handshake.query;

    this.connectedUsers.delete(userId as string);
    this.logger.log(`Usuário ${name} saiu da sala`);
    this.server.emit("userLeft", userId);
  }

  @SubscribeMessage("message-room")
  async handleMessageChatRoom(client: Socket): Promise<void> {
    client.broadcast.emit("message-room", {
      message: "all messages",
    });
  }

  @SubscribeMessage("msgToClient")
  handleMessageChat(_: Socket, payload): void {
    this.server.emit("msgToClient", payload);
    this.logger.log(
      `\n mensagem "${payload.message}" \n Recebida de "${payload.author}" \n no horário "${payload.time}"`
    );
  }

  @SubscribeMessage("joined-room")
  handleJoinedRoom(client: Socket) {
    client.join(client.id);
  }
}
