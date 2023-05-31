import { Injectable, Logger } from "@nestjs/common";
import { prismaService } from "./prisma";

export interface MessageProps {
  id?: string;
  author: string;
  message: string;
  registration_date?: Date;
  room: string;
}

export interface MessagePropsNew {
  id: string | null;
  room: string;
  author: string;
  message: string;
  time?: Date;
}

@Injectable()
export class AppService {
  private logger: Logger;
  constructor() {
    this.logger = new Logger(AppService.name);
  }

  async findAllMessages() {
    return prismaService.message.findMany({
      orderBy: {
        registration_date: "asc",
      },
    });
  }

  async deleteMessage(id: number) {
    return prismaService.message.delete(id);
  }

  async createMessage(message: MessagePropsNew) {
    const props: MessageProps = {
      id: message.id,
      author: message.author,
      message: message.message,
      room: message.room,
    };
    const response = await prismaService.message.create({
      data: props,
    });

    return response;
  }
}
