import { Body, Controller, Get, Post, Delete } from "@nestjs/common";

@Controller()
export class AppController {
  constructor(private readonly appService) {}

  @Get("messages")
  findAllMessages() {
    return this.appService.findAllMessages();
  }

  @Post("message")
  createMessage(@Body() body) {
    return this.appService.createMessage(body);
  }

  @Delete("message")
  deleteMessage(@Body() body) {
    return this.appService.deleteMessage(body);
  }
}
