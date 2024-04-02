const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

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
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>
  `
  })
  dataPanel.innerHTML = rawHTML
}

// showMovieModal 顯示單筆電影資料函式
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

//收藏電影函式
function addToFavorite (id) {

  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  
  if (list.some((movie) => movie.id === id)){
    return alert('電影已在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

  console.log(list)
}
// 建立分頁器
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `    
    <li class="page-item" aria-current="page">
      <a class="page-link" href="#" data-page=${page}>${page}</a>
    </li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length? filteredMovies : movies
  //計算起始Index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))  // 修改這裡
  } else if (event.target.matches('.btn-add-favorite')){
    addToFavorite(Number(event.target.dataset.id))
  }
})

//監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event){
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  
  
  // if(!keyword.length){
  //   return alert('please enter a valid string')
  // }

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if(filteredMovies.length === 0){
    alert('Cannot find movies with keyword:' + keyword)
  }

  // for(const movie of movies){
  //   if (movie.title.toLowerCase().includes(keyword)){
  //     filteredMovies.push(movie)
  //   }
  // }
  //重置分頁器
  renderPaginator(filteredMovies.length)
  //預設第一頁的搜尋結果
  renderMovieList(getMoviesByPage(1))
})

// listen to paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是a標籤, 結束
  if (event.target.tagName !== 'A') return
  //透過dataset取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})


//串接API
axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

//共用資料
