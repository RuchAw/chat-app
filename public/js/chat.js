const socket= io()

// Elements

const $messageForm = document.querySelector("#messageForm")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocation = document.querySelector("#sendLocation")
const $messages = document.querySelector("#messages")

// Templates

const messageTemplate = document.querySelector("#message-template").innerHTML
const messageLocationTemplate= document.querySelector("#messageLocation-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// Options

const {username, room}= Qs.parse(location.search, { ignoreQueryPrefix: true })


const message=document.querySelector("#message")


$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute("disabled","disabled")
    
    const message = e.target.elements.message.value

    socket.emit("sendMessage",message, (error)=>{
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value = ""
        $messageFormInput.focus()
        if (error){
            return console.log(error)
        }

        console.log("Message delivered")
    })
})


const autoscroll = ()=>{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset+1){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on("message",(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format("hh:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on("locationMessage",(url)=>{
    console.log(url)
    const html = Mustache.render(messageLocationTemplate,{
        username: url.username,
        url : url.url,
        createdAt : moment(url.createdAt).format("hh:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on("roomData",({room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})

$sendLocation.addEventListener("click",()=>{

    if(!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser")
    }

    $sendLocation.setAttribute("disabled","disabled")

    navigator.geolocation.getCurrentPosition((position)=>{
        $sendLocation.removeAttribute("disabled")
        socket.emit("sendLocation",
        {latitude: position.coords.latitude, longitude: position.coords.longitude},()=>{
            console.log("location shared")
        })
    })

    
})


socket.emit('join', {username, room},(error)=>{
    if (error){
        alert(error)
        location.href = "/"
    }
})

