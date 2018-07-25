import $ from 'jquery';

window.func = () => {
  const val = $('#input').text();
  $('#output').text(`text is ${val}`);
};
