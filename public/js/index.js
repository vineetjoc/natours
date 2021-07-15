/*eslint-disable */

import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './settings';
import { bookTour } from './stripe';
import { showAlert } from './alert';

const mapBox = document.getElementById('map');
// const mapBox = document.querySelector('.section-map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateData = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-password');
const bookTourBtn = document.getElementById('book-tour');
// document.getElementById

if (updatePassword) {
  updatePassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    console.log(currentPassword, password);
    await updateSettings(
      { currentPassword, password, confirmPassword },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (updateData) {
  updateData.addEventListener('submit', (e) => {
    // console.log('in update user');
    const formData = new FormData(); //using FromData because we need to uplaod file as well
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('photo', document.getElementById('photo').files[0]);

    e.preventDefault();
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    updateSettings(formData, 'data');
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  // console.log(locations);
  displayMap(locations);
}

if (loginForm) {
  document.querySelector('.form').addEventListener('submit', (el) => {
    el.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    //   console.log('hello');
    login(email, password);
  });
}
if (bookTourBtn)
  bookTourBtn.addEventListener('click', async (e) => {
    e.target.textContent = 'Processing';
    await bookTour(e.target.dataset.tourId);
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
