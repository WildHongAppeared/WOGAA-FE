import React from 'react'
import Slider from '@material-ui/core/Slider'
import './App.css'
import logo from './smiley.png';


const API_URL = "http://localhost:8080/api/v1/"
const initialState = {
  showButton: false, //flag to show Help us improve button 
  showRating: false, //flag to show rating scale
  showThankYou: false, //flag to show thank you card after selecting rating
  selectedRating: 0, //variable to keep track of selected rating
  showForm: false, //flag to show feedback form
  showSmiley: true, //flag to show initial smiley face
  createdRatingId: null, //variable to keep track of id of rating returned from API
  formInputs: [],  //variable to keep track of form fields from API
  filledFormInputs: {}, //variable to keep track of filled in feedback form input
  invalidEmail: false, //flag to check valid email
  showFinalThankYou: false //flag to show final thank you after submit feedback
 }
 
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = initialState
  }


  async componentDidMount() { //retrieve feedback form fields during initial load
    let res = await fetch(API_URL + 'form/list')
    let formInputs = await res.json()
    let filledFormInputs = {}
    formInputs.forEach((input) => filledFormInputs[input.id] = '')
    this.setState({ formInputs, filledFormInputs})
  }

  async setRating(rating){ //after selecting rating, send to API and keep track of created id for feedback form
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating })
    }
    fetch(API_URL + 'rating/create', requestOptions)
    .then(response => response.json())
    .then(data => {
        this.setState({ selectedRating: rating, showThankYou: true, showRating: false, showButton: false, showSmiley: false, createdRatingId: data.id }, () => {  
          setTimeout(() => {
             this.setState({ showForm: true, showThankYou: false });
           }, 2000)
         })
      })
  }

  renderScore(){ //render function to render the rating scores (can probably use something from material ui for prettier UI)
    const scoreMax = 6
    let toRender = []
    for(var i = 1; i <= scoreMax; i++){
      if(i === 1){ //first number in rating scale has different render compared to other numbers
        toRender.push(
          <button key={"number" + i} className={`rating-button first`} onClick={async () => { await this.setRating(i)}}>
            {i}
          </button>
        )
        continue
      }
      if(i === scoreMax){ //last number in rating scale has different render compared to other numbers
        toRender.push(
          <button key={"number" + i} className={`rating-button last`} onClick={async () => { await this.setRating(i)}}>
            {i}
          </button>
        )
        continue
      }
      toRender.push(
        <button key={"number" + i} className={`rating-button`} onClick={async () => { await this.setRating(i)}}>
          {i}
        </button>
      )

    }
    return (
      <div className="rating-div">
        {toRender}
      </div>
    )
  }

  handleTextChange(e, formId){ 
    let filledFormInputs = this.state.filledFormInputs
    filledFormInputs[formId] = e.target.value
    this.setState({ filledFormInputs })
  }

  handleSliderChange(value, formId){
    let filledFormInputs = this.state.filledFormInputs
    filledFormInputs[formId] = value
    this.setState({ filledFormInputs })
  }

  handleEmailChange(e, formId){ //handle email with regex to check if its valid email format and show error if not
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let filledFormInputs = this.state.filledFormInputs
    filledFormInputs[formId] = e.target.value
    if ( re.test(e.target.value) ) {
      this.setState({ filledFormInputs, invalidEmail: false })
    } else {
      this.setState({ filledFormInputs, invalidEmail: true })
    }
  }

  renderFormInputs(form){ //render form based on input types from API (only accept text, email and linear_scale)
    let inputType = []
    const filledFormInputs = this.state.filledFormInputs
    switch(form.type){
      case 'text':
        inputType.push(<textarea className='text-form' type='text' placeholder={form.subtitle} value={filledFormInputs[form.id]} onChange={(e) => this.handleTextChange(e, form.id)}></textarea>)
        break;
      case 'email':
        if(this.state.invalidEmail)
        inputType.push(<p className='error-text'>Please enter a valid email</p>)
        inputType.push(<textarea className={`email-form ${this.state.invalidEmail ? 'error': null }`} id={form.id} type="email" placeholder={form.subtitle} value={filledFormInputs[form.id]} onChange={(e) => this.handleEmailChange(e, form.id)}></textarea>)
        break;
      case 'linear_scale':
        inputType.push(<Slider
            value={filledFormInputs[form.id]}
            className="slider"
            max={100}
            min={0}
            step={5}
            defaultValue={50}
            valueLabelDisplay="on"
            onChange={(e, v) => this.handleSliderChange(v, form.id)}
          />)
        break;
    }
    return (
      <div className="form-holder" key={form.id}>
        <p className="form-title">{form.title}</p>
        {inputType}
      </div>
    )
  }

  submit(){ //submit feedback form input (can accept empty string as by default the fields are optional)
    if(this.state.invalidEmail){
      return
    }
    let filledFormInputs = this.state.filledFormInputs
    let processedInput = []
    
    for (const [key, value] of Object.entries(filledFormInputs)) {
      processedInput.push({ formInputId: key, remark: value })
    }
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(processedInput)
    }
    fetch(API_URL + `rating/${this.state.createdRatingId}/review`, requestOptions)
    .then(response => response.json())
    .then(data => {
      this.setState({ showForm: false, showFinalThankYou: true }, () => {  
        setTimeout(() => {
           this.setState(initialState);
         }, 2000)
       })
      })
  }

  renderForm(){
    let formInputs = this.state.formInputs
    return (
    <div className='form'>
      <div className="form-header">
        <button className='cancel-form' onClick={() => this.setState(initialState)}>X</button>
        <p className="form-header-text">Tell us more</p>
      </div>
      {formInputs.map((form) => this.renderFormInputs(form))}
      <button className="submit" onClick={()=> { this.submit() }}>Submit</button>
    </div>)
  }

  render(){
    return (
      <div className="overlay">
        {this.state.showSmiley? 
          <img className="img" src={logo} onMouseOver={()=> this.setState({showButton: true, showSmiley: false })} /*onMouseLeave={()=> this.setState({showButton: false })}*/></img> 
          : null
        }
        {this.state.showButton ? 
          (<button className='hover-button' onClick={() => this.setState({ showRating: true })}>Help Us Improve</button>) : null  
        }
        {this.state.showRating ? 
          (<div className='rating'>
            <button className='cancel' onClick={() => this.setState(initialState)}>X</button>
            <p className='text'>Rate your experience</p>
            {this.renderScore()}
            <div className="text-div"><p className={"small-text start"}>Not Satisfied</p><p className={"small-text end"}>Very Satisfied</p></div>
          </div>) : null
        }
        {this.state.showThankYou ? 
          (<div className='thank-you'>
            <img className="logo" src={logo}></img>
            <p className="thank-you-text">Thank you! Tell us more</p>
          </div>) : null 
        }
        {this.state.showForm ? this.renderForm() : null}
        {this.state.showFinalThankYou ? 
          (<div className='thank-you-final'>
            <p className="thank-you-text-final">Thank you!</p>
            <p className="thank-you-text-final">Your feedback is valuable to us</p>
          </div>) : null 
          }
      </div>
    );
  }

}

export default App;
