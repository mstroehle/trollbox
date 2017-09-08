(function (root) {
  'use strict'

  function Trollbox (config) {
    const scriptId = 'FirebaseScript'
    if (document.querySelector(`#${scriptId}`)) {
      onLoad(config)
    } else {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://www.gstatic.com/firebasejs/4.3.1/firebase.js'
      document.body.appendChild(script)
      script.onload = () => onLoad(config)
    }

    /*
    const style = document.createElement('link')
    style.id = 'TrollboxStyle'
    style.rel = 'stylesheet'
    style.href = 'trollbox.css'
    document.body.appendChild(style)
    */
  }

  function onLoad (config) {
    const user = config.user || 'anon'
    const ref = initFirebase(config)
    renderBox(config.container)

    const post = (message) => {
      ref.push().set({
        user,
        message,
        date: (Date.now() / 1e3) | 0
      })
    }

    bindForm(post)

    const onMessage = (snapshot) => {
      const value = snapshot.val()

      if (typeof value !== 'object') {
        return false
      }

      addLog(value.user, value.message)
    }

    ref.limitToFirst(100).on('child_added', onMessage)
  }

  function initFirebase (config) {
    let room = config.room || ''
    room = room.replace(/[^a-zA-Z\d]/, '_')

    const app = window.firebase.initializeApp(config.firebase)
    const db = app.database()
    const ref = db.ref(`trollbox/${room}`)

    return ref
  }

  function renderBox (selector) {
    const container = document.querySelector(selector)

    // quick and dirty
    container.innerHTML = `
      <div class="TrollboxContainer">
        <div class="TrollboxHeader">
          Trollbox
        </div>
        <div class="TrollboxMessages">
          <ul class="TrollboxMessagesList">
          </ul>
        </div>
        <div class="TrollboxMessage">
          <form class="TrollboxForm">
            <input class="TrollboxInput" type="text" name="message" placeholder="Message (press enter to submit)" autocomplete="off" />
          </form>
        </div>
      </div>
    `
  }

  function bindForm (postFn) {
    const form = document.querySelector('.TrollboxForm')

    form.addEventListener('submit', event => {
      event.preventDefault()
      const input = event.target.message
      const message = input.value
      postFn(message)
      input.value = ''
    })
  }

  function addLog (user, message) {
    if (!(user && message)) {
      return false
    }

    const container = document.querySelector('.TrollboxMessages')
    const list = container.querySelector('.TrollboxMessagesList')

    list.innerHTML += `<li><strong>${escapeHtml(user)}:</strong> ${escapeHtml(message)}</li>`

    container.scrollTop = container.scrollHeight
  }

  function escapeHtml (unsafe) {
    return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&quot;')
    .replace(/'/g, '&#039;')
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Trollbox
    }
    exports.Trollbox = Trollbox
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return Trollbox
    })
  } else {
    root.Trollbox = Trollbox
  }

})(this);