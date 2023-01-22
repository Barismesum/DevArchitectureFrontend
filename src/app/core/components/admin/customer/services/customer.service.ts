import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from './../../../../../../environments/environment';
import { Customer } from './../models/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private httpClient:HttpClient) { }

  getCustomerList(): Observable<Customer[]>{
    return this.httpClient.get<Customer[]>(environment.getApiUrl+ "/Customers/getall")
  }

  getCustomerById(id: number): Observable<Customer> {

    return this.httpClient.get<Customer>(environment.getApiUrl + "/Costumers/getbyid?customerId=" + id);
  }

  addCustomer(customer: Customer): Observable<any> {

    var result = this.httpClient.post(environment.getApiUrl + "/Customers/", customer, { responseType: 'text' });
    return result;
  }

  updateCustomer(customer:Customer):Observable<any> {

    var result = this.httpClient.put(environment.getApiUrl + "/Customers/", customer, { responseType: 'text' });
    return result;
  }

  deleteCustomer(id: number) {
    return this.httpClient.request('delete', environment.getApiUrl + "/Customers/", { body: {customerId:id} });
  }


}
