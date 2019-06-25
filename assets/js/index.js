$(function() {
  $("a[for]").click(function() {
    $("a[for]").removeClass("link-active");
    $("#_form > div").hide();
    var _targetLink = $(this).attr("for");
    $(this).toggleClass("link-active");
    $("#_form > #" + _targetLink).show();
  });

  $("#submit").click(function(e) {
    e.preventDefault();
    var _name = $("input[for='_name']").val();
    var _email = $("input[for='_email']").val();
    var _pass = $("input[for='_pass']").val();
    var _pass2 = $("input[for='_cpass']").val();
    if (
      _name.length == 0 ||
      _email.length == 0 ||
      _pass.length == 0 ||
      _pass2.length == 0
    ) {
      alert("All fields are required");
    } else {
      if (_pass !== _pass2) {
        alert("Passwords doesn't match");
      } else {
        $(".bgCover").css("display", "flex");
        setInterval(function() {
          $(".bgCover > button")
            .fadeIn()
            .fadeOut();
          window.location.assign("dashboard.html");
        }, 2000);
        localStorage.setItem("user", _name);
      }
    }
  });
});
