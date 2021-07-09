import { Holder, tokenManagerAddress, votingAddress, votingAbi, tokenManagerAbi, minimeTokenAbi, Vote } from './constants';
import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import Web3 from "web3";
@Injectable({
  providedIn: 'root'
})

export class DappService {
  web3:Web3;
  accountAddress: string = '';
  constructor() {
    this.web3 = new Web3();
  }
  private isConnectedSource = new BehaviorSubject(false);
  public isConnected = this.isConnectedSource.asObservable();

  public async connect(): Promise<string>{
    if ((window as any).ethereum && ((window as any).ethereum.isMetaMask == true)) {
      this.web3 = new Web3((window as any).ethereum);
      let accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      /*let networkType = await this.web3.eth.net.getNetworkType();
      if(networkType != 'main'){
        throw new Error('Please, switch to main network');
      }*/
      this.web3.eth.defaultAccount = accounts[0];
      this.accountAddress = accounts[0];
      this.isConnectedSource.next(true);
      return this.accountAddress;
    }else{
      throw new Error('Connection error. Please, install metamask!');
    }
  }
  public async mintTokenVote(receiverAddress: string, mintAmount: number){
    console.log(receiverAddress);
    console.log(mintAmount);
    let voteContract =  new this.web3.eth.Contract(votingAbi, votingAddress);
    let tokensContract = new this.web3.eth.Contract(tokenManagerAbi, tokenManagerAddress);
    let mintPayload = tokensContract.methods.mint(receiverAddress, mintAmount).encodeABI();
    let mintAction = {to: tokenManagerAddress, calldata: mintPayload};
    let mintEncodedCallScript = this.encodeCallScript([mintAction]);


    let payload = voteContract.methods.newVote(mintEncodedCallScript,'Tokens (QWE): Mint ' + mintAmount + ' for ' + receiverAddress).encodeABI();
    let action = {to: votingAddress, calldata: payload};
    let gasPrice = await this.web3.eth.getGasPrice();
    let result = await tokensContract.methods.forward(this.encodeCallScript([action])).send({from:this.accountAddress, gasPrice: gasPrice, gas:10000000});
    console.log(result);
  }
  public async burnTokenVote(burnAddress: string, burnAmount: number){
    let voteContract =  new this.web3.eth.Contract(votingAbi, votingAddress);
    let tokensContract = new this.web3.eth.Contract(tokenManagerAbi, tokenManagerAddress);
    let burnPayload = tokensContract.methods.burn(burnAddress, burnAmount).encodeABI();
    let burnAction = {to: tokenManagerAddress, calldata: burnPayload};
    let burnEncodedCallScript = this.encodeCallScript([burnAction]);


    let payload = voteContract.methods.newVote(burnEncodedCallScript,'Tokens (QWE): Burn ' + burnAmount + ' for ' + burnAddress).encodeABI();
    let action = {to: votingAddress, calldata: payload};
    let gasPrice = await this.web3.eth.getGasPrice();
    let result = await tokensContract.methods.forward(this.encodeCallScript([action])).send({from:this.accountAddress, gasPrice: gasPrice, gas:10000000});
    console.log(result);
  }
  public async vote(vote:Vote, value: boolean): Promise<void>{
    let voteContract =  new this.web3.eth.Contract(votingAbi, votingAddress);
    let gasPrice = await this.web3.eth.getGasPrice();
    await voteContract.methods.vote(vote.id, value, true).send({from:this.accountAddress, gasPrice: gasPrice, gas:10000000});
  }
  public async newVote(question:string){
    if(question!= ''){
      let voteContract =  new this.web3.eth.Contract(votingAbi, votingAddress);
      let tokensContract = new this.web3.eth.Contract(tokenManagerAbi, tokenManagerAddress);
      let payload = voteContract.methods.newVote('0x00000001', question).encodeABI();
      let action = {to: votingAddress, calldata: payload};
      let gasPrice = await this.web3.eth.getGasPrice();
      return await tokensContract.methods.forward(this.encodeCallScript([action])).send({from:this.accountAddress, gasPrice: gasPrice, gas:10000000});
    }else{
      throw new Error('Question string can\'t be empty!');
    }
  }
  
