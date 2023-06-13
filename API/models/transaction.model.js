const transaction_model = (id,user,rec,amt,date)=>{

let Transaction = {
    transaction_id: id,
    user_id: user,
    recipient: rec,
    transaction_amt: amt,
    transaction_date: date
}

return Transaction

}
module.exports = {
    transaction_model
}