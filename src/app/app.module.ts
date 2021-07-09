import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import { AppComponent } from './app.component';
import { VotingComponent } from './voting/voting.component';
import { TokensComponent } from './tokens/tokens.component';
import { ConnectAccountComponent } from './connect-account/connect-account.component';

@NgModule({
  declarations: [
    AppComponent,
    VotingComponent,
    TokensComponent,
    ConnectAccountComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
