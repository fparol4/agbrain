import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppHandler {
  @Get() get() {
    return { name: "Ag Brain API", version: "v1" };
  }
}
