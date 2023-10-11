import { Message } from "npm:revolt.js@6.0.17";
import { Client } from "npm:revolt.js@6.0.17";

export type ArgType = string | number | boolean;

export type CommandHandler = (
  client: Client,
  msg: Message,
  ...args: ArgType[]
) => void;

export type DefineCommandOption = {
  name: string;
  description?: string;
  fn: CommandHandler;
};

export class Commands {
  private commands = new Map<string, DefineCommandOption>();

  constructor(public client: Client) {
    this.client.on("message", (msg) => this.onMessage(msg));
  }

  onMessage(msg: Message) {
    if (msg.content == null) return;

    if (msg.content == `/${this.client.user!.username}`) {
      msg.reply(
        [...this.commands].map(([name, command]) =>
          `- ${name}\n${command.description ?? "説明書きがありません。"}`
        ).join("\n"),
      );
      return;
    }

    if (!msg.content.startsWith(`/${this.client.user!.username}:`)) return;

    const commandName = msg.content.slice(
      `/${this.client.user!.username}:`.length,
    ).match(/^[^\s]+/)?.[0];
    if (commandName == null) {
      msg.reply("コマンドが不正です。");
      return;
    }

    if (!this.commands.has(commandName)) {
      msg.reply("そんなコマンドはありません。");
      return;
    }

    const command = this.commands.get(commandName)!;
    command.fn(this.client, msg);
  }

  def(option: DefineCommandOption) {
    this.commands.set(option.name, option);

    return this;
  }
}
