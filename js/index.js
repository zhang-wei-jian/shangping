window.addEventListener('DOMContentLoaded', function () {
  initCrumbs()
  leftTabClick()
  bottomTabClick()
  zoom()
  thumb()
  thumbClick()
  goodsBaseInfo()
  goodsParamsInfo()
  goodsParamsClick()
  inputChangePrice()
  fixedMenuClick()
  personMenu()
})

var imgIndex = 0 // 记录单击的缩略图的下标

// 初始化面包屑导航数据
function initCrumbs() {
  var crumbsData = goodData.path
  var htmlStr = ''
  crumbsData.forEach(function (item, index) {
    // 最后一项不需要给a链接设置href属性
    if (index !== crumbsData.length - 1) {
      htmlStr += `<a href='${item.url}'>${item.title}</a>`
    } else {
      // 最后一项
      htmlStr += `<a>${item.title}</a>`
    }
  })
  // 把内容作为class=conPoin的内容
  var crumbEle = document.querySelector('.con .conPoin')
  crumbEle.innerHTML = htmlStr
}

// 给左边的选修卡绑定事件
function leftTabClick() {
  var tabs = document.querySelectorAll(
    '.wrap .productDetail .aside .tabWrap h4'
  )
  // 将伪数组转为真数组
  tabs = Array.from(tabs)
  tabs.forEach(function (item, index) {
    item.onclick = function () {
      // 给当前选项添加类名active,兄弟元素要移除
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active')
      }
      this.classList.add('active')

      // 给对应内容的div添加active,兄弟要移除
      var contents = document.querySelectorAll(
        '.wrap .productDetail .aside .tabContent > div'
      )
      for (var j = 0; j < tabs.length; j++) {
        contents[j].classList.remove('active')
      }
      contents[index].classList.add('active')
    }
  })
}

// 给底部选修卡绑定事件
function bottomTabClick() {
  var tabs = document.querySelectorAll(
    '.wrap .productDetail .detail .intro .tabWrap li'
  )
  Array.from(tabs).forEach(function (item, index) {
    item.onclick = function () {
      // 给当前单击项添加active,兄弟要移除
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active')
      }
      this.classList.add('active')

      // 找到对应下标的div添加类名active，兄弟移除
      var contents = document.querySelectorAll(
        '.wrap .productDetail .detail .intro .tabContent > div'
      )
      for (var j = 0; j < contents.length; j++) {
        contents[j].classList.remove('active')
      }
      contents[index].classList.add('active')
    }
  })
}

