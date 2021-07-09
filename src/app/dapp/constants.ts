export interface Holder{
  address:string, 
  balance: number
}
export interface Vote{
  id: number,
  metadata: string,
  creator: string,
  open: boolean,
  executed: boolean,
  yea: number,
  nay: number,
  votingPower: number,

}
export const tokenManagerAddress = '0x0867da6308091e115879067d5b7ba1f2a5ea41f9';
export const votingAddress = '0xe00dea52f643b18a124b1e6aa25a105c418f360d';
export const minimeTokenAbi = require('./abi/MiniMeToken.json');
export const votingAbi = require('./abi/Voting.json');
export const tokenManagerAbi = require('./abi/TokenManager.json');