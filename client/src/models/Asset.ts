export interface Asset {
  id: string;
  name: string;
  issuing_chain_rid: Buffer;
}

export interface AssetBalance {
  id: string;
  name: string;
  amount: number;
  chain_id: Buffer;
}