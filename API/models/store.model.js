const store_model = (id, manager , address, contactNo, email)=>{

let Store = {
    store_id : id,
    store_manager: manager,
    store_address: address,
    store_contactNo: contactNo,
    store_email: email
}

return Store



}
module.exports = {
    store_model
}