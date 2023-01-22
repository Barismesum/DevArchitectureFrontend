import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { environment } from 'environments/environment';
import { AuthService } from '../login/services/auth.service';
import { OrderService } from './services/order.service';
import { Order } from './models/order';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
declare var jQuery: any;

@Component({
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit,AfterViewInit {
  dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
  displayedColumns:string[]=["orderId","productId","customerId","piece","isDeleted","delete"]

  order:Order;
  orderList:Order[];
  dropdownSettings: IDropdownSettings;
  constructor(
    private formBuilder:FormBuilder,
    private alertifyService:AlertifyService,
    private authService:AuthService,
    private orderService:OrderService
  ) { }

  ngAfterViewInit(): void {
    this.getOrderList();
  }

  ngOnInit(): void {
    this.createOrderAddForm();
    this.dropdownSettings=environment.getDropDownSetting;
  }
  orderAddForm:FormGroup;

  createOrderAddForm(){
    this.orderAddForm=this.formBuilder.group({
      orderId:[0],
      customerId:["",Validators.required],
      productId:["",Validators.required],
      piece:["",Validators.required],
      isDeleted:[false]
    })
  }
  save(){
    if(this.orderAddForm.valid){
      this.order=Object.assign({},this.orderAddForm.value)
      if(this.order.orderId==0)
        this.addOrder();
        else
        this.updateOrder();
    }
  }

  addOrder(){
    this.orderService.addOrder(this.order).subscribe(data=>{
      this.getOrderList();
      this.order=new Order();
      jQuery("#order").modal("hide");
      this.alertifyService.success(data);
      this.clearFormGroup(this.orderAddForm)
    })
  }

  getOrderList(){
    this.orderService.getOrderList().subscribe(data=>{
      this.orderList=data;
      this.dataSource=new MatTableDataSource(data);
    })
  }

  updateOrder(){
    this.orderService.updateOrder(this.order).subscribe(data=>{
      var index=this.orderList.findIndex(x=>x.orderId==this.order.orderId);
      this.orderList[index]=this.order;
      this.dataSource=new MatTableDataSource(this.orderList);
      this.configDataTable();
      this.order=new Order();
      jQuery('#order').modal("hide");
      this.alertifyService.success(data);
      this.clearFormGroup(this.orderAddForm);
    })
  }
  configDataTable(): void {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}
  clearFormGroup(group: FormGroup) {

    group.markAsUntouched();
    group.reset();

    Object.keys(group.controls).forEach(key => {
      group.get(key).setErrors(null);
      if (key == "orderId")
        group.get(key).setValue(0);
      else if (key == "isDeleted")
        group.get(key).setValue(false);
    });
  }
  deleteOrder(id: number) {
    this.orderService.deleteOrder(id).subscribe(data=>{
      this.alertifyService.success(data.toString());
      var index=this.orderList.findIndex(x=>x.orderId==id);
      this.orderList[index].isDeleted=true;
      this.dataSource=new MatTableDataSource(this.orderList);
      this.configDataTable();
    })

  
    
  }
  checkClaim(claim: string): boolean {
    return this.authService.claimGuard(claim)
  }
  applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

  getOrderById(id:number){
    this.clearFormGroup(this.orderAddForm);
    this.orderService.getOrderById(id).subscribe(data=>{
      this.order=data;
      this.orderAddForm.patchValue(data);
    })
  }

}
