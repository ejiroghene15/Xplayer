$(function(){
    var user = localStorage.getItem("user") == null ? "John doe" : localStorage.getItem("user");
    $("#user").text(user).
})