// 实现放大镜效果
function zoom() {
  /**
   * 思路：
   * 1. 动态创建第一张图片（img）,追加到小图容器里面
   * 2. 给小图容器绑定鼠标悬浮事件，移动，离开
   */
  // 缓存节点
  var smallImgBox = document.querySelector(
    '.wrap .con .mainCon .previewWrap .preview .zoom'
  )
  var preview = document.querySelector(
    '.wrap .con .mainCon .previewWrap .preview'
  )
  // 1. 动态创建第一张图片（img）,追加到小图容器里面
  var smallImg = new Image()
  smallImg.src = goodData.imgsrc[0].s
  smallImgBox.appendChild(smallImg)
  // 2. 给小图容器绑定鼠标悬浮事件(onmouseover,onmouseenter)，移动，离开
  // 记录遮盖、大图容器、大图片的变量（抽离出来，避免产生过多的闭包变量，造成内存泄漏）
  var mask = null
  var bigImgBox = null
  var bigImg = null
  smallImgBox.onmouseenter = function () {
    // 创建遮盖
    mask = document.createElement('div')
    mask.className = 'mask'
    // 创建大图容器
    bigImgBox = document.createElement('div')
    bigImgBox.className = 'bigBox'
    // 创建大图片
    bigImg = new Image()
    bigImg.src = goodData.imgsrc[imgIndex].b

    // 追加到DOM树（上树）
    smallImgBox.appendChild(mask)
    bigImgBox.appendChild(bigImg)
    preview.appendChild(bigImgBox)

    // 给小图容器绑定移动事件
    smallImgBox.onmousemove = function (e) {
      e = e || window.e
      // e.clientX:相对于浏览器客户端x坐标
      // e.pageX:相对于文档所在x坐标

      // 遮盖left = 基于客户端的x坐标 - 遮盖宽度一半 - 减去小图片盒子距离视口的高度
      var maskLeft =
        e.clientX -
        mask.offsetWidth / 2 -
        smallImgBox.getBoundingClientRect().left

      var maskTop =
        e.clientY -
        mask.offsetHeight / 2 -
        smallImgBox.getBoundingClientRect().top

      // 获取遮盖最大的移动距离left：小图片容器宽度 - 遮盖宽度
      var maskMaxMoveLeft = smallImgBox.clientWidth - mask.offsetWidth
      var maskMaxMoveTop = smallImgBox.clientHeight - mask.offsetHeight

      // 限制遮盖移动位置
      if (maskLeft > maskMaxMoveLeft) {
        // 限制不能出右边
        maskLeft = maskMaxMoveLeft
      } else if (maskLeft < 0) {
        // 限制不能出左边
        maskLeft = 0
      }

      if (maskTop > maskMaxMoveTop) {
        // 限制不能出下边
        maskTop = maskMaxMoveTop
      } else if (maskTop < 0) {
        // 限制不能出上边
        maskTop = 0
      }

      mask.style.left = maskLeft + 'px'
      mask.style.top = maskTop + 'px'

      // 控制大图的移动
      // 比例关系： 遮盖的移动距离 / 遮盖最大的移动距离 = 大图的移动距离(未知) / 大图最大的移动距离（未知）
      // 大图最大的移动距离left = 大图宽度 - 大盒的宽度
      var bigImgMaxLeft = bigImg.clientWidth - bigImgBox.offsetWidth
      // 大图最大的移动距离top = 大图高度 - 大盒的高度
      var bigImgMaxTop = bigImg.clientHeight - bigImgBox.offsetHeight

      // 大图的移动距离 = (遮盖的移动距离 * 大图最大的移动距离) / 遮盖最大的移动距离
      var bigImgLeft = (maskLeft * bigImgMaxLeft) / maskMaxMoveLeft
      var bigImgTop = (maskTop * bigImgMaxTop) / maskMaxMoveTop

      // 设置大图的left和top
      bigImg.style.left = -bigImgLeft + 'px'
      bigImg.style.top = -bigImgTop + 'px'
    }

    // 给小图容器绑定移动事件
    smallImgBox.onmouseleave = function () {
      // // DOM树中要销毁遮盖，大图容器
      smallImgBox.removeChild(mask)
      preview.removeChild(bigImgBox)
      // // 节点在DOM树已经销毁了，但是其dom节点的变量还是引用着它，为了消除无效DOM引用
      // // 防止内存泄漏，要解除DOM的引用
      mask = bigImgBox = bigImg = null
      // // 解绑鼠标移动和离开事件
      smallImgBox.onmousemove = null
      smallImgBox.onmouseleave = null
    }
  }
}

// 初始化缩略图数据
function thumb() {
  // 思路：获取图片的数据，动态创建li节点，li中再追加img标签
  goodData.imgsrc.forEach(function (item, index) {
    // item => {b:url,s:url}
    var liNode = document.createElement('li')
    var thumbImg = new Image()
    thumbImg.src = item.s
    liNode.appendChild(thumbImg)
    // console.log(liNode)
    // 把li动态添加到list当中
    var list = document.querySelector(
      '.wrap .con .mainCon .previewWrap .specScroll .itemCon .list'
    )
    list.appendChild(liNode)
  })

  // 给左右箭头绑定单击事件，移动ul（left）
  var next = document.querySelector(
    '.wrap .con .mainCon .previewWrap .specScroll .next'
  )
  var prev = document.querySelector(
    '.wrap .con .mainCon .previewWrap .specScroll .prev'
  )
  var list = document.querySelector(
    '.wrap .con .mainCon .previewWrap .specScroll .itemCon .list'
  )
  var lis = document.querySelectorAll(
    '.wrap .con .mainCon .previewWrap .specScroll .itemCon .list > li'
  )

  // 获取dom节点最终的渲染之后的样式
  var marginRight = parseInt(window.getComputedStyle(lis[0]).marginRight) // "25px"

  // 每次移动的距离 = （li宽度 + li右外边距）
  var stepMoveLeft = lis[0].offsetWidth + marginRight // 75

  var num = 5 // 默认仅显示五张图片

  // 限制ul最大的移动距离 = （li节点个数 - num） * 每次移动的距离
  var listMaxMoveLeft = (lis.length - num) * stepMoveLeft

  var moveLeft = 0 // 记录已经移动的距离
  // 右箭头
  next.onclick = function () {
    // 不能超过最大的移动距离
    if (moveLeft >= listMaxMoveLeft) {
      return // 不在移动
    }
    moveLeft += stepMoveLeft
    list.style.left = -moveLeft + 'px'
  }

  // 左箭头
  prev.onclick = function () {
    // console.log('prev')
    if (moveLeft === 0) {
      return // 不在移动
    }
    moveLeft -= stepMoveLeft
    list.style.left = -moveLeft + 'px'
  }
}

