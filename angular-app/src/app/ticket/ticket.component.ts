import { Component, OnInit, Inject, forwardRef, ViewChild, AfterViewChecked, ElementRef  } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { FormBuilder } from '@angular/forms';
import { TicketService } from '../services/ticket.service';
import { PriceHistory } from 'src/models/price-history';
import { Coefficient } from 'src/models/coefficient';
import { PricelistElement } from 'src/models/pricelist-element';
import { MatTableDataSource, MatSort } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { PaymentDetails } from 'src/models/payment-details';

declare let paypal: any;

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements OnInit, AfterViewChecked {

  priceHistories: Array<PriceHistory> = new Array<PriceHistory>();
  coefficients: Array<Coefficient> = new Array<Coefficient>();
  selectedRowIndex: number;
  selectedRowElement: PricelistElement;
  message: string = "";
  messageIsError: boolean = false;

  lastBoughtTicketID: string = "";
  lastBoughtTicketValidUntil: number = -1;
  lastBoughtTicketPrice: Number = -1;

  displayedColumns: string[] = ['productTypeName', 'person','price'];
  dataSource = new MatTableDataSource();

  currencyRate: number;

  @ViewChild('divPaypal') divPaypal : ElementRef;
  @ViewChild(MatSort) sort: MatSort;
  
  //----------------PAYPAL-----------------
  addScript: boolean = false;
  paypalLoad: boolean = true;
  
  finalAmount: number = 1;

  paypalConfig = {
    env: 'sandbox',
    client: {
      //ne zaboravi kopirati client-id pre pokretanja
      sandbox: '<your client-id here>',
      production: '<your-production-key here>'
    },
    commit: true,
    locale: 'en_US',
    style: {
      size: 'medium',
      shape: 'rect',
      label: 'paypal',
    },
    payment: (data, actions) => {
      return actions.payment.create({
        payment: {
          intent: "sale",
          transactions: [
            { amount: { total: this.finalAmount, currency: 'EUR' },
              description: "Kupovina autobuske karte za gradski prevoz u Novom Sadu",
              item_list: {
                shipping_address: {
                  line1: "JGSP",
                  city: "Novi Sad",
                  country_code: "RS",
                  postal_code: "21000",
                },
                items: [{
                  name: this.selectedRowElement.productTypeName,
                  quantity: 1,
                  price: this.finalAmount,
                  currency: 'EUR'
                }]
              }
            }
          ]
        }
      });
    },
    onAuthorize: (data, actions) => {      
      return actions.payment.execute()
        .then((paymentDetails) =>  {
          // Show a success page to the buyer
          var paymentDetailsObj = new PaymentDetails(paymentDetails);
          paymentDetailsObj.CurrencyRate = this.currencyRate;
          this.buyTicket(this.selectedRowElement,JSON.stringify(paymentDetailsObj));
        });
    },
    onError: (err) => {
      // Show an error page here, when an error occurs
      console.log(err);
    }
  };

  //---------------------------------------
  
  constructor(@Inject(forwardRef(() => HomeComponent)) private _parent: HomeComponent,
    private formBuilder: FormBuilder, private _service: TicketService, private _auth: AuthService) { }

  ngOnInit() {
    this._parent.prikaziLeviMeni();

    this._service.getCurrentPriceHistories()
      .subscribe(
        data => {
          this.priceHistories = data;
          this._service.getAllCoefficients()
            .subscribe(
              data => {
                this.coefficients = data;
                let priceList = this.createPricelist();//.sort((a,b) => Number(b.purchasable) - Number(a.purchasable))
                this.dataSource = new MatTableDataSource(priceList.sort((a,b) => Number(b.purchasable) - Number(a.purchasable)));
                this.dataSource.sort = this.sort;
                this._service.getCurrencyRates()
                  .subscribe(
                    data =>{
                      var rate = data['eur']['rate'];  //uzmi dnevni kurs
                      this.currencyRate = Number.parseFloat(rate.toFixed(10));
                    }, 
                    err => {
                      console.log(err);
                      this.currencyRate = 0.00847347763; //kurs po datumu 25.06.2019
                    }
                  )
              },
              err => {
                console.log(err);
              }
            );
        },
        err => {
          console.log(err);
        }
      );

  }

  UserCanBuy(row: PricelistElement) {
    if(this._auth.getToken() === null){
      if (row.person == "obican" && row.productTypeName == "Vremenska (1h)") {
        return true;
      } else {
        row.purchasable = false;
        return false;
      }
    } else {
      if (this._auth.getUserStatus().toLowerCase() == "verified") {
        if (row.person == this._auth.getUserType().toLowerCase()) {
          return true;
        } else {
          return false;
        }
      } else {
        if (row.person == "obican") {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  DisplayMessage(text:string, error:boolean) {
    this.message = text;
    this.messageIsError = error;
  }

  createPricelist() : PricelistElement[]{
    var index = -1;
    var retVal = new Array<PricelistElement>();
    for(let priceHistory of this.priceHistories){
      for(let coef of this.coefficients){
        var pricelistEl = new PricelistElement();
        pricelistEl.productTypeName = priceHistory.ProductType.Name;
        pricelistEl.person = coef.Type;
        pricelistEl.price = priceHistory.Price * coef.Value;
        pricelistEl.id = ++index;
        pricelistEl.productTypeId = priceHistory.ProductType.Id;
        pricelistEl.purchasable = true;

        pricelistEl.purchasable = this.UserCanBuy(pricelistEl);

        retVal.push(pricelistEl);
      }
    }
    return retVal;
  }

  selectTicket(row: PricelistElement){
    if (row.purchasable) {
      this.selectedRowIndex = row.id;
      this.selectedRowElement = row;
      var priceStr =  (this.selectedRowElement.price * this.currencyRate).toFixed(2);
      this.finalAmount = Number.parseFloat(priceStr);
      if(this.divPaypal.nativeElement.hidden == true)
        this.divPaypal.nativeElement.hidden = false;
    }
  }

  buyTicket(row: PricelistElement, json: any){
    this.DisplayMessage("", false);
    if(row==undefined){
      this.DisplayMessage("Izaberite kartu korisniče", true);
      return;
    }

    if(this._auth.getToken() != null){
      this._service.buyTicket(row.productTypeId, json)
        .subscribe(
          data => {
            this.lastBoughtTicketID = data.Id;
            this.lastBoughtTicketPrice = data.Price;
            this.lastBoughtTicketValidUntil = Date.parse(data.Expires);
            this.DisplayMessage("Karta je kupljena", false);
          },
          err => {
            //this.DisplayMessage(err.error.Message, true);
            this.DisplayMessage("Ne mozete kupiti kartu", true);
          }
        )
    }else{
      this._service.buyTicketAnonymous(json)
        .subscribe(
          data => {
            this.lastBoughtTicketID = data.Id;
            this.lastBoughtTicketPrice = data.Price;
            this.lastBoughtTicketValidUntil = Date.parse(data.Expires);
            this.DisplayMessage("Karta je kupljena", false);
          },
          err => {
            // this.DisplayMessage(err.error.Message, true);
            this.DisplayMessage("Ne mozete kupiti kartu", true);
          }
        )
    }
  }

  public click(){
    this.message = '';
  }

  //----------------PAYPAL-----------------

  ngAfterViewChecked(): void {
    if (!this.addScript) {
      this.addPaypalScript().then(() => {
        paypal.Button.render(this.paypalConfig, '#paypal-checkout-btn');
        this.paypalLoad = false;
        //this.divPaypal.nativeElement.hidden = true; //sakrij dugme dok korisnik ne selektuje neku kartu
      })
    }
  }
  
  addPaypalScript() {
    this.addScript = true;
    return new Promise((resolve, reject) => {
      let scripttagElement = document.createElement('script');    
      scripttagElement.src = 'https://www.paypalobjects.com/api/checkout.js';
      scripttagElement.onload = resolve;
      document.body.appendChild(scripttagElement);
    })
  }
}
