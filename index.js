const DISPLAY_STATE = {
  ListDisplay: 'ListDisplay',
  CardDisplay: 'CardDisplay'
}

const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const displayStyleBtn = document.querySelector('#style-display-btn')

let currentPage = 1

const model = {
  movies: [],
  filteredMovies: []
}

const view = {
  //產生所有電影資料HTML函式
  renderMovieList (data){
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
  },

  //條列式電影資料
  renderMovieListByList (data){
    let rawHTML = ''
    data.forEach((item) => {
    //title, image
      rawHTML += `
      <ul class="list-group list-group-horizontal-xxl ">
        <li class="list-group-item list ">${item.title}
        <div>
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>     
        </div>
        </li>
      </ul>
  `
  })
  dataPanel.innerHTML = rawHTML
},
// showMovieModal 顯示單筆電影資料函式
showMovieModal(id) {
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
},
//收藏電影函式
addToFavorite (id) {

  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = model.movies.find((movie) => movie.id === id)
  
  if (list.some((movie) => movie.id === id)){
    return alert('電影已在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

  console.log(list)
},
// 建立分頁器
renderPaginator(amount) {
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
},
getMoviesByPage(page) {
  const data = model.filteredMovies.length? model.filteredMovies : model.movies
  //計算起始Index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

}

const controller = {
  currentState: DISPLAY_STATE.CardDisplay,
  // generateCards(page){
  //   view.renderMovieList(view.getMoviesByPage(page))
  // },
  generatePaginator(amount){
    view.renderPaginator(amount)
    
  },
  // generateList(page){
  //   view.renderMovieListByList(view.getMoviesByPage(page))
  // },
  displayMoviesByStyle(page){
    switch(this.currentState) {
      case DISPLAY_STATE.CardDisplay:
        view.renderMovieList(view.getMoviesByPage(page))
        break
      case DISPLAY_STATE.ListDisplay:
        view.renderMovieListByList(view.getMoviesByPage(page))
    } 
  }
}

//監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    view.showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')){
    view.addToFavorite(Number(event.target.dataset.id))
  }
})

//監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  model.filteredMovies = model.movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if(model.filteredMovies.length === 0){
    alert('Cannot find movies with keyword:' + keyword)
  }

  //重置分頁器
  controller.generatePaginator(model.filteredMovies.length)
  // view.renderPaginator(filteredMovies.length)
  //預設第一頁的搜尋結果
  controller.generateCards(1)
})

// listen to paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是a標籤, 結束
  if (event.target.tagName !== 'A') return
  //透過dataset取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  controller.displayMoviesByStyle(page)
  if(localStorage.getItem('getPage') !== 0) {
    localStorage.removeItem('getPage')
  }
  localStorage.setItem('getPage', JSON.stringify(page))
})



//listen to displayStyleBtn
displayStyleBtn.addEventListener('click', function onclick(event) {
  currentPage = Number(localStorage.getItem('getPage'))
  if (event.target.matches('.list-btn')) {
    controller.currentState = DISPLAY_STATE.ListDisplay
    controller.displayMoviesByStyle(currentPage)
    console.log(controller.currentState)
  } else if (event.target.matches('.card-btn')) {
    controller.currentState = DISPLAY_STATE.CardDisplay
    controller.displayMoviesByStyle(currentPage)
    
  }
})


//串接API
axios
.get(INDEX_URL) // 修改這裡
.then((response) => {
  model.movies.push(...response.data.results)
  controller.generatePaginator(model.movies.length)
  controller.displayMoviesByStyle(1)
})
.catch((err) => console.log(err))