// 给缩略图绑定事件
function thumbClick() {
  // 给所有的小缩略图绑定单击事件
  var imgs = document.querySelectorAll(
    '.wrap .con .mainCon .previewWrap .specScroll .itemCon .list > li img'
  )
  var smallImg = document.querySelector(
    '.wrap .con .mainCon .previewWrap .preview .zoom img'
  )
  // 转成真数组，可以使用真数组的forEach
  Array.from(imgs).forEach(function (item, index) {
    // 绑定单击事件
    item.onclick = function () {
      // 获取当前点击图片的src地址，给小盒子中图片src赋值
      smallImg.src = this.src
      // 给全局的索引赋值
      imgIndex = index
      // console.log(index)
    }
  })
}

// 动态渲染商品的基本信息
function goodsBaseInfo() {
  // 思路：1. 把字符串中的数据替换中data.js中的真实数据
  var goods = goodData.goodsDetail
  // 2. 把替换好的字符串作为info的节点内容
  var goodsNode = document.querySelector('.wrap .con .mainCon .infoWrap .info1')
  var info = `<h3 class="infoName">${goods.title}</h3>
<p class="news">${goods.recommend}</p>
<div class="priceArea">
  <div class="priceArea1">
    <div class="title">价&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;格</div>
    <div class="price">
      <i>￥</i>
      <em>${goods.price}</em>
      <span>降价通知</span>
    </div>
    <div class="remark">
      <i>累计评价</i>
      <span>${goods.evaluateNum}</span>
    </div>
  </div>
  <div class="priceArea2">
    <div class="title">促&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;销</div>
    <div class="fixWidth">
      <i>${goods.promoteSales.type}</i>
      <span>${goods.promoteSales.content} </span>
    </div>
  </div>
</div>
<div class="support">
  <div>
    <div class="title">支&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;持</div>
    <div class="fixWidth">${goods.support}</div>
  </div>
  <div>
    <div class="title">配&nbsp;送&nbsp;至</div>
    <div class="fixWidth">${goods.address}</div>
  </div>
</div>`
  goodsNode.innerHTML = info

  var leftPriceNode = document.querySelector(
    '.wrap .productDetail .detail .fitting .goodSuits .master p'
  )
  var rightPriceNode = document.querySelector(
    '.wrap .productDetail .detail .fitting .goodSuits .result .price'
  )

  var totalPrice = goods.price
  leftPriceNode.innerText = '¥' + totalPrice
  // 还要考虑复选框默认选中的价格，累加到右边的价格
  var inputs = document.querySelectorAll(
    '.wrap .productDetail .detail .fitting .goodSuits .suits .suitsItem input'
  )

  // 记录选中的数量
  var selected = 0
  inputs.forEach(function (input) {
    // 累加选中的价格
    if (input.checked) {
      // this.value获取到的内容是字符串，需要转成number类型
      totalPrice += Number(input.value)
      selected++
    }
  })
  // 设置购买附件的数量
  document.getElementsByClassName('selected')[0].innerText = selected
  rightPriceNode.innerText = '¥' + totalPrice
}

// 动态渲染商品的参数信息
function goodsParamsInfo() {
  /**
   * 思路：
   * 1. 获取商品参数数据（data.js）
   * 2. 循环数据，动态创建dl(dt，dd)
   * 3. 动态追加到页面指定的节点中
   */

  //  1. 获取商品参数数据（data.js）
  var goodsParams = goodData.goodsDetail.crumbData
  goodsParams.forEach(function (param) {
    // 创建dl
    var dlNode = document.createElement('dl')
    // 创建dt
    var dtNode = document.createElement('dt')
    dtNode.innerText = param.title
    // dt追加到dl
    dlNode.appendChild(dtNode)
    // 创建dd节点
    param.data.forEach(function (info) {
      var ddNode = document.createElement('dd')
      ddNode.innerText = info.type
      // 给dd额外添加自定义属性price,便于后面单击获取
      ddNode.setAttribute('price', info.changePrice)
      dlNode.appendChild(ddNode)
    })
    // 动态追加到页面指定的节点中
    var chooseAreaNode = document.querySelector(
      '.wrap .con .mainCon .infoWrap .choose .chooseArea'
    )
    chooseAreaNode.appendChild(dlNode)
  })
}

