//------------------ rendering --------------------------//

// toggle pages visibility
const switchPage = pageName => {
  $('.page').addClass('hidden');
  $(`.page--${pageName}`).removeClass('hidden');
};

// decide what page to render
const render = url => {

  // get the url path
  const path = url.split('/')[0];

  // map of paths
  const map = {
    // upload page
    '': () => { renderUpload() },
    '#': () => { renderUpload() },
    // result page
    '#results': () => { renderResult() },
    // help page
    '#help': () => { renderHelp() },
    // donate page
    '#donate': () => { renderDonate() }
  };

  // change active nav link
  $('.nav__link').removeClass('nav__link--active');
  path == ''
          ? $(`.nav__link[href='#']`).addClass('nav__link--active')
          : $(`.nav__link[href='${path}']`).addClass('nav__link--active');

  // go to
  if (map[path]) map[path]()
  else render404();
};

// render upload page
const renderUpload = () => {
  switchPage('upload');
};

// render help page
const renderHelp = () => {
  switchPage('help');
};

// render donate page
const renderDonate = () => {
  switchPage('donate');
};

// render result page
const renderResult = () => {
  switchPage('result');
};

// render 404 page
const render404 = () => {
  switchPage('404');
};

//------------------ end of rendering --------------------------//
