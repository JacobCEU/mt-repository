const user_model = (name,age,contactNo,username,password)=>{

let User = {
    user_name: name,
    user_age: age,
    user_contactNo: contactNo,
    username: username,
    password: password
}

return User



}
module.exports = {
    user_model
}