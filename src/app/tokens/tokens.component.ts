import { Holder } from './../dapp/constants';
import { DappService } from './../dapp/dapp.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.css']
})
export class TokensComponent implements OnInit {
  holders: Holder[] = [];
  recepient = '';
  amount = '';
  isConnected = false;
  constructor(private dappService:DappService) { }

  ngOnInit(): void {
    
    this.dappService.isConnected.subscribe(async (value) => 
    {
      this.isConnected = value;
      if(value) {
        this.holders = await this.dappService.getBalances();
        this.holders = this.holders.filter((cv) => {return cv.balance>0})
      }
    }
      );
  }
  public async addTokens(){
    if(this.recepient != '' && this.amount != '')
      await this.dappService.mintTokenVote(this.recepient, parseInt(this.amount));
  }
}
