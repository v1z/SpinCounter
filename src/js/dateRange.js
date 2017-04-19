$( function() {
  var dateFormat = "mm/dd/yy",
    from = $( "#date-from" )
      .datepicker({
        defaultDate: 0,
        showOtherMonths: true,
        selectOtherMonths: true,
        maxDate: 0,
        numberOfMonths: 1
      })
      .on( "change", function() {
        to.datepicker( "option", "minDate", getDate( this ) );
      }),
    to = $( "#date-to" ).datepicker({
      showOtherMonths: true,
      selectOtherMonths: true,
      maxDate: 1,
      numberOfMonths: 1
    })
    .on( "change", function() {
      from.datepicker( "option", "maxDate", getDate( this ) );
    });

    $("#date-from").datepicker('setDate', new Date());
    $("#date-to").datepicker('setDate', +1);

  function getDate( element ) {
    var date;
    try {
      date = $.datepicker.parseDate( dateFormat, element.value );
    } catch( error ) {
      date = null;
    }

    return date;
  };
} );
