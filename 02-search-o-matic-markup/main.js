// 29656d74
//await - каждое поле в async асинхронно? - иначе, что прерывает await
//убирать allcards при нажатии на крестик
window.onload = () => {
  const CardFactory = {
    buildDefault: () => {
      const card = document.createElement('div')
      card.classList.add('card')
      card.innerHTML = '<div class="card-line1"></div><div class="card-line2"></div>'
      return card
    },
    buildImage: (img) => {
      const card = document.createElement('div')
      img.classList.add('card')
      card.appendChild(img)
      return card
    },
    buildText: (header, line1, line2) => {
      const card = document.createElement('div')
      card.classList.add('card')
      card.innerHTML = 
      `
      <div class="text-line1">${header}</div>
      <div class="text-line-flex">
      <div class="text-line2"></div>
      <div class="text-line-year">${line2}</div>
      `
      return card
    }
  }

  const searchForm = document.getElementsByClassName('search')[0]
  const searchField = document.getElementsByClassName('search-input')[0]
  const cross = document.getElementsByClassName('cancel-button')[0]
  const searchResult = document.getElementById('search-result')

  const removeChilds = anchor => {
    while (anchor.children.length != 0)
      anchor.removeChild(anchor.children[0])
  }

  const populateCards = (data) => {
    let anchor = document.getElementById('allcards')
    removeChilds(anchor)
    const howManyToShow = Math.min(data.Search.length, 8)

    for (let i = 0; i != howManyToShow; ++i) {
      const myCard = CardFactory.buildText(data.Search[i].Title, data.Search[i].Type, data.Search[i].Year)
      anchor.appendChild(myCard)

      const img = document.createElement('img')
      img.src = data.Search[i].Poster
      img.onload = () => {
        anchor.replaceChild(
          CardFactory.buildImage(img), myCard
        )
      }
    }
  }

  let lastReqTime = 0

  const inputHandler = async () => {
    if (searchField.value.length > 0) {
      const diff = 1000 
      const curReqTime = new Date().getTime()
      let data = {}
      if (curReqTime - lastReqTime > diff) { 
        data = await fetch(
          `http://www.omdbapi.com/?type=movie&apikey=29656d74&s=${searchField.value}`
        ).then((r) => r.json());
        console.log(data)
        lastReqTime = curReqTime
      }
      if (!cross.classList.contains('cancel-button-active'))
        cross.classList.toggle('cancel-button-active')
      
      if (data.hasOwnProperty('totalResults')) {
        searchResult.innerText = `Нашли ${data.totalResults} фильма`
        populateCards(data) // TODO:
      } else {
        removeChilds(document.getElementById('allcards'))
        searchResult.innerText = 'Мы не поняли о чем речь ¯\\_(ツ)_/¯ '
      }
    } else {
      cross.classList.remove('cancel-button-active')
      removeChilds(document.getElementById('allcards'))
      searchResult.innerText = ''
    }
  }

  searchField.addEventListener('focusin', () => {
    if (searchField.value.length == 0) {
      searchForm.classList.toggle('search-active')
    }
  })
  searchField.addEventListener('focusout', () => {
    if (searchField.value.length == 0) {
      searchForm.classList.toggle('search-active')
      inputHandler()
    }
  })

  searchField.addEventListener('input', inputHandler)
  
  // cross.onclick = () => {

  // }

  document.addEventListener('scroll', () => {
    if (searchForm.getBoundingClientRect().top < 10) {
      // searchForm.classList.add('search-expanded')
      searchForm.id = 'search-expanded'
    } else {
      searchForm.id = ''
      // searchForm.classList.remove('search-expanded')
    }
  })
}