import { ref } from 'vue'

let flag = ref(true)

const mySwitch = () => {
    console.log('执行切换函数')
    // 不再需要处理滑动动画，直接切换标签即可
    flag.value = !flag.value
    console.log('切换后 flag 状态:', flag.value)
}

// 导出flag以便在其他组件中使用
export { flag }
export default mySwitch