const user_model = (name,birthDate,contactNo,username,password, uStat)=>{

let User = {
    user_name: name,
    user_birthDate: birthDate,
    user_contactNo: contactNo,
    username: username,
    password: password,
    user_status: uStat
}

return User



}
module.exports = {
    user_model
}