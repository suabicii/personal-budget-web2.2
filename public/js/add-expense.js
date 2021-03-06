$(document).ready(function () {
  // Domyślna data w formularzu - dzisiejsza
  var date = new Date();
  var month =
    date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth() + 1;
  var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  var today = date.getFullYear() + "-" + month + "-" + day;

  $("#date").val(today);

  // Usuń alerty i komunikaty o błędach
  function deleteMessages() {
    setTimeout(function () {
      $(".alert").remove();
      $(".errors").remove();
    }, 4000);
  }

  /** Zapisz wydatek w bazie danych
   * @param string payment  Sposób płatności
   * @param float amount  Kwota
   * @param string category  Kategoria wydatku
   * @param string date  Data wydania pieniędzy
   * @param string comment  Komentarz
   *
   * @return void
   */
  function saveExpenseInDatabase(payment, amount, category, date, comment) {
    $.post("expense/add", {
      payment: payment,
      amount: amount,
      category: category,
      date: date,
      comment: comment,
    })
      .done(function (data, status) {
        $("#messages").html(data);
        deleteMessages();
        console.log(status);
        $("#payment, #amount, #category, #date, #comment").val(null);
        $("#limitation").html("");
      })
      .fail(function (status) {
        console.log(status);
      });
  }

  // Sprawdź, czy na daną kategorię jest przypisany limit
  $("#category").change(function () {
    $.get("expense/get-limit", {
      category: $("#category option:selected").val(),
    })
      .done(function (data, status) {
        $("#limitation").html(data);
      })
      .fail(function (status) {
        console.log(status);
      });
  });

  $("#add-expense").submit(function (event) {
    event.preventDefault();
    var payment = $("#payment").val();
    var amount = $("#amount").val();
    var category = $("#category").val();
    var date = $("#date").val();
    var comment = $("#comment").val();

    // Sprawdź, czy dany wydatek przekracza wyznaczony limit
    if ($("#amount-limit-fetched").length) {
      if (
        parseFloat(amount) + parseFloat($("#expense-sum").text()) >
        parseFloat($("#amount-limit-fetched").text())
      ) {
        $("#amount-limit-warning").html($("#amount-limit-fetched").text());
        $("#warningModal").modal("show");

        $("#add-expense-over-limit").off("submit");
        $("#add-expense-over-limit").submit(function (event) {
          event.preventDefault();
          saveExpenseInDatabase(payment, amount, category, date, comment);
          $("#warningModal").modal("hide");
        });
      } else {
        saveExpenseInDatabase(payment, amount, category, date, comment);
      }
    } else {
      saveExpenseInDatabase(payment, amount, category, date, comment);
    }
  });
});
