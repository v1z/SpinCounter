class PSeu {

  constructor() {
    this.tournaments = {
      '0.25' : [],
      '1' : [],
      '3' : [],
      '5' : [],
      '7' : [],
      '10' : [],
      '15' : [],
      '30' : [],
      '60' : [],
      '100' : []
    };

    this.filtered = {
      '0.25' : [],
      '1' : [],
      '3' : [],
      '5' : [],
      '7' : [],
      '10' : [],
      '15' : [],
      '30' : [],
      '60' : [],
      '100' : []
    };

    this.chances = {
      '0.25' : [0.734388, 0.184506, 0.075, 0.005, 0.001, 0.000075, 0.00003, 0.000001],
      '1' : [0.734388, 0.184506, 0.075, 0.005, 0.001, 0.000075, 0.00003, 0.000001],
      '3' : [0.734388, 0.184506, 0.075, 0.005, 0.001, 0.000075, 0.00003, 0.000001],
      '5' : [0.734388, 0.184506, 0.075, 0.005, 0.001, 0.000075, 0.00003, 0.000001],
      '7' : [0.719388, 0.199506, 0.075, 0.005, 0.001, 0.000075, 0.00003, 0.000001],
      '10' : [0.719388, 0.199506, 0.075, 0.005, 0.001, 0.000075, 0.00003, 0.000001],
      '15' : [0.704388, 0.214506, 0.075, 0.005, 0.001, 0.000075, 0.00003, 0.000001],
      '30' : [0.704388, 0.214506, 0.075, 0.005, 0.001, 0.000075, 0.00003, 0.000001],
      '60' : [0.689388, 0.229506, 0.075, 0.005, 0.001, 0.000075, 0.00003, 0.000001],
      '100' : [0.689388, 0.229506, 0.075, 0.005, 0.001, 0.000075, 0.00003, 0.000001]
    };

    // in absolute numbers 0.02 means cents not 2%
    this.rake = {
      '0.25' : 0.02,
      '1' : 0.08,
      '3' : 0.24,
      '5' : 0.24,
      '7' : 0.49,
      '10' : 0.49,
      '15' : 0.9,
      '30' : 1.8,
      '60' : 3,
      '100' : 5
    };

    this.multipliers = [2, 4, 6, 10, 25, 120, 240, 12000];

    // 2nd and 3rd place will recieve 1/12 of prize pool when hit top3 multiplier
    this.jp = 12;

    this.vpp = 5.5;

    this.log = "";

    this.isFiltered = false; // is Filter btn clicked on results page
  }

  parseAll(files) {

    switchPage('empty');
    $('#selecting').addClass('hidden');
    $('#loading').removeClass('hidden');

    // clear tournaments from previous import
    this.tournaments = {
      '0.25' : [],
      '1' : [],
      '3' : [],
      '5' : [],
      '7' : [],
      '10' : [],
      '15' : [],
      '30' : [],
      '60' : [],
      '100' : []
    };

    let keys = Object.keys(files); // array of files in folder

    // loop through each file and call read function
    let progress = keys.map(item => {
      return new Promise((resolve) => {
        this.readFile(files[item], resolve);
      });
    });

    // draw the results after read all files
    Promise.all(progress).then(() => {

      // clear input field
      $('#file-input')[0].value = '';

      // all limits in room
      const knownLimits = Object.keys(this.tournaments);

      // only limits that were played in import history
      const seenLimits = knownLimits.filter(x => this.tournaments[x].length > 0).sort((a,b) => a - b);

      // minimal of seen limit
      const minLimit = Math.min(...seenLimits);

      // if there is at least 1 valid tournament in import
      if (seenLimits.length > 0) {

        // remove disabled from results navigation link
        $('.nav__link[href="#results"]').removeClass('nav__link--disabled');

        // remove error message on upload page
        $('.upload-form__error').addClass('hidden');
        // remove error message on result page
        $('.error-result').addClass('hidden');

        // set filters to default values
        $("#date-from").datepicker( "option", "minDate", "01/01/2000" );
        $("#date-from").datepicker( "option", "maxDate", new Date() );
        $("#date-to").datepicker( "option", "maxDate", +1 );
        $("#date-from").datepicker('setDate', new Date());
        $("#date-to").datepicker('setDate', +1);

        this.renderResults(minLimit, seenLimits);

      } else {

        // show error message on upload page and disable results navigation link
        $('.upload-form__error').removeClass('hidden');
        $('.nav__link[href="#results"]').addClass('nav__link--disabled');
        $('#loading').addClass('hidden');
        switchPage('upload');

      };

    });
  }

  readFile(e, callback) {
    let that = this;

    // Files API
    let reader = new FileReader();

    // Firefox bug with russian letters in the name of the files
    if (e.name.length < 60)
      reader.readAsText(e, "UTF-8")
    else {
      that.log += `Error - ${e.name} - russian name(?)\n`;
      callback();
    }

    reader.onload = function(evt) {

      try {
        let text = evt.target.result; // get the text of the file
        let rows = text.split('\n'); // split text into rows

        // check for tournaments with 3 players and exclude cash games
        if ((rows[0].split(' ')[1] == 'Tournament' || rows[0].split(' ')[1] == 'Турнир') && rows[2].split(' ')[0] == '3') {
          // check for valid file
          if ((rows[10].split(' ')[0] == 'You' && rows[10].split(' ')[1] == 'finished') || (rows[10].split(' ')[0] == 'Вы' && rows[10].split(' ')[1] == 'финишировали')) {

            const initialBuyin = rows[1].split(' ')[1];
            const buyin = +initialBuyin.split('/')[0].slice(1) + +initialBuyin.split('/')[1].slice(1); // e.g. 7

            let date = rows[4].split(' ')[2]; // e.g. '2016/11/08' or '17.12.2016'
            if (date.indexOf('.') != -1)
              date = `${date.split('.')[2]}/${date.split('.')[1]}/${date.split('.')[0]}`
            else date = `${date.split('/')[1]}/${date.split('/')[2]}/${date.split('/')[0]}`

            const prizePool = rows[3].split(' ')[3].slice(1);
            const multiplier = +prizePool / buyin;

            const won = (rows[10].split(' ')[3] == '1st' || rows[10].split(' ')[3] == '1');

            that.tournaments[buyin.toString()].push([date, multiplier, won]);

          }
        }
      }
      catch(evt) {
        that.log += `Error - ${e.name} - ${evt}\n`;
      }
      finally {
        callback();
      }

    };
    reader.onerror = function(evt) {
        that.log += `Error - ${e.name} - cannot read file\n`;
        callback();
    };

  }

  renderResults(limit, seenLimits) {

    // clear limits buttons
    $('#limits').html('');

    // for each seen limit in import history create button with click event
    seenLimits.map(x => {
      let btn = '<li class="limits__item';
      if (x == limit) btn += ' limits__item--active';
      btn += `"><a class="limits__btn" onclick="switchLimit(this)" data-limit="${x}">$${x}</a></li>`

      $('#limits').append(btn);
    });

    // also create "Total" button
    $('#limits').append('<li class="limits__item"><a class="limits__btn" onclick="switchLimit(this)" data-limit="Total">Total</a></li>');

    // make click on first button to display initial data
    $(`.limits__btn[data-limit="${limit}"]`).trigger('click');

    // switch to results page
    window.location.hash = '#results';

  }

  draw(tournaments, limit) {

    let that = this;

    // clear table body and footer
    $('#results').html('');
    $('#summaries').html('');
    $('#headers').html('');

    if (limit != 'Total') {
      let sumProfit = 0;
      let expectedArr = [];
      let diffArr = [];

      $('#results').append(`<tr class="results__row results__row--header">
                              <th class="results__header">Multiplier</th>
                              <th class="results__header">Played</th>
                              <th class="results__header">Expected</th>
                              <th class="results__header">Difference</th>
                              <th class="results__header">Won</th>
                              <th class="results__header">% ITM</th>
                              <th class="results__header">Profit</th>
                            </tr>`);

      // loop each multiplier and draw table row
      this.multipliers.map((item, indexOfMult) => {

        // multiplier
        const mult = `x${item}`;

        // count = array filtered by multiplier
        const count = tournaments[limit].filter(x => x[1] == item).length;

        // won = array filtered by multiplier and won = true
        const won = tournaments[limit].filter(x => ((x[1] == item) && (x[2] == true))).length;

        // itm = won / count in percentage, return 0 when divide by 0
        let itm = Math.round(won / count * 10000) / 100;
        if (isNaN(itm)) itm = 0;

        // expected count = chance * total count
        const exp = Math.round(that.chances[limit][indexOfMult] * tournaments[limit].length);

        // push expected value (WITHOUT ROUND) for sumary result
        expectedArr.push(that.chances[limit][indexOfMult] * tournaments[limit].length * item);

        // difference = actual count - expected count
        const diff = count - exp;

        // push diff value (WITHOUT ROUND) for sumary result
        diffArr.push((count - that.chances[limit][indexOfMult] * tournaments[limit].length) * item);

        // green font if we got more than expected and red otherwise
        const diffColor = diff < 0 ? 'results__cell--red' : diff > 0 ? 'results__cell--green' : '';

        // profit = prizes - buyins
        let profit = limit * (item * won - count);

        // detect top3 multipliers for different prize structure
        if (that.multipliers.indexOf(item) + 3 >= that.multipliers.length) {
          profit -= limit * (item / that.jp * 2) * won;
          profit += limit * (item / that.jp) * (count - won);
        }

        // inc summary profit
        sumProfit += profit;

        // green font if we won something and red otherwise
        const profitColor = profit < 0 ? 'results__cell--red' : profit > 0 ? 'results__cell--green' : '';

        const row = `<tr class="results__row">
                        <td class="results__cell">${mult}</td>
                        <td class="results__cell">${count}</td>
                        <td class="results__cell">${exp}</td>
                        <td class="results__cell ${diffColor}">${diff}</td>
                        <td class="results__cell">${won}</td>
                        <td class="results__cell">${itm}</td>
                        <td class="results__cell ${profitColor}">${profit}</td>
                      </tr>`;
        $('#results').append(row);
      });

      // get summary and draw summary row
      const sumCount = tournaments[limit].length;

      const sumWon = tournaments[limit].filter(x => x[2] == true).length;

      let sumITM = Math.round(sumWon / sumCount * 10000) / 100;
      if (isNaN(sumITM)) sumITM = 0;

      let sumExpWithJP = expectedArr.reduce((prev, cur) => prev + cur, 0);
      let sumExpWithoutJP = sumExpWithJP - expectedArr[expectedArr.length - 1]
                            - expectedArr[expectedArr.length - 2] - expectedArr[expectedArr.length - 3];
      sumExpWithJP = Math.round(sumExpWithJP);
      sumExpWithoutJP = Math.round(sumExpWithoutJP);


      let sumDiffWithJP = diffArr.reduce((prev, cur) => prev + cur, 0); Math.round();
      let sumDiffWithoutJP = sumDiffWithJP - diffArr[diffArr.length - 1]
                            - diffArr[diffArr.length - 2] - diffArr[diffArr.length - 3];
      sumDiffWithJP = Math.round(Math.round(sumDiffWithJP) / sumExpWithJP * 10000) / 100;
      sumDiffWithoutJP = Math.round(Math.round(sumDiffWithoutJP) / sumExpWithoutJP * 10000) / 100;

      const sumDiffColorWith = sumDiffWithJP < 0 ? 'results__cell--red' : sumDiffWithJP > 0 ? 'results__cell--green' : '';
      const sumDiffColorWithout = sumDiffWithoutJP < 0 ? 'results__cell--red' : sumDiffWithoutJP > 0 ? 'results__cell--green' : '';

      const sumProfitColor = sumProfit < 0 ? 'results__cell--red' : sumProfit > 0 ? 'results__cell--green' : '';

      const ROI = Math.round(sumProfit / (tournaments[limit].length * limit) * 10000) / 100;
      const ROIColor = ROI < 0 ? 'results__cell--red' : ROI > 0 ? 'results__cell--green' : '';

      const rake = Math.round(this.rake[limit] * sumCount * 100) / 100;

      const vpp = Math.round(rake * this.vpp * 100) / 100;

      const summaries = `<tr class="results__row">
                          <td class="results__cell" rowspan="2">Summary</td>
                          <td class="results__cell" rowspan="2">${sumCount}</td>
                          <td class="results__cell" title="Expected prize pool in buy-ins">${sumExpWithJP} with JP</td>
                          <td class="results__cell ${sumDiffColorWith}" title="The percentage deviation of actual prize pool from expected prize pool">${sumDiffWithJP}% with JP</td>
                          <td class="results__cell" rowspan="2">${sumWon}</td>
                          <td class="results__cell" rowspan="2">${sumITM}</td>
                          <td class="results__cell ${sumProfitColor}" rowspan="2">${sumProfit}</td>
                        </tr>
                        <tr>
                          <td class="results__cell" title="Expected prize pool in buy-ins excluding top3 multipliers">${sumExpWithoutJP} w/o JP</td>
                          <td class="results__cell ${sumDiffColorWithout}" title="The percentage deviation of actual prize pool from expected prize pool excluding top3 multipliers">${sumDiffWithoutJP}% w/o JP</td>
                        </tr>
                        <tr class="results__row">
                          <td class="results__cell ${ROIColor}" colspan="2">% ROI = ${ROI}</td>
                          <td class="results__cell" colspan="2">Rake paid = $${rake}</td>
                          <td class="results__cell" colspan="3">VPP = ${vpp}</td>
                        </tr>`;

      $('#summaries').append(summaries);

    } else {

      let sumCount = 0;
      let sumWon = 0;
      let sumProfit = 0;

      $('#results').append(`<tr class="results__row results__row--header">
                              <th class="results__header">Multiplier</th>
                              <th class="results__header">Played</th>
                              <th class="results__header">Won</th>
                              <th class="results__header">% ITM</th>
                              <th class="results__header">Profit</th>
                            </tr>`);

      // limits seen
      let lims = Object.keys(tournaments).filter(lim => tournaments[lim].length > 0);

      // loop each multiplier and draw table row
      this.multipliers.map((item, indexOfMult) => {

        // multiplier
        const mult = `x${item}`;

        // count = array filtered by multiplier
        const count = lims.map(lim => tournaments[lim].filter(x => x[1] == item).length).reduce((sum, next) => sum + next, 0);
        sumCount += count;

        // won = array filtered by multiplier and won = true
        const won = lims.map(lim => tournaments[lim].filter(x => ((x[1] == item) && (x[2] == true))).length).reduce((sum, next) => sum + next, 0);
        sumWon += won;

        // itm = won / count in percentage, return 0 when divide by 0
        let itm = Math.round(won / count * 10000) / 100;
        if (isNaN(itm)) itm = 0;

        // profit = prizes - buyins
        let profit = lims.map(lim => {
          return (that.multipliers.indexOf(item) + 3 >= that.multipliers.length)
            ? lim * (( (that.jp - 2) / that.jp * item * tournaments[lim].filter(x => ((x[1] == item) && (x[2] == true))).length - tournaments[lim].filter(x => x[1] == item).length) + item / that.jp * (tournaments[lim].filter(x => x[1] == item).length - tournaments[lim].filter(x => ((x[1] == item) && (x[2] == true))).length))
            : lim * (item * tournaments[lim].filter(x => ((x[1] == item) && (x[2] == true))).length - tournaments[lim].filter(x => x[1] == item).length);
        }).reduce((sum, next) => sum + next, 0);

        // inc summary profit
        sumProfit += profit;

        // green font if we won something and red otherwise
        const profitColor = profit < 0 ? 'results__cell--red' : profit > 0 ? 'results__cell--green' : '';

        const row = `<tr class="results__row">
                        <td class="results__cell">${mult}</td>
                        <td class="results__cell">${count}</td>
                        <td class="results__cell">${won}</td>
                        <td class="results__cell">${itm}</td>
                        <td class="results__cell ${profitColor}">${profit}</td>
                      </tr>`;
        $('#results').append(row);

      });

      let sumITM = Math.round(sumWon / sumCount * 10000) / 100;
      if (isNaN(sumITM)) sumITM = 0;

      const sumBuyin = lims.map(lim => tournaments[lim].length * lim).reduce((sum, next) => sum + next, 0);

      const ROI = Math.round(sumProfit / sumBuyin * 10000) / 100;
      const ROIColor = ROI < 0 ? 'results__cell--red' : ROI > 0 ? 'results__cell--green' : '';

      const sumProfitColor = sumProfit < 0 ? 'results__cell--red' : sumProfit > 0 ? 'results__cell--green' : '';

      const rake = Math.round(lims.map(lim => tournaments[lim].length * this.rake[lim]).reduce((sum, next) => sum + next, 0) * 100) / 100;

      const vpp = Math.round(rake * this.vpp * 100) / 100;

      const summaries = `<tr class="results__row">
                          <td class="results__cell results__cell--double">Summary</td>
                          <td class="results__cell results__cell--double">${sumCount}</td>
                          <td class="results__cell results__cell--double">${sumWon}</td>
                          <td class="results__cell results__cell--double">${sumITM}</td>
                          <td class="results__cell results__cell--double ${sumProfitColor}">${sumProfit}</td>
                        </tr>
                        <tr class="results__row">
                          <td class="results__cell ${ROIColor}" colspan="2">% ROI = ${ROI}</td>
                          <td class="results__cell" colspan="2">Rake paid = $${rake}</td>
                          <td class="results__cell">VPP = ${vpp}</td>
                        </tr>`;

      $('#summaries').append(summaries);

    };

    $('#loading').addClass('hidden');

  }

  setRange(item) {
    const today = new Date();
    let monthStart;

    $("#date-from").datepicker( "option", "minDate", "01/01/2000" );
    $("#date-from").datepicker( "option", "maxDate", today );
    $("#date-to").datepicker( "option", "maxDate", +1 );

    switch ($(item).attr('data-range')) {
      case 'Today':
        $("#date-from").datepicker('setDate', today);
        $("#date-from").trigger('change');
        $("#date-to").datepicker('setDate',  +1);
        $("#date-to").trigger('change');
        break;
      case 'Yesterday':
        $("#date-from").datepicker('setDate', -1);
        $("#date-from").trigger('change');
        $("#date-to").datepicker('setDate', today);
        $("#date-to").trigger('change');
        break;
      case 'Last 7 days':
        $("#date-from").datepicker('setDate', -6);
        $("#date-from").trigger('change');
        $("#date-to").datepicker('setDate', +1);
        $("#date-to").trigger('change');
        break;
      case 'This month':
        monthStart = (today.getDate() - 1) > 0 ? -1 * (today.getDate() - 1) : today;
        $("#date-from").datepicker('setDate', monthStart);
        $("#date-from").trigger('change');
        $("#date-to").datepicker('setDate', +1);
        $("#date-to").trigger('change');
        break;
      case 'Last month':
        monthStart = today.getMonth() == 0 ? `12/1/${today.getFullYear() - 1}` : `${today.getMonth()}/1/${today.getFullYear()}`;
        $("#date-from").datepicker('setDate', monthStart);
        $("#date-from").trigger('change');
        $("#date-to").datepicker('setDate', `${today.getMonth() + 1}/1/${today.getFullYear()}`);
        $("#date-to").trigger('change');
        break;
      case 'This year':
        $("#date-from").datepicker('setDate', `1/1/${today.getFullYear()}`);
        $("#date-from").trigger('change');
        $("#date-to").datepicker('setDate', +1);
        $("#date-to").trigger('change');
        break;
      case 'Last year':
        $("#date-from").datepicker('setDate', `1/1/${today.getFullYear() - 1}`);
        $("#date-from").trigger('change');
        $("#date-to").datepicker('setDate', `1/1/${today.getFullYear()}`);
        $("#date-to").trigger('change');
        break;
      case 'All time':
        $("#date-from").datepicker('setDate', `1/1/2000`);
        $("#date-from").trigger('change');
        $("#date-to").datepicker('setDate', +1);
        $("#date-to").trigger('change');
        break;
    };

    $('#dateFilterBtn').trigger('click');
  }

  filter() {
    // define date ranges in valid format => 'yyyy/mm/dd'
    let from = new Date();
    from.setTime(Date.parse($('#date-from').val()));
    let to = new Date();
    to.setTime(Date.parse($('#date-to').val()));
    let that = this;

    // clear filtered tournaments
    this.filtered = {
      '0.25' : [],
      '1' : [],
      '3' : [],
      '5' : [],
      '7' : [],
      '10' : [],
      '15' : [],
      '30' : [],
      '60' : [],
      '100' : []
    };

    // loop through each tournament and check date
    let filtering = Object.keys(this.tournaments).map(lim => {
      that.tournaments[lim].map(tourn => {
        return new Promise((resolve) => {

          let date = new Date();
          date.setTime(Date.parse(tourn[0])); // date of tournament

          if (date >= from && date < to) that.filtered[lim].push(tourn);

          resolve();
        });
      });
    });

    // draw the results after read all files
    Promise.all(filtering).then(() => {

      // all limits in room
      const knownLimits = Object.keys(this.tournaments);

      // only limits that were played in filtered range
      const seenLimits = knownLimits.filter(x => this.filtered[x].length > 0).sort((a,b) => a - b);

      // minimal of seen limit
      const minLimit = Math.min(...seenLimits);

      // if there is at least 1 valid tournament in import
      if (seenLimits.length > 0) {
        this.isFiltered = true;
        $('.error-result').addClass('hidden');
        this.renderResults(minLimit, seenLimits);
      } else {
        this.isFiltered = false;
        $('.error-result').removeClass('hidden');
      };

    });
  }
}
