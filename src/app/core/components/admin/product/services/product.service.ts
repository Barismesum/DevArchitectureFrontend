import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { environment } from './../../../../../../environments/environment';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private httpClient:HttpClient) { }



  getProductList():Observable<Product[]>{
    return this.httpClient.get<Product[]>(environment.getApiUrl+"/Products/getall");
  }

  getProductById(id:number):Observable<Product>{
    return this.httpClient.get<Product>(environment.getApiUrl+"/Products/getbyid?productsId="+id);

  }

  addProduct(product:Product):Observable<any>{
    var result=this.httpClient.post(environment.getApiUrl+"/Products",product,{responseType:'text'});
    return result;

  }
  
  updateProduct(product:Product):Observable<any>{
    var result=this.httpClient.put(environment.getApiUrl+"/Products",product,{responseType:'text'});
    return result;
  }
  deleteProduct(id:number){
    return this.httpClient.request('delete',environment.getApiUrl+"/Products",{body:{productId:id}})
  }


}
