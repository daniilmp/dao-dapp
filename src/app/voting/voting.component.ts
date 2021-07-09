import { Holder, Vote } from './../dapp/constants';
import { DappService } from './../dapp/dapp.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.css']
})
export class VotingComponent implements OnInit {
  holders: Holder[] = [];
  votes: Vote[] = [];
  question: string = '';
  isConnected = false;
  constructor(private dappService:DappService) { }
  error:string = '';
  ngOnInit(): void {
    this.dappService.isConnected.subscribe(async (value) => 
    {
      this.isConnected = value;
      if(this.isConnected) {
        this.votes = await this.dappService.getAllVotes();
      }
    }
      );
  }
  public async getBalances(){
    this.holders = await this.dappService.getBalances();
  }
  public async voteYes(vote:Vote){
    await this.dappService.vote(vote, true);
  }
  public async voteNo(vote:Vote){
    await this.dappService.vote(vote, false);
  }
  public async newVote(){
    if(this.isConnected){
      if(this.question!=''){
        await this.dappService.newVote(this.question);
      }else{
        alert('Question can\'t be empty!');
      }
    }else{
      alert('Please connect to metamask');
    }
  }
  public async getVotes(){
    if(this.isConnected){
      await this.dappService.getAllVotes();
    }
  }
}
