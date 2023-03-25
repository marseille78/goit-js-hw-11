import axios from 'axios';

const API_KEY = '15123104-3b821bb91bdfb6ca9429ae7b9';

export default class {
  BASE_URL = 'https://pixabay.com/api/';
  OPTS = 'image_type=photo&orientation=horizontal&safesearch=true&per_page=40';

  async getResource(req, page) {
    const url = `${this.BASE_URL}?key=${API_KEY}&q=${req}&${this.OPTS}&page=${page}`;
    const res = await axios.get(url);
    return this.transformResponse(res.data.hits);
  }

  transformResponse(res) {
    return res.map(item => {
      return {
        webformatURL: item.webformatURL,
        largeImageURL: item.largeImageURL,
        tags: item.tags,
        likes: item.likes,
        views: item.views,
        comments: item.comments,
        downloads: item.downloads,
      };
    });
  }
}