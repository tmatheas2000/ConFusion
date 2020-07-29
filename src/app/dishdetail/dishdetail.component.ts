import { Component, OnInit ,ViewChild} from '@angular/core';
import {Dish} from '../shared/dish';
import {Params,ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {DishService} from '../services/dish.service';
import {switchMap} from 'rxjs/operators';
import {FormBuilder,FormGroup,Validators} from '@angular/forms';
import {Comment} from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

export class DishdetailComponent implements OnInit {

  dish:Dish;
  dishIds:string[];
  prev:string;
  next:string;
  commentForm:FormGroup;
  comment:Comment;

  @ViewChild('fform') commentFormDirective;

  formErrors={
    'author':'',
    'rating':'',
    'comment':''
  };
  
  validationMessages={
    'author':{
      'required':'Name is required.',
      'minlength':'Name must be atleast 2 characters long.',
      'maxlength':'Name cannot be more than 25 characters long.'
    },
    'rating':{
      'required':'Rating is required.'
    },
    'comment':{
      'required':'Comment is required.'
    }
  };

  formatLabel(value: number | null) {
    if (!value) {
      return 1;
    }
    if (value > 5) {
      return Math.round(value / 5);
    }
    return value;
  }
    
  constructor(private dishService:DishService,
    private location:Location,
    private route:ActivatedRoute,
    private fb:FormBuilder) { 
      this.createForm();
    }

  ngOnInit() {
    this.dishService.getDishIds().subscribe((dishIds)=>{
      this.dishIds=dishIds;
    });
    this.route.params
    .pipe(switchMap((params:Params)=> this.dishService.getDish(params['id'])))
    .subscribe((dish)=>{
      this.dish=dish;
      this.setPrevNext(dish.id);
    });
  }

  setPrevNext(dishId:string){
    const index=this.dishIds.indexOf(dishId);
    this.prev=this.dishIds[(this.dishIds.length+index-1)%this.dishIds.length];
    this.next=this.dishIds[(this.dishIds.length+index+1)%this.dishIds.length];
  }

  goBack():void{
    this.location.back();
  }

  createForm(){
    this.commentForm=this.fb.group({
      author:['',[Validators.required,Validators.minLength(2),Validators.maxLength(25)]],
      rating:['',Validators.required],
      comment:['',Validators.required]
    });

    this.commentForm.valueChanges.subscribe(data =>this.onValueChanged(data));
    this.onValueChanged();
  }

  onSubmit(){
    let d = new Date();
    let n = d.toISOString();
    this.comment=this.commentForm.value;
    this.comment.date=n;
    this.dish.comments.push(this.comment);
    this.commentForm.reset({
      author:'',
      rating:'',
      comment:''
    });
    this.commentFormDirective.resetForm();
  }

  onValueChanged(data?:any){
    if(!this.commentForm)
    {
      return ;
    }
    const form=this.commentForm;
    for (const field in this.formErrors){
      if(this.formErrors.hasOwnProperty(field))
      {
        this.formErrors[field]='';
        const control=form.get(field);
        if(control && control.dirty && !control.valid)
        {
          const messages=this.validationMessages[field];
          for(const key in control.errors)
          {
            if(control.errors.hasOwnProperty(key))
            {
              this.formErrors[field]+=messages[key]+' ';
            }
          }
        }
      }
    }
  }

}
