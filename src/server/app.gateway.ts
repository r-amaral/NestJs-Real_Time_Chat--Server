import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";

@WebSocketGateway({
  cors: "*",
})
export class AppGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(AppGateway.name);

  afterInit() {
    this.logger.log(`Server On`);
  }

  async handleDisconnect() {
    this.logger.log("Server Off");
  }

  @SubscribeMessage("message-room")
  async handleMessageChatRoom(client: Socket): Promise<void> {
    client.broadcast.emit("message-room", {
      message: "all messages",
    });
  }

  @SubscribeMessage("msgToClient")
  handleMessageChat(_: Socket, payload: any): void {
    this.server.emit("msgToClient", payload);
    this.logger.log(
      `\n mensagem "${payload.message}" \n Recebida de "${payload.author}" \n na data "${payload.time}"`
    );
  }

  @SubscribeMessage("joined-room")
  handleJoinedRoom(client: Socket, payload) {
    this.logger.log(`${payload.author} entrou no chat`);
    client.join(client.id);
  }
}
