$(function() {
  setInterval(function() {
    $("span#cursor")
      .fadeIn()
      .fadeOut();
  }, 500);

  $("button[for]").on("click", function() {
    var btnAttr = $(this).attr("for"),
      displayVal = $("#display"),
      screenVal = displayVal.text(),
      displayResult = $("#result"),
      ansKey = $("button[for='ans']"),
      val;
    if (btnAttr == "num") {
      val = parseInt($(this).text());
      displayVal.append(val);
    } else if (btnAttr == "char") {
      val = $(this).val();
      if (val == ".") {
        displayVal.append(val);
      } else if (val == "sqrt") {
        let sqrt = Math.sqrt(Number(screenVal));
        displayVal.prepend("&radic;");
        displayResult.text(sqrt);
        ansKey.val(sqrt);
      } else {
        displayVal.append(" " + val + " ");
      }
    } else if (btnAttr == "clear") {
      var retVal = screenVal.slice(0, screenVal.trim().length - 1);
      displayVal.text(retVal);
    } else if (btnAttr == "clear-all") {
      displayVal.text("");
      displayResult.text("0");
    } else if (btnAttr == "equals") {
      // val = Function('"use strict";return (' + displayVal.text() + ")")();
      val = eval(screenVal);
      displayResult.text(val);
      ansKey.val(val);
    } else if (btnAttr == "ans") {
      val = ansKey.val();
      if (val !== "") {
        displayVal.text(val);
      }
    }
  });

  $("body").keydown(function(e) {
    var key = e.key;
    var charArr = ["+", "-", "*", "/"];
    displayVal = $("#display");
    if (isNaN(key)) {
      if ($.inArray(key, charArr) > -1) {
        displayVal.append(" " + key + " ");
      }
    } else {
      displayVal.append(key);
    }
  });
});
