<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'
import { ref, onMounted } from 'vue'
import html2canvas from 'html2canvas'
import Cropper from 'cropperjs'

let lastScreenshoot = null
let selection: any = document.querySelector('selection')
let canvas: HTMLCanvasElement = document.createElement('canvas')
let ctx:any = null
let selecting = false
let started: Array<number> = [] // coordinates of first selection point
let ended: Array<number> = [] // coordinates of last selection point

let converted_text = ref('')


// ------------------- //
//   Event Listeners   //
// ------------------- //

// when user start selecting
document.addEventListener("mousedown", (e) => {
  selecting = true
  const {x, y } = getCordd(canvas, e)
  started = [x,y]
})


// when started selection start resizing canvas context
document.addEventListener("mousemove", (e) => {

  if(selecting) {
    const {x, y } = getCordd(canvas, e)
  ended = [x,y]

  const {width, height} = ckeckSelectionSizes()
  createSelectionDiv(x, y, width, height) // refresh selection on mouse move

  }
})
// when user release click..
document.addEventListener("mouseup", (e) => {
  selecting = false
  
  let {x, y } = getCordd(canvas, e)
  const {width, height} = ckeckSelectionSizes() 

  ctx.clearRect(0, 0, 1000, 1000); // clear Rect before displaying Media. Othervise selection is covering selection context
  getDisplayMedia(width, height, x, y)
 
})

// ------------------- //
//      Functions      //
// ------------------- //


// Getting mouse cordinates
const getCordd = (canvas:any, ev: any) => {
  const rect = canvas.getBoundingClientRect()
  const x = ev.clientX - rect.left
  const y = ev.clientY - rect.top

  let poss = document.getElementById("poss") // sa
  if (poss)
    poss.innerHTML = "Position X = " + x + " Position Y = " + y

  return {x, y}
}

// taking sizes 
const ckeckSelectionSizes = () => {  
  let width = started[0] - ended[0]
  let height = started[1] - ended[1]
  
  return {width, height}
}

const createSelectionDiv = (x: number, y: number, width:number, height:number) => {
  
  const canvas = document.querySelector("#canvas") as HTMLCanvasElement | null
  selection = document.querySelector("#selection")
  
  if(canvas) {
    
    canvas.height = window.innerHeight
    canvas.width = window.innerWidth
    ctx = canvas.getContext("2d")
    //selection.display = 'none'
    selection.style.zIndex = -2
    selection.style.position = 'absolute'
    selection.style.left = x + "px"
    selection.style.top = y + "px"
    selection.style.width = width + "px"
    selection.style.height = height + "px"
    selection.style.backgroundColor = "transparent"

    if(ctx) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      ctx.fillRect(x, y, width, height)

    }
  } 
} // test comment

// create Screenshoot of selection, send it to backend, convert to text and save in clipboard
const getDisplayMedia =  (width: any, height: any, x:any, y:any) => {
  let img = document.createElement('img')
  let content = document.querySelector("#screenshot") as HTMLElement


  html2canvas(document.querySelector('body'), {scrollY: -window.scrollY}).then(async canvas => {


      let croppedCanvas = document.createElement('canvas'),
        croppedCanvasContext = croppedCanvas.getContext('2d');
      
      
        let width = started[0] - ended[0]
        let height = started[1] - ended[1]

        if(width<0) width = ended[0] - started[0]

        if(height<0) height = ended[1] - started[1]

        if(width === 0 || height === 0) {
          return 1
          width = 2
          height = 2
        }
      
      let left = started[0]
      let top = started[1]

      let destCanvas = document.createElement('canvas')
      destCanvas.width = width;
      destCanvas.height = height;
      // newCanvas, same size as source rect

      // correct left and top if selected to right
      if(ended[0] - started[0] <=0 || ended[1] - started[1] <= 0) top = ended[1], left = ended[0]

      destCanvas.getContext("2d").drawImage(
        canvas,
        left+10,top+40,width,height,  // source rect with content to crop
        0,0,width,height);

     
     let imageURL = destCanvas.toDataURL('image/png');
    // let imageBlob =  dataURLtoBlob(imageURL);

    //let fd = new FormData();
    //fd.append("image", imageBlob, "filename.png");

    converted_text.value = await convertImageToText(imageURL)
    
    navigator.clipboard.writeText(converted_text.value).then(() => {
    //clipboard successfully set
}, () => {
    //clipboard write failed, use fallback
});

     console.log(converted_text.value)


     img.src = imageURL
     img.id = 'screenshot-image'
     img.style.width = "100vh"
     img.style.height = "40vh"


     console.log(document.querySelector('#screenshot-image'))
     if(document.querySelector('#screenshot-image') != null) {
      document.querySelector('#screenshot-image')
      content.appendChild(img)
     }
     if(document.querySelector('#screenshot-image') == null) {
      content.appendChild(img)
     } else {
      document.querySelector('#screenshot-image').remove()
      content.appendChild(img)
     }
     
     console.log(imageURL)
    });

    
    
  }


const convertImageToText = async (image_url: string) => {
  const data_upload = JSON.stringify({
    image: image_url,
  })

  let converted_text = ''
  await fetch('http://127.0.0.1:8003/api/v1/convert', {
      method: 'POST',
      body: data_upload,
      headers: {
        "accept": "application/json",
      }
    }
  )
  .then((res) => res.json())
  .then((data) => { converted_text = data.text })

  return converted_text
}


const saveTextToCopyboard = () => {

}
</script>


<template lang="pug">

div#screenshot(class="flex flex-col")

  canvas#canvas(class="w-full h-screen fixed top-0 left-0 bg-transparent z-1000 ")
  div#selection
  <div class="flex top-0  " >
    <a href="https://vitejs.dev" target="_blank" class="w-full  h-32 flex justify-center logo">
      <img src="/vite.svg" class="" alt="Vite logo"  />
    </a>
    <a href="https://vuejs.org/" target="_blank"  class="w-full h-32 flex justify-center logo vue"  >
      <img src="./assets/vue.svg" class="w-full" alt="Vue logo"  />
    </a>


  </div>
  div#copy-shortcut(class="flex justify-start")
    div#copy(class="flex w-2/4 items-center px-1")
      div#copy-shortcut-key1(class="w-6 h-6 border-2 border-black rounded-md ")
  p#poss(class="w-full mb-3") 
  p#converted-text(class="w-full mb-10") {{converted_text}}




</template>

<style scoped>

.logo {
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
