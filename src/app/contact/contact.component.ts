import { Component, OnInit ,ViewChild} from '@angular/core';
import {FormBuilder,FormGroup,Validators} from '@angular/forms';
import {Feedback,ContactType} from '../shared/feedback';
import {flyInOut,expand} from '../animations/app.animation';
import { FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host:{
    '[@flyInOut]':'true',
    'style':'display: block;'
  },
  animations:[flyInOut(),expand()]
})
export class ContactComponent implements OnInit {

  feedbackForm:FormGroup;
  feedback:Feedback;
  feed:Feedback=null;
  contactType=ContactType;
  errMess:string;
  view=true;
  @ViewChild('fform') feedbackFormDirective;

  formErrors={
    'firstname':'',
    'lastname':'',
    'telnum':'',
    'email':'',
    'message':''
  };

  validationMessages={
    'firstname':{
      'required':'First name is required.',
      'minlength':'First name must be atleast 2 characters long.',
      'maxlength':'First name cannot be more than 25 characters long.'
    },
    'lastname':{
      'required':'Last name is required.',
      'minlength':'Last name must be atleast 1 characters long.',
      'maxlength':'Last name cannot be more than 25 characters long.'
    },
    'telnum':{
      'required':'Tel. number is required.',
      'pattern':'Tel. number must contain only numbers.'
    },
    'email':{
      'required':'Email is required.',
      'email':'Email not in valid format.'
    },
    'message':{
      'required':'Feedback is required.'
    }
  };

  constructor(private fb:FormBuilder,private feedbackService:FeedbackService) {
    this.createForm();
   }

  ngOnInit() {
  }

  createForm(){
    this.feedbackForm=this.fb.group({
      firstname:['',[Validators.required,Validators.minLength(2),Validators.maxLength(25)]],
      lastname:['',[Validators.required,Validators.minLength(1),Validators.maxLength(25)]],
      telnum:['',[Validators.required,Validators.pattern]],
      email:['',[Validators.required,Validators.email]],
      agree:false,
      contacttype:'',
      message:['',Validators.required]
    });

    this.feedbackForm.valueChanges.subscribe(data =>this.onValueChanged(data));
    this.onValueChanged();
  }

  onSubmit(){
    this.view =false;
    this.feedback=this.feedbackForm.value;
    this.feedbackService.submitFeedback(this.feedback).subscribe(feedback=>{
      this.feed=feedback;
      setTimeout(()=>{
        this.feed=null;
        this.view=true;
      },5000)
    },errmess=>{
      this.feedback=null;
      this.errMess=<any>errmess;
    })
    this.feedbackForm.reset({
      firstname:'',
      lastname:'',
      telnum:'',
      email:'',
      agree:false,
      contactType:'',
      message:''
    });
    this.feedbackFormDirective.resetForm();
  }

  onValueChanged(data?:any){
    if(!this.feedbackForm)
    {
      return ;
    }
    const form=this.feedbackForm;
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
