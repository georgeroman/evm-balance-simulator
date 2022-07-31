import { BigNumberish } from "@ethersproject/bignumber";
import { hexValue } from "@ethersproject/bytes";
import { JsonRpcProvider } from "@ethersproject/providers";

import { getHandlers } from "./handlers";
import { bn } from "./utils";

import type { CallTrace, GlobalState } from "./types";

const parseCallTrace = (state: GlobalState, trace: CallTrace) => {
  // TODO: Handle "DELEGATECALL"?
  if (trace.type === "CALL" && !trace.error) {
    const handlers = getHandlers(trace);
    for (const { handle } of handlers) {
      handle(state, trace);
    }

    for (const call of trace.calls ?? []) {
      parseCallTrace(state, call);
    }
  }
};

type TxData = {
  from: string;
  to: string;
  data: string;
  value: BigNumberish;
};

export const simulateTx = async (
  tx: TxData,
  provider: JsonRpcProvider
): Promise<GlobalState> => {
  const trace: CallTrace = await provider.send("debug_traceCall", [
    {
      ...tx,
      value: hexValue(bn(tx.value).toHexString()),
    },
    "latest",
    {
      tracer: "callTracer",
    },
  ]);

  if (trace.error) {
    throw new Error("execution-reverted");
  }

  const state = {};
  parseCallTrace(state, trace);

  return state;
};

// For testing only
// const main = async () => {
//   const provider = new JsonRpcProvider(process.env.RPC_URL);
//   const result = await simulateTx(
//     {
//       from: "0x0cccd55a5ac261ea29136831eeaa93bfe07f5db6",
//       to: "0x9ebfb53fa8526906738856848a27cb11b0285c3f",
//       data: "0x06c575ce0000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000500000000000000000000000057f1887a8bf19b14fc0df6fd9b2acc9af147ea85174826d31f0b4f6225fdc60f0874a8a14852ff0c056b9da3b64e813f164a83fe0000000000000000000000000cccd55a5ac261ea29136831eeaa93bfe07f5db6000000000000000000000000845bd54015813fda33f11e1f261ebc360983e5840000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005a4e7acab240000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000058000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cccd55a5ac261ea29136831eeaa93bfe07f5db600000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000000000000000000000000000004e0000000000000000000000000845bd54015813fda33f11e1f261ebc360983e584000000000000000000000000004c00500000ad104d7dbd00e3ae0a5c00560c000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000062e50c020000000000000000000000000000000000000000000000000000000062e56a9a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a83e9b8e2471dc0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000057f1887a8bf19b14fc0df6fd9b2acc9af147ea85174826d31f0b4f6225fdc60f0874a8a14852ff0c056b9da3b64e813f164a83fe00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000036de3c75e940000000000000000000000000000000000000000000000000000036de3c75e9400000000000000000000000000845bd54015813fda33f11e1f261ebc360983e584000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016828ef54c00000000000000000000000000000000000000000000000000000016828ef54c000000000000000000000000008de9c5a032463c561423387a9648c5c7bcc5bc900000000000000000000000000000000000000000000000000000000000000041457a591c44504b8c3be189e0db0fe51591f27df225a24202a593a95dc03ed6e16c091414de5a428218331ef8e957de4b8ce56ed91aea8dd0298b0625b6277afc1b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
//       value: "0x384665653e000",
//     },
//     provider
//   );
//   console.log(result);
// };
// main();
