import $ from 'jquery'
import request from 'superagent'
window.$ = $

var genres = (function () {
  var genres = null
  $.ajax({
    'async': false,
    'global': false,
    'url': 'https://api.myjson.com/bins/a8icy',
    'dataType': 'json',
    'success': function (data) {
      genres = data
    }
  })
  return genres
})()

const URL = `https://itunes.apple.com/search?term=`
console.log('page reloaded')

$(document).ready(function () {
  genreMaker()
  getTop()
  $('#search').submit(function (event) {
    event.preventDefault()
    const tent = $(this).serializeArray()
    this.reset()
    const querytype = tent[0].value
    const queryvalue = tent[1].value
    const searchterm = queryvalue.toLowerCase().replace(/\s+/g, '+')
    switch (querytype) {
      case 'search':
        console.log('general search')
        basicSearch(searchterm)
        break
      case 'artist':
        console.log('artist called')
        artistSearch(searchterm)
        break
      case 'album':
        albumSearch(searchterm)
        console.log('album called')
        break
    }
  })

  $('#hits').change(function (event) {
    event.preventDefault()
    const genreCode = $('#hits option:selected').val()
    if (genreCode === 'default') {} else {
      getTopGenre(genreCode)
    }
  })
  $('.icon').click(function (event) {
    event.preventDefault()
  })
})

function basicSearch (query) {
  request.get(URL + query + `&media=music&limit=30`)
    .then(function (response) {
      const responseObject = JSON.parse(response.text)
      galleryHtml(responseObject.results)
    })
}

function artistSearch (query) {
  request.get(URL + query + `&entity=song&attribute=allArtistTerm&limit=30`)
    .then(function (response) {
      const responseObject = JSON.parse(response.text)
      galleryHtml(responseObject.results)
    })
}

function albumSearch (query) {
  let album
  request.get(URL + query + `&entity=album&limit=1`)
    .then(function (response) {
      const responseObject = JSON.parse(response.text)
      let theArray = responseObject.results
      let resultObject = theArray[0]
      album = resultObject.collectionId
      console.log(album)
    })
  setTimeout(function () {
    request.get(`https://itunes.apple.com/lookup?id=${album}&entity=song`)
      .then(function (response) {
        const albumObject = JSON.parse(response.text)
        const albumArray = albumObject.results
        const albumSongs = albumArray.slice(1)
        galleryHtml(albumSongs)
      })
  }, 100)
}

function genreMaker () {
  console.log('genremade')
  const subgenres = genres['34'].subgenres
  const genreList = Array.from(Object.values(subgenres))
  let genreDropHTML = []
  for (var x = 0; x < genreList.length; x++) {
    let entry = genreList[x]
    let genreName = entry.name
    let genreId = entry.id
    genreDropHTML.push(
      `<option value=${genreId}>${genreName}</option>`
    )
  }
  $('#search__hits').html(genreDropHTML.join(''))
}

function galleryHtml (responseObject) {
  const htmlArray = []
  for (var i = 0; i < responseObject.length; i++) {
    const element = responseObject[i]
    const artist = element.artistName
    const artistid = element.artistId
    const title = element.trackName
    const album = element.collectionName
    const image = element.artworkUrl100
    const preview = element.previewUrl
    htmlArray.push(
      `<a class="artist_spot" id=${preview} href="#">
          <img class="image thumb" src='${image}'>` +
      addDropArrow('h4', title, 'title') +
      addDropArrow('h5', album, 'album') +
      addDropArrow('h5', artist, artistid) +
      `</a>`
    )
  }
  $('.grid').html(htmlArray.join(''))
  $('a,.artist_spot').click(function (event) {
    event.preventDefault()
    console.log('!')
    let songURL = this.id
    if ($(this).hasClass('expanded')) {
      $(this).removeClass('expanded')
      $(this).children('.arrow').removeClass('noarrow')
    } else if ($(this).children().is('.arrow')) {
      $(this).addClass('expanded')
      $(this).children('.arrow').addClass('noarrow')
    } else {}
    $('.dammit').attr('src', songURL)
    $('#musicplayer').trigger('load').trigger('play')
  })
}

function getTopGenre (x) {
  request.get(`https://itunes.apple.com/us/rss/topsongs/limit=20/genre=${x}/json`)
    .then(function (response) {
      const responseObject = JSON.parse(response.text)
      let theArray = responseObject.feed.entry
      genreHtml(theArray)
    })
}

function genreHtml (responsearray) {
  const genreArray = []
  for (var x = 0; x < responsearray.length; x++) {
    var entry = responsearray[x]
    let topArtistname = entry['im:artist'].label
    let topArtistId = entry.id.attributes['im:id']
    let topAlbumName = entry['im:collection']['im:name'].label
    let topSongname = entry['im:name'].label
    let topImageUrl1 = entry['im:image']
    let topImageUrl2 = topImageUrl1[2].label
    let topSRCsong = entry.link[1].attributes.href
    genreArray.push(
      `<a class="artist_spot" id=${topSRCsong} href="#">
          <img class="image thumb" src='${topImageUrl2}'>` +
      addDropArrow('h4', topSongname, 'title') +
      addDropArrow('h5', topAlbumName, 'album') +
      addDropArrow('h5', topArtistname, topArtistId) +
      `</a>`
    )
  }
  $('.grid').html(genreArray.join(''))
  $('a,.artist_spot').click(function (event) {
    event.preventDefault()
    let songURL = this.id
    if ($(this).hasClass('expanded')) {
      $(this).removeClass('expanded')
      $(this).children('.arrow').removeClass('noarrow')
    } else if ($(this).children().is('.arrow')) {
      $(this).addClass('expanded')
      $(this).children('.arrow').addClass('noarrow')
    } else {}
    $('.dammit').attr('src', songURL)
    $('#musicplayer').trigger('load').trigger('play')
  })
}

function addDropArrow (heading, text, type) {
  var testlength = text.replace(/\W+/g, '')
  if (testlength.length > 20) {
    return `<${heading} class="labels arrow" name=${type}>${text}</${heading}>`
  } else {
    return `<${heading} class="labels" name=${type}>${text}</${heading}>`
  }
}

function getTop () {
  request.get('https://itunes.apple.com/us/rss/topsongs/limit=24/json')
    .then(function (response) {
      const responseObject = JSON.parse(response.text)
      let theArray = responseObject.feed.entry
      genreHtml(theArray)
    })
}
