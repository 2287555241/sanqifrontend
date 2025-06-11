import { ref } from 'vue'

let flag = ref(true)

const mySwitch = () => {
    const pre_box = document.querySelector('.login-pre-box')
    const img = document.querySelector("#avatar")
    if (flag.value) {
        pre_box.style.transform = "translateX(100%)"
        pre_box.style.backgroundColor = "#c9e0ed"
        // img.src = require("@/assets/img/wuwu.png")
    }
    else {
        pre_box.style.transform = "translateX(0%)"
        pre_box.style.backgroundColor = "#BEEFC2"
        // img.src = require("@/assets/img/waoku.png")
    }
    flag.value = !flag.value
}

export default mySwitch