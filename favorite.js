const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

//產生所有電影資料HTML函式
function renderMovieList (data){
  let rawHTML = ''
  data.forEach((item) => {
    //title, image
    rawHTML += `
    <div class="col-sm-3">
  <div class="mb-2">
    <div class="card">
      <img src="${
      POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
      <div class="card-body">
        <h5 class="card-title"> ${item.title} </h5>
      </div>
     <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
        </div>
      </div>
    </div>
  </div>
  `
  })
  dataPanel.innerHTML = rawHTML
}

// 建立分頁器
function getMoviesByPage(page) {
  //計算起始Index
  const startIndex = (page-1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


// 顯示單筆電影資料函式
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

// 移除收藏清單函式
function removeFromFavorite(id) {
  if (!movies || !movies.length) return

  //透過 id 找到要刪除電影的 index
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if(movieIndex === -1) return

  //刪除該筆電影
  movies.splice(movieIndex, 1)

  //存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  //更新頁面
  renderMovieList(movies)
}



//監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))  // 修改這裡
  } else if (event.target.matches('.btn-remove-favorite')){
    removeFromFavorite(Number(event.target.dataset.id))
  }
})


renderMovieList(movies)
