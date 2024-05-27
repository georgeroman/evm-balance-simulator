export type CallType = "call" | "staticcall" | "delegatecall";

export type Log = {
  address: string;
  topics: string[];
  data: string;
};

export interface CallTrace {
  type: CallType;
  from: string;
  to: string;
  input?: string;
  output: string;
  value?: string;
  error?: string;
  calls?: CallTrace[];
  logs?: Log[];
}

export interface CallTraceOpenEthereum {
  action: {
    from: string;
    callType: CallType;
    input: string;
    to: string;
    value: string;
    gas: string;
  };
  error?: string;
  result: {
    output: string;
    gasUsed: string;
  };
  traceAddress: number[];
}

export type CallHandler = {
  selector?: string;
  handle: (state: StateChange, payments: Payment[], trace: CallTrace) => void;
};

// Each `token` field below has the following format:
// - `native:${TOKEN_ADDRESS}` - used for native tokens (eg. ETH or MATIC)
// - `erc20:${TOKEN_ADDRESS}` - used for ERC20 tokens
// - `erc721:${TOKEN_ADDRESS}:${TOKEN_ID}` - used for ERC721 tokens
// - `erc1155:${TOKEN_ADDRESS}:${TOKEN_ID}` - used for ERC1155 tokens

export type StateChange = {
  // State changes of a particular address
  [address: string]: {
    // Mapping from token address to balance changes (in the context of an address state)
    tokenBalanceState: { [token: string]: string };
  };
};

export type Payment = {
  from: string;
  to: string;
  token: string;
  amount: string;
};
