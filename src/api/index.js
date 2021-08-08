
const API_URL = process.env.REACT_APP_API_URL

async function getFormInputs(){
  let res = await fetch(API_URL + 'form/list')
  return await res.json()
}

async function postRating(rating){
  let postBodyOptions =  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating })
  }
  let res = await fetch(API_URL + 'rating/create', postBodyOptions)
  return await res.json()
}

async function postReview(ratingId, review){
  let postBodyOptions =  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  }
  let res = await fetch(API_URL + `rating/${ratingId}/review`, postBodyOptions)
  return await res.json()
}

module.exports = { postRating, getFormInputs, postReview }
