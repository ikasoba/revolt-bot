import { Interpreter, Parser, utils, values } from "@syuilo/aiscript/index.js";
import { Variable } from "@syuilo/aiscript/interpreter/variable.js";
import { createCanvas } from "canvas/mod.ts";

export async function runScript(script: string) {
  let res = "", useImage = false;

  const runtime = new Interpreter({}, {
    out: (value) => {
      res += utils.valToJs(value).toString() + "\n";
    },
  });

  const canvas = createCanvas(128, 128);

  const context = canvas.getContext("2d");

  context.stroke;

  const canvasApi = values.OBJ(
    new Map(Object.entries({
      width: values.NUM(canvas.width),
      height: values.NUM(canvas.height),
      useImage: values.FN_NATIVE(() => {
        useImage = true;
      }),
      setFillStyle: values.FN_NATIVE(([v]) => {
        utils.assertString(v);

        context.fillStyle = utils.valToJs(v).toString();
      }),
      setStrokeStyle: values.FN_NATIVE(([v]) => {
        utils.assertString(v);

        context.strokeStyle = utils.valToJs(v).toString();
      }),
      fillRect: values.FN_NATIVE(([x, y, w, h]) => {
        utils.assertNumber(x);
        utils.assertNumber(y);
        utils.assertNumber(w);
        utils.assertNumber(h);

        context.fillRect(x.value, y.value, w.value, h.value);
      }),
      stroke: values.FN_NATIVE(() => {
        context.stroke();
      }),
      beginPath: values.FN_NATIVE(() => {
        context.beginPath();
      }),
      closePath: values.FN_NATIVE(() => {
        context.closePath();
      }),
      moveTo: values.FN_NATIVE(([x, y]) => {
        utils.assertNumber(x);
        utils.assertNumber(y);

        context.moveTo(x.value, y.value);
      }),
      lineTo: values.FN_NATIVE(([x, y]) => {
        utils.assertNumber(x);
        utils.assertNumber(y);

        context.lineTo(x.value, y.value);
      }),
      fill: values.FN_NATIVE(() => {
        context.fill();
      }),
    })),
  );

  runtime.scope.add("canvas", Variable.const(canvasApi));

  await runtime.exec(Parser.parse(script));

  return { res, canvas: useImage ? canvas : null };
}
