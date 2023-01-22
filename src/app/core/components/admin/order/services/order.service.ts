import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { environment } from 'environments/environment';
import { Order } from '../models/order';


@Injectable({
  providedIn: 'root'
})

export class OrderService {

  constructor(private httpClient:HttpClient) { }

  getOrderList():Observable<Order[]>{
    return this.httpClient.get<Order[]>(environment.getApiUrl+"/Orders/getall")
  }

  getOrderById(id:number):Observable<Order>{
    return this.httpClient.get<Order>(environment.getApiUrl+"/Orders/getbyid?orderId="+id)
  }

  addOrder(order:Order):Observable<any>{
    var result=this.httpClient.post(environment.getApiUrl+"/Orders",order,{responseType:'text'});
    return result;
  }

  updateOrder(order:Order):Observable<any>{
    var result=this.httpClient.put(environment.getApiUrl+"/Orders",order,{responseType:'text'});
    return result;
  }
  deleteOrder(id:number){
    return this.httpClient.request('delete',environment.getApiUrl+"/Orders",{body:{orderId:id}})
  }
 
}
