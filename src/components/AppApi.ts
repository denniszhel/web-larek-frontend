import { ICard, IOrder, IOrderResponce } from "../types";
import { Api, ApiListResponse } from "./base/Api";

export class AppApi extends Api {
  readonly cdn: string;
  
  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getProductList(): Promise<ICard[]> {
    return this.get('/product').then((data: ApiListResponse<ICard>) => 
      data.items.map((item) => ({
        ...item,
        image: this.cdn + item.image
      }))
    );
  }

  getProductItem(id: string): Promise<ICard> {
    return this.get(`/product/${id}`).then(
        (item: ICard) => ({
            ...item,
            image: this.cdn + item.image
        })
    );
  }

  postOrder(order: IOrder): Promise<IOrderResponce> {
    return this.post('/order', order).then((data: IOrderResponce) => data);
  }

}