import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Basket, IBasket, IBasketItem } from '../shared/models/basket';
import { IProduct } from '../shared/models/product';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  baseUrl = environment.apiUrl;
  private basketSource = new BehaviorSubject<IBasket>(null)
  basket$ = this.basketSource.asObservable();

  constructor(private http: HttpClient) { }

  getBasket(id: string){
    return this.http.get(this.baseUrl + 'basket?id=' + id)
    .pipe(
      map((basket: IBasket) => {
        this.basketSource.next(basket);
        console.log(this.getCurrentBasketValue());
      })
    )
  }

  setBasket(basket: IBasket){
    this.http.post(this.baseUrl + 'basket', basket).subscribe((response:IBasket)=> {
      this.basketSource.next(response);
      console.log(response);
    },
    error => {
      console.log(error);
    });
  }

  getCurrentBasketValue(){
    return this.basketSource.value;
  }

  addItemToBasket(item: IProduct, quantity=1){
    const itemtoAdd: IBasketItem = this.mapProductItemToBasketItem(item,quantity)
    const basket = this.getCurrentBasketValue() ?? this.CreateBasket();
    basket.items = this.addOrUpdateItem(basket.items, itemtoAdd, quantity);
    this.setBasket(basket);
  }
  private addOrUpdateItem(items: IBasketItem[], itemtoAdd: IBasketItem, quantity: number): IBasketItem[] {
    const index = items.findIndex(i => i.id === itemtoAdd.id);
    if(index === -1){
      itemtoAdd.quantity=quantity;
      items.push(itemtoAdd);

    }
    else{
      items[index].quantity += quantity;
    }
    return items;
  }
  private CreateBasket(): IBasket {
    const basket = new Basket();
    localStorage.setItem('basket_id', basket.id);
    return basket;
  }
  private mapProductItemToBasketItem(item: IProduct, quantity: number): IBasketItem {
    return{
      id: item.id,
      productName: item.name,
      price: item.price,
      pictureUrl: item.pictureUrl,
      quantity,
      brand: item.productBrand,
      type: item.productType
    };
  }

}
