export default {
  mounted(el) {
    setTimeout(() => {
      const dialogHeaderEl = el.querySelector('.el-dialog__header');
      const dragDom = el.querySelector('.el-dialog');
      if (!dialogHeaderEl || !dragDom) return;
      dialogHeaderEl.style.cursor = 'move';
      dialogHeaderEl.onmousedown = (e) => {
        const disX = e.clientX - dragDom.offsetLeft;
        const disY = e.clientY - dragDom.offsetTop;
        document.onmousemove = function (e) {
          const l = e.clientX - disX;
          const t = e.clientY - disY;
          dragDom.style.left = `${l}px`;
          dragDom.style.top = `${t}px`;
          dragDom.style.margin = 0;
          dragDom.style.position = 'fixed';
        };
        document.onmouseup = function () {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }, 0);
  }
} 