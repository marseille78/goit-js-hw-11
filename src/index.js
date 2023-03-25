import ApiService from './js/api-service.js';
import SimpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix';
import "simplelightbox/dist/simple-lightbox.min.css";

const apiService = new ApiService();
const refs = {}
let page = 1;
let gallery;

document.addEventListener('DOMContentLoaded', () => {
  refs.form = document.querySelector('#search-form');
  refs.input = refs.form.querySelector('[name=searchQuery]');
  refs.gallery = document.querySelector('.gallery');
  refs.btnLoadMore = document.querySelector('[data-load-more]');
  refs.spinner = document.querySelector('.spinner')

  refs.form.addEventListener('submit', handleSubmit);
  refs.input.addEventListener('change', clearGallery);
  refs.btnLoadMore.addEventListener('click', loadImages);
});

async function handleSubmit(e) {
  e.preventDefault();
  await loadImages();
}

function transformRequestPhrase(phrase) {
  return phrase.trim().replaceAll(/\s+/g, '+');
}

async function loadImages() {
  refs.spinner.classList.add('active');
  gallery && gallery.destroy();
  const requestPhrase = transformRequestPhrase(refs.input.value);

  try {
    const response = await apiService.getResource(requestPhrase, page);

    if (response.length === 0) {
      throw new Error();
    }

    renderGallery(response);
    gallery = new SimpleLightbox('.gallery a');
    page += 1;
  } catch {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    page = 1;
    refs.form.reset();
  }
  refs.spinner.classList.remove('active');
}

function renderGallery(arr) {
  arr.forEach(item => {
    refs.gallery.innerHTML += renderItem(item);
  });
}

function renderItem({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads
}) {
  return `
    <a href='${largeImageURL}' class='gallery__item'>
      <img src="${webformatURL}" alt="${tags}" loading="lazy" class='gallery__image' />
      <div class="gallery__info">
        <p class="gallery__info-item">
          <b>Likes: ${likes}</b>
        </p>
        <p class="gallery__info-item">
          <b>Views: ${views}</b>
        </p>
        <p class="gallery__info-item">
          <b>Comments: ${comments}</b>
        </p>
        <p class="gallery__info-item">
          <b>Downloads: ${downloads}</b>
        </p>
      </div>
    </a>
  `;
}

function clearGallery() {
  page = 1;
  refs.gallery.innerHTML = "";
}