  public async getBalances():Promise<Holder[]>{
    let tokensContract = new this.web3.eth.Contract(tokenManagerAbi, tokenManagerAddress);
    let minimeToken = await tokensContract.methods.token().call();
    let minimeContract = new this.web3.eth.Contract(minimeTokenAbi, minimeToken);
    let pastEv = await minimeContract.getPastEvents('Transfer', {fromBlock: 0, toBlock: 'latest'});
    let holders: Holder[] = [];
    let nullAddress = '0x0000000000000000000000000000000000000000';
    pastEv.forEach((item, i , arr) => {
      if(item.returnValues[0] == nullAddress && item.returnValues[1] != nullAddress){
        let holderIndex = holders.findIndex(currentValue => currentValue.address == item.returnValues[1]);
        if(holderIndex == -1){
          holders.push({address: item.returnValues[1], balance: parseInt(item.returnValues[2])});
        }else{
          holders[holderIndex].balance += parseInt(item.returnValues[2]);
        }
      }
      if(item.returnValues[0] != nullAddress && item.returnValues[1] == nullAddress){
        let holderIndex = holders.findIndex(currentValue => currentValue.address == item.returnValues[0]);
        if(holderIndex != -1){
          holders[holderIndex].balance -= parseInt(item.returnValues[2]);
        }
      }
      if(item.returnValues[0] != nullAddress && item.returnValues[1] != nullAddress){
        let holderIndexFrom = holders.findIndex(currentValue => currentValue.address == item.returnValues[0]);
        let holderIndexTo = holders.findIndex(currentValue => currentValue.address == item.returnValues[1]);
        if(holderIndexFrom != -1){
          if(holderIndexTo == -1){
            holders.push({address: item.returnValues[1], balance: 0});
          }
          holders[holderIndexFrom].balance -= parseInt(item.returnValues[2]);
          holders[holderIndexTo].balance += parseInt(item.returnValues[2]);
        }
      }
    })
    return holders;
  }
  public async getAllVotes(){
    let voteContract =  new this.web3.eth.Contract(votingAbi, votingAddress);
    let votesLength = await voteContract.methods.votesLength().call();
    let pastEvents = await voteContract.getPastEvents('StartVote', {fromBlock: 0, toBlock: 'latest'});
    console.log(pastEvents);
    let votesDescription : Promise<any>[] = [];
    for(let i = 0; i < votesLength; i++){
      votesDescription.push(voteContract.methods.getVote(i).call());
    }
    let votesDescriptionResult = await Promise.all(votesDescription);
    return pastEvents.map((cv, i) =>{
      let vote:Vote = {
        id: i,
        metadata: cv.returnValues[2],
        creator: cv.returnValues[1],
        open: votesDescriptionResult[i][0],
        executed: votesDescriptionResult[i][1],
        yea: votesDescriptionResult[i][6],
        nay: votesDescriptionResult[i][7],
        votingPower: votesDescriptionResult[i][8]
      }
      return vote;
    })
    
  }

  public encodeCallScript(actions:any, specId = 1) {
    return actions.reduce((script:string, obj:any) => {
      const addr = this.web3.eth.abi.encodeParameter('address', obj.to)
  
      const calldataBytes = this.stripBytePrefix(obj.calldata.slice(2))
      const length = this.web3.eth.abi.encodeParameter('uint256', calldataBytes.length / 2)
  
      // Remove first 12 bytes of padding for addr and 28 bytes for uint32
      return (
        script +
        this.stripBytePrefix(addr).slice(24) +
        this.stripBytePrefix(length).slice(56) +
        calldataBytes
      )
    }, this.createExecutorId(specId))
  }
  public createExecutorId(id:any) {
    return `0x${String(id).padStart(8, '0')}`
  }
  public stripBytePrefix(bytes:string) {
    return bytes.substring(0, 2) === '0x' ? bytes.slice(2) : bytes
  }
}