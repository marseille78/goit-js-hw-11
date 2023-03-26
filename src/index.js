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
  hideLoadMore();
  const requestPhrase = transformRequestPhrase(refs.input.value);
  if (requestPhrase.length < 2) return;

  refs.spinner.classList.add('active');
  gallery && gallery.destroy();

  try {
    const { totalHits, hits: response } = await apiService.getResource(requestPhrase, page);

    if (response.length === 0) {
      throw new Error();
    }

    renderGallery(response);

    gallery = new SimpleLightbox('.gallery a');

    if (refs.gallery.children.length === totalHits) {
      hideLoadMore();
      Notify.failure('We\'re sorry, but you\'ve reached the end of search results.');
    } else {
      showLoadMore();
    }
    page += 1;
  } catch {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    page = 1;
    refs.form.reset();
  }
  refs.spinner.classList.remove('active');
}

function renderGallery(arr) {
  const listFragment = new DocumentFragment();

  arr.forEach(item => {
    listFragment.append(renderItem(item));
  });

  refs.gallery.append(listFragment);
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
  const createItemInfo = (label, value) => {
    const b = document.createElement('b');
    b.textContent = `${label}: ${value}`;

    const p = document.createElement('p');
    p.className = 'gallery__info-item';

    p.append(b);

    return p;
  };

  const image = document.createElement('img');
  image.src = webformatURL;
  image.alt = tags;
  image.loading = 'lazy';
  image.className = 'gallery__image';

  const infoLikes = createItemInfo('Likes', likes);
  const infoViews = createItemInfo('Views', views);
  const infoComments = createItemInfo('Comments', comments);
  const infoDownloads = createItemInfo('Downloads', downloads);

  const info = document.createElement('div');
  info.className = 'gallery__info';

  info.append(infoLikes);
  info.append(infoViews);
  info.append(infoComments);
  info.append(infoDownloads);

  const link = document.createElement('a');
  link.className = 'gallery__item';
  link.href = largeImageURL;

  link.append(image);
  link.append(info);

  return link;
}

function clearGallery() {
  page = 1;
  refs.gallery.innerHTML = "";
}

function showLoadMore() {
  refs.btnLoadMore.classList.remove('hidden');
}

function hideLoadMore() {
  refs.btnLoadMore.classList.add('hidden');
}