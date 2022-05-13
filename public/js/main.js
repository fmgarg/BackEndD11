const socket = io.connect()

socket.on('mi mensaje', (data) => {
  alert(data)
  socket.emit('notificacion', 'mensaje recibido con exito')
})

let hora = new Date ()

function renderMSG(data) {
  const html = data
    .map((elem, index) => {
      return `
            <div class="container">
                  <ul class="list-inline">
                        <li class="list-inline-item"><strong class="text-primary">Author: ${elem.author}</strong><p class="text-warning">${elem.timeStamp}</p></li>
                        <li class="list-inline-item font-italic text-success"><em>${elem.text}</em></li> 
                  </ul>
            </div>
            `
    })
    .join(' ')
  document.getElementById('mensajes').innerHTML = html
}

socket.on('messages', function (data) {
  renderMSG(data)
})

function addMessage(e) {
  const mensaje = {
    author: document.getElementById('username').value,
    text: document.getElementById('texto').value,
    timeStamp: hora.toString(),
  }
  socket.emit('new-message', mensaje)
  return false
}

function renderProductos(data) {
  const html = data
    .map((elem, index) => {
      return `                    
                    <div class="card rounded-3 mb-4">
                              <div class="card-body p-4">
                                  <div class="row d-flex justify-content-between align-items-center">
                                  <div class="col-md-2 col-lg-2 col-xl-2">
                                      <img src="${elem.src}" alt="se esperaba una imagen"
                                      class="img-fluid rounded-3">
                                  </div>
                                  <div class="col-md-3 col-lg-3 col-xl-3">
                                      <p class="lead fw-normal mb-2">${elem.title}</p>
                                  </div>
          
                                  <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                                      <h5 class="mb-0">${elem.price}</h5>
                                  </div>
                                  <div class="col-md-1 col-lg-1 col-xl-1 text-end">
                                      <a href="#!" class="text-danger"><i class="fas fa-trash fa-lg"></i></a>
                                  </div>
                                  </div>
                              </div>
                    </div>
            `
    })
    .join(' ')
  document.getElementById('tabla-eventos').innerHTML = html
}

socket.on('socketProductos', function (data) {
  renderProductos(data)
})

function addProduct(e) {
  const newProduct = {
    title: document.getElementById('title').value,
    price: document.getElementById('price').value,
    src: document.getElementById('src').value,
    timeStamp: hora.toString(),
  }
  socket.emit('nuevo-producto', newProduct)
  return false
}

socket.on('socketUser', function (data) {
  renderUser(data)
})

function renderUser(data) {
  const html = data
    .map((elem, index) => {
      return `
            <h1 class="heading">${elem.user}</h1>
            `
    })
    .join(' ')
  document.getElementById('tabla-user').innerHTML = html
}