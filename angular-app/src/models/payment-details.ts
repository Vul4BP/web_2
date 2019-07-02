export class PaymentDetails{
    public Id: string; 
    public Cart: string; 
    public CreateTime: string; 
    public Intent: string; 
    public State: string; 
    public PayerName: string; 
    public PayerSurname: string; 
    public PayerId: string; 
    public PayerEmail: string; 
    public AddressCountryCode: string; 
    public AddressCity: string; 
    public AddressLine:string; 
    public AddressPostalCode: string; 
    public ItemName: string; 
    public ItemPrice: number; 
    public ItemCurrency: string; 
    public CurrencyRate: number;

    constructor(data: any){
        this.Id = data['id'];
        this.Cart = data['cart'];
        this.CreateTime = data['create_time'];
        this.Intent = data['intent'];
        this.State = data['state'];
        this.PayerName = data['payer']['payer_info']['first_name'];
        this.PayerSurname = data['payer']['payer_info']['last_name'];
        this.PayerId = data['payer']['payer_info']['payer_id'];
        this.PayerEmail = data['payer']['payer_info']['email'];
        this.AddressCountryCode = data['payer']['payer_info']['shipping_address']['country_code'];
        this.AddressCity = data['payer']['payer_info']['shipping_address']['city'];
        this.AddressLine = data['payer']['payer_info']['shipping_address']['line1'];
        this.AddressPostalCode = data['payer']['payer_info']['shipping_address']['postal_code'];
        this.ItemName = data['transactions']['0']['item_list']['items']['0']['name'];
        this.ItemPrice = data['transactions']['0']['item_list']['items']['0']['price'];
        this.ItemCurrency = data['transactions']['0']['item_list']['items']['0']['currency'];
    }
}