// 给商品参数绑定单击事件
function goodsParamsClick() {
  /**
   * 思路：
   * 1. 获取所有dl,并循环，找到指定下标里面的所有的dd
   * 2. 给dd循环绑定单击事件
   * 3. 单击时，把当前dd设置红色，同辈兄弟元素dd要改为灰色
   * 4. 把单击的参数条件记录在一个数组中，并在筛选条件容器中进行展示
   * 5. 把在数组中已经选中的条件动态创建mark标签，并插入到底指定页面筛选结果容器中
   */

  // 1. 获取所有dl,并循环，找到指定下标里面的所有的dd
  var dlsNode = document.querySelectorAll(
    '.wrap .con .mainCon .infoWrap .choose .chooseArea dl'
  )
  var result = new Array(4) // 创建指定长度的数组，存放我们单击的一些筛选条件
  result.fill(0) // 给数组元素都填充为0,代表都没有选中条件
  console.log(result)
  dlsNode.forEach(function (dlNode, index) {
    // 以dl为父找其下面的名为dd的字节点
    var ddsNode = dlNode.querySelectorAll('dd')
    // 2. 给dd循环绑定单击事件
    ddsNode.forEach(function (ddNode) {
      ddNode.onclick = function () {
        // 通过循环dl的下标index找到指定dl,同辈兄弟元素dd要改为灰色
        ddsNode.forEach(function (d) {
          d.style.color = '#666'
        })
        // 3. 单击时，把当前dd设置红色，同辈兄弟元素dd要改为灰色
        this.style.color = 'red'

        //  4. 把单击的参数条件记录在一个数组中，并在筛选条件容器中进行展示
        // 必须给对应的dl的下标设置选中的条件，这样才会保存同一组dl某个条件，覆盖dl中同一个条件
        // this是当前的dd节点
        result[index] = this
        // 重新计算价格
        changePrice(result)
        // 5. 把在数组中已经选中的条件动态创建mark标签，并插入到底指定页面筛选结果容器中
        // 每次重新创建追加mark节点之前,清空已经选中的条件节点内容
        var choosed = document.querySelector(
          '.wrap .con .mainCon .infoWrap .choose .choosed'
        )
        choosed.innerText = ''
        console.log(result)
        result.forEach(function (paramValue, index) {
          // 如果是0没有条件，0是假值，则不在创建mark,不要往下走
          if (!paramValue) {
            return
          }
          var markNode = document.createElement('mark')
          markNode.innerText = paramValue.innerText
          var aNode = document.createElement('a')
          aNode.innerText = 'X'
          // 记录当前条件所在原来的对应dl的下标，便于后面删除的时候，可以找到对应的dl标签
          aNode.setAttribute('resultIndex', index)
          // mark追加a节点
          markNode.appendChild(aNode)
          // 把mark追加指定容器中进行展示
          choosed.appendChild(markNode)
        })

        // 6. 对创建的mark节点中的a标签绑定单击事件
        var aNodes = document.querySelectorAll(
          '.wrap .con .mainCon .infoWrap .choose .chooseArea .choosed mark a'
        )
        aNodes.forEach(function (aNode, index) {
          aNode.onclick = function () {
            // 1.移除a节点父亲（mask）
            var maskNode = this.parentNode
            // 2. 删除其在result对应的条件,通过原来存储的dl下标来寻找
            var originDlIndex = this.getAttribute('resultIndex')
            result[originDlIndex] = 0
            maskNode.parentNode.removeChild(maskNode)
            // 3.找到对应原来下标的dl元素，把所有的dd文字改为灰色，把第一个即下标为0改为红色
            var ddNodes = dlsNode[originDlIndex].querySelectorAll('dd')
            ddNodes.forEach(function (ddNode) {
              ddNode.style.color = '#666'
            })
            ddNodes[0].style.color = 'red'

            // 重新计算价格
            changePrice(result)
          }
        })
      }
    })
  })
}

