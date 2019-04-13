const myApiKey = '29656d74'

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

  const loader = document.createElement('img')
  loader.classList.add('loader')
  loader.src = 'loader.svg'
  let isLoaderActive = false

  function removeLoader() {
    if (isLoaderActive) {
      content.removeChild(loader)
      isLoaderActive = false
    }
  }

  const searchForm = document.getElementsByClassName('search')[0]
  const searchField = document.getElementsByClassName('search-input')[0]
  const cross = document.getElementsByClassName('cancel-button')[0]
  const searchResult = document.getElementById('search-result')
  const tagForm = document.getElementsByClassName('alltags')[0]
  const content = document.getElementsByClassName('content')[0]
  const tagList = []

  const removeChildren = anchor => {
    while (anchor.children.length != 0)
      anchor.removeChild(anchor.children[0])
  }

  const populateCards = (data) => {
    let anchor = document.getElementById('allcards')
    removeChildren(anchor)
    const howManyToShow = Math.min(data.Search.length, 8)

    for (let i = 0; i != howManyToShow; ++i) {
      const myCard = CardFactory.buildText(data.Search[i].Title, data.Search[i].Type, data.Search[i].Year)
      anchor.appendChild(myCard)

      const img = document.createElement('img')
      img.src = data.Search[i].Poster
      img.onload = () => {
        if (anchor.contains(myCard)) {
          anchor.replaceChild(CardFactory.buildImage(img), myCard)
        }
      }
    }
  }

  let lastReq = ''

  function debounce(f) {

    let timer = null;
  
    return function(ms, ...args) {
      ms = 1800


      if (!cross.classList.contains('cancel-button-active')) {
        cross.classList.toggle('cancel-button-active')
      }

      console.log(searchField.value, lastReq)
      if (!isLoaderActive && searchField.value !== lastReq && searchField.value.length > 0) {
        content.insertBefore(loader, searchResult)
        isLoaderActive = true
        removeChildren(document.getElementById('allcards'))
        searchResult.innerText = ''
      }

      if (searchField.value === lastReq) {
        removeLoader()
      }

      const onComplete = () => {
        f.apply(this, args);
        timer = null;
      }
  
      if (timer) {
        clearTimeout(timer);
      }
  
      timer = setTimeout(onComplete, ms);
    };
  }

  function tagHandler(curSearch) {
    if (tagList.indexOf(curSearch) === -1) {
      const tag = document.createElement('a')
      tag.classList.add('tag')
      tag.innerHTML = curSearch
      tagForm.insertBefore(tag, tagForm.children[0])
      tag.onmousedown = function(event) { 
        if (event.altKey) {
          tagForm.removeChild(this)
          tagList.splice(tagList.indexOf(this.innerHTML), 1)
        } else {
          console.log(this.innerHTML)
          searchField.curSearch = this.innerHTML
          inputHandler()
        }
      }
      tagList.unshift(searchField.curSearch)
    }
  }

  const inputHandler = debounce(async () => {

    if (searchField.value === lastReq) {
      removeLoader()
      return
    }

    if (searchField.value.length > 0) {
      let data = {}
      let currentSearch = searchField.value
      
      lastReq = searchField.value

      console.log('Search:', searchField.value)
      
      data = await fetch(
        `http://www.omdbapi.com/?type=movie&apikey=${myApiKey}&s=${searchField.value}`
      )
      .then((r) => r.json())
      .catch(() => {
        removeLoader()
        removeChildren(document.getElementById('allcards'))
        searchResult.innerText = 'Something went wrong ¯\\_(ツ)_/¯ '
        throw "Something went wrong in fetch"
      });

      console.log(data)

      removeLoader()
      
      if (data.hasOwnProperty('totalResults')) {
        searchResult.innerText = `${data.totalResults} film results`
        populateCards(data)
        tagHandler(currentSearch)
      } else if (data['Error'] === 'Too many results.') { 
        removeChildren(document.getElementById('allcards'))
        searchResult.innerText = 'Too many results ¯\\_(ツ)_/¯ '
      } else {
        removeChildren(document.getElementById('allcards'))
        searchResult.innerText = 'Movie did not found ¯\\_(ツ)_/¯ '
      }
    } else {
      removeLoader()
      lasReq = ''
      cross.classList.remove('cancel-button-active')
      removeChildren(document.getElementById('allcards'))
      searchResult.innerText = ''
    }
  })

  searchField.addEventListener('focusin', () => {
    if (searchField.value.length == 0 && !searchForm.classList.contains('search-active')) {
      searchForm.classList.toggle('search-active')
    }
  })
  searchField.addEventListener('focusout', () => {
    if (searchField.value.length == 0 && searchForm.classList.contains('search-active')) {
      searchForm.classList.toggle('search-active')
    }
  })

  searchField.addEventListener('input', inputHandler)
  
  cross.onclick = () => {
    searchField.value = ''
    searchField.focus()
    searchField.select()
    inputHandler()  // zero waiting
  }

  searchField.onkeyup = (event) => {
    if (event.keyCode === 13) {
      inputHandler()  // zero waiting
    }
  }

  document.addEventListener('scroll', () => {
    if (searchForm.getBoundingClientRect().top < 10) {
      searchForm.id = 'search-expanded'
    } else {
      searchForm.id = ''
    }
  })
}