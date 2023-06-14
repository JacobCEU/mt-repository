const transaction_model = (id,user, store,rName,rContact,amount, rDate,date, stat)=>{

let Transaction = {
    transaction_id: id,
    user_id: user,
    store_id: store,
    recipient_name: rName,
    recipient_contactNo: rContact,
    transaction_amt: amount,
    transaction_date: date,
    transaction_status: stat,
    receive_date: rDate
}

return Transaction

}
module.exports = {
    transaction_model
}