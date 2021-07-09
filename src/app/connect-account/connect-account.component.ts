import { DappService } from './../dapp/dapp.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-connect-account',
  templateUrl: './connect-account.component.html',
  styleUrls: ['./connect-account.component.css']
})
export class ConnectAccountComponent implements OnInit {

  constructor(private dappService:DappService) { }
  isConnected: boolean = false;
  connectedAccount: string = ''
  ngOnInit(): void {
  }

  public async connectToMetamask(): Promise<void>{
    try{
      this.connectedAccount = await this.dappService.connect();
      this.isConnected = true;
    } catch(err){
      
    }
  }
}
