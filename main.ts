import { Client } from "npm:revolt.js@6.0.17";
import { load } from "dotenv/mod.ts";
import { Commands } from "./src/Commands.ts";
import { runScript } from "./src/imageScript.ts";
import { Lexer, Parser, Tokens } from "marked/mod.ts";
import { encodeBase64 } from "encoding/base64.ts";

await load({
  export: true,
});

const client = new Client();
const commands = new Commands(client);

client.on("ready", () => {
  console.info(`${client.user?.username} としてログインしました。`);
});

commands.def({
  name: "hello",
  description: "挨拶します",
  fn(_, msg) {
    msg.reply("ｺﾆｬﾆｬﾁﾜｰｯ");
  },
});

commands.def({
  name: "サイコロ",
  description: "1-10までの数字をランダムで出します。",
  fn(_, msg) {
    msg.reply(`結果: ${1 + Math.floor(Math.random() * 10)}`);
  },
});

commands.def({
  name: "script",
  description: "aiscriptを実行",
  async fn(_, msg) {
    const code = Lexer.lex(msg.content!).find((x): x is Tokens.Code =>
      x.type == "code"
    );
    const script = code?.text!;
    const out = await runScript(script);

    const png = out.canvas?.toBuffer("image/png");

    if (png) {
      const formdata = new FormData();

      formdata.append(
        "file",
        new Blob([png], { type: "image/png" }),
        "res.png",
      );

      const res = await fetch(`https://autumn.revolt.chat/attachments`, {
        method: "POST",
        body: formdata,
      });

      const id = await res.json().then((x) => x.id);

      await msg.reply({
        content: out.res,
        attachments: [id],
      });
    } else {
      msg.reply(out.res);
    }
  },
});

await client.loginBot(Deno.env.get("TOKEN")!);
