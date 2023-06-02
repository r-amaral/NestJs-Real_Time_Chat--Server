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

  private messages = new Set();
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

  @SubscribeMessage("msgToServer")
  handleMessageRoom(_: Socket, payload): void {
    this.server.emit("msgToServer", payload);
  }

  @SubscribeMessage("msgToClient")
  handleMessageChat(_: Socket, payload): void {
    this.messages.add(payload);
    this.server.emit("msgToClient", payload);

    this.logger.log(
      `\n mensagem "${payload.message}" \n Recebida de "${payload.author}" \n no horário "${payload.time}"`
    );
  }

  @SubscribeMessage("deleteMessage")
  handleDeleteMessage(client: Socket, messageId: string) {
    if (messageId) {
      const messageToArray = [...this.messages];

      messageToArray.forEach((message: any) => {
        if (message.id === messageId) {
          this.messages.delete(message);
          this.logger.log(`mensagem deletada \n${JSON.stringify(message)}"`);
        }
      });
      client.emit("messageDeleted", [...this.messages]);
    }
  }

  @SubscribeMessage("joined-room")
  handleJoinedRoom(client: Socket) {
    client.join(client.id);
  }
}