// 切换筛选条件变化价格
// result = > [dd,dd]
// result参数就是上面的筛选条件的dd对象，其身上有个自定义属性price
function changePrice(result) {
  var totalPrice = goodData.goodsDetail.price //最初始原价

  // 循环筛选条件的对象，获取其中的价格
  result.forEach(function (ddNode) {
    if (!ddNode) {
      return // 没有添加则直接退出
    }
    // 获取到每个节点的价格和最初始原价进行累加
    var price = Number(ddNode.getAttribute('price'))
    totalPrice += price
  })

  // 给三处价格赋值
  var goodsPriceNode = document.querySelector(
    '.wrap .con .mainCon .infoWrap .info1 .priceArea .priceArea1 .price em'
  )
  var leftPriceNode = document.querySelector(
    '.wrap .productDetail .detail .fitting .goodSuits .master p'
  )
  var rightPriceNode = document.querySelector(
    '.wrap .productDetail .detail .fitting .goodSuits .result .price'
  )

  goodsPriceNode.innerText = totalPrice
  leftPriceNode.innerText = '¥' + totalPrice

  // 还要考虑复选框默认选中的价格，累加到右边的价格
  var inputs = document.querySelectorAll(
    '.wrap .productDetail .detail .fitting .goodSuits .suits .suitsItem input'
  )
  inputs.forEach(function (input) {
    // 累加选中的价格
    if (input.checked) {
      // this.value获取到的内容是字符串，需要转成number类型
      totalPrice += Number(input.value)
    }
  })
  rightPriceNode.innerText = '¥' + totalPrice
}

// 给附加商品的input框绑定单击事件计算价格
function inputChangePrice() {
  var inputs = document.querySelectorAll(
    '.wrap .productDetail .detail .fitting .goodSuits .suits .suitsItem input'
  )
  // 获取原数量
  var selected = Number(
    document.getElementsByClassName('selected')[0].innerText
  )
  console.log(selected)
  inputs.forEach(function (input) {
    // 获取价格和右边的价格进行计算
    input.onclick = function () {
      // 因为右边的价格会因为一些添加会再次变化，所以这里要获取最新的右边的价格
      var rightPriceNode = document.querySelector(
        '.wrap .productDetail .detail .fitting .goodSuits .result .price'
      )
      var rightTotalPrice = rightPriceNode.innerText // '¥5320'
      // 获取右边number价格，需要提取
      rightTotalPrice = Number(rightTotalPrice.substring(1))
      console.log(rightTotalPrice)
      if (this.checked) {
        // 如果是选中的，右边价格加上当前复选框的价格
        console.log('选中了')
        selected++ // 数量累加
        rightTotalPrice += Number(this.value)
      } else {
        // 如果是未选中的，右边价格要减去当前的复选框的价格
        console.log('未选中了')
        selected-- // 数量减减
        rightTotalPrice -= Number(this.value)
      }
      console.log(selected)
      // 把最新的右边价格给右边价格容器赋值
      rightPriceNode.innerText = '¥' + rightTotalPrice
      // 设置购买附件的数量
      document.getElementsByClassName('selected')[0].innerText = selected
    }
  })
}

// 给右侧固定菜单绑定单击事件，可以展开和折叠效果
function fixedMenuClick() {
  // 获取单击的按钮
  var btn = document.querySelector('.wrap .toolBar .but')
  var toolBar = document.querySelector('.wrap .toolBar.toolWrap')
  var isOpen = false // 默认是收着
  btn.onclick = function () {
    if (isOpen) {
      // 展开 =》 收着
      toolBar.className = 'toolBar toolWrap'
      this.className = 'but list'
      // isOpen = false
    } else {
      // 收着 =》 展开
      toolBar.className = 'toolBar toolOut'
      this.className = 'but cross'
      // isOpen = true
    }
    isOpen = !isOpen // 取反操作
  }
}

// 个人菜单绑定鼠标悬浮和离开
function personMenu() {
  var lisNode = document.querySelectorAll('.wrap .toolBar .toolList li')
  lisNode.forEach(function (liNode, index) {
    // 鼠标悬浮
    liNode.onmouseenter = function () {
      liNode.querySelector('i').style.backgroundColor = 'rgb(200,17,34)'
      liNode.querySelector('em').style.left = '-62px'
    }
    // 鼠标离开
    liNode.onmouseleave = function () {
      liNode.querySelector('i').style.backgroundColor = 'rgb(122,110,110)'
      liNode.querySelector('em').style.left = '35px'
    }
  })
}
