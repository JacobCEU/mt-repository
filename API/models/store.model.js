const store_model = (id, name, manager , address, contactNo, email, stat)=>{

let Store = {
    store_id: id,
    store_name: name,
    store_manager: manager,
    store_address: address,
    store_contactNo: contactNo,
    store_email: email,
    store_status: stat
}

return Store



}
module.exports = {
    store_model
}