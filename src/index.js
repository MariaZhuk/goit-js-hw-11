import Notiflix from 'notiflix';
import 'slim-select/dist/slimselect.css';
import axios from "axios";
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";


axios.defaults.baseURL = 'https://pixabay.com/api/';

const API_KEY = '38547219-ca9a4f13669ea8d7ead35f186';
const IMAGE_TYPE = 'photo';
const IMG_ORIENTATION = 'horizontal';
const SAFE_SEARCH = true;
const NUMBER_OF_IMAGE = 40;

let countOfPage = 1;
let inputValue = null;
let totalHits = null;

const elements = {
    formEL: document.querySelector(".search-form"),
    galleryEl: document.querySelector(".gallery"),
    btnMoreEl: document.querySelector(".load-more"),
    endMassageEl: document.querySelector(".end-message"),
}

const gallery = new SimpleLightbox('.gallery .photo-card a', {
  captionsData: 'alt',
  // captionPosition: 'bottom',
  captionDelay: 250,
});

elements.endMassageEl.classList.toggle("hidden");
elements.btnMoreEl.classList.toggle("hidden"); 
elements.formEL.addEventListener("submit", handlerSearch);
elements.btnMoreEl.addEventListener('click', showMoreImageOnClick);

async function serverSearchImage(inputValue, countOfPage) {
  const response = await axios.get(`?key=${API_KEY}&q=
  ${inputValue}&image_type=${IMAGE_TYPE}&orientation=${IMG_ORIENTATION}&
  safesearch=${SAFE_SEARCH}&per_page=${NUMBER_OF_IMAGE}&page=${countOfPage}`);
    const imagesInfo = await response.data;
    return imagesInfo;
}


// функція пошуку
async function handlerSearch(evt) {
    evt.preventDefault();
    countOfPage = 1;
    inputValue = evt.target.elements[0].value.trim();
   
    if (inputValue === '') {
        return Notiflix.Notify.failure('Sorry, the search must not be empty');
    }
    try {
        const data = await serverSearchImage(inputValue, countOfPage);
        totalHits = data.totalHits;
      
        if (!data.hits.length) {
            elements.galleryEl.innerHTML = '';
            Notiflix.Notify.failure(
                'Sorry, there are no images matching your search query. Please try again.'
            );
        } else {
            elements.btnMoreEl.classList.remove('hidden');
            elements.endMassageEl.classList.add('hidden');
            Notiflix.Notify.success(`"Hooray! We found ${totalHits} images."`);
            elements.galleryEl.innerHTML = '';
            const markupArr = data.hits.map(item => {
                return renderMarkup(
                    item.webformatURL,
                    item.largeImageURL,
                    item.tags,
                    item.views,
                    item.likes,
                    item.comments,
                    item.downloads
                );
            });
            elements.galleryEl.innerHTML = markupArr.join('');
           
            if (totalHits <= NUMBER_OF_IMAGE) {
                elements.btnMoreEl.classList.add('hidden');
                elements.endMassageEl.classList.remove('hidden');
            }
        }
       gallery.refresh()
    } catch (error) {
        Notiflix.Notify.failure(`Sorry, ${error.message}`);
    }
}    

function renderMarkup(
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads
) {
  elements.btnMoreEl.classList.toggle('hidden');
  return `<div class="photo-card">
  <a href="${largeImageURL}">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" width="100%" height="300" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>`;
}

//функція показу додаткових фото
async function showMoreImageOnClick() {
  countOfPage += 1;
  try {
    const data = await serverSearchImage(inputValue, countOfPage);
    elements.btnMoreEl.classList.toggle('hidden');
    totalHits -= NUMBER_OF_IMAGE;
    if (totalHits <= NUMBER_OF_IMAGE) {
      elements.btnMoreEl.classList.add('hidden');
      elements.endMassageEl.classList.remove('hidden');
    }
    const markupArr = data.hits.map(item => {
      return renderMarkup(
        item.webformatURL,
        item.largeImageURL,
        item.tags,
        item.views,
        item.likes,
        item.comments,
        item.downloads
      );
    });
    elements.galleryEl.insertAdjacentHTML('beforeend', markupArr.join(''));
    gallery.refresh();
    elements.btnMoreEl.classList.toggle('hidden');
  } catch (error) {
    Notiflix.Notify.failure(`Sorry, ${error.message}`);
  }
}
