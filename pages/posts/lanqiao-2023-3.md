---
title: 蓝桥杯 2023 年国赛题解（三）
date: 2025-05-12T00:00:00Z
lang: zh
duration: 12min
type: note
---

[[toc]]

> [!TIP]
> 建议先刷题，再看题解😎！

## 恶龙与公主

题目：<LanqiaoLink name="恶龙与公主" id="18469" />

第一个问要求我们将一个二维数组以顺时针螺旋的形式输出。这其实是一个**伪算法题**，因为它不是走迷宫的题目，路径是固定的。

参考下图：

<img src="/images/lanqiao/image3.png" class="!w-1/2 !mx-auto" />

从左上角开始，按照顺时针螺旋的顺序，依次输出每个位置的值。这里给出一个方法：可以按顺序（上、右、下、左）地删除二维数组的元素，直到二维数组为空。

```js
function mazePath(arr) {
  const newArr = []
  while (arr.length) {
    arr.length && newArr.push(...(arr.shift()))
    arr.length && newArr.push(...arr.map(e => e.pop()))
    arr.length && newArr.push(...(arr.pop()).reverse())
    arr.length && newArr.push(...arr.map(e => e.shift()).reverse())
  }
  return newArr
}
```

- 上：从二维数组中拿出第一个数组（`shift()`），并将其元素依次放入数组中。
- 右：从二维数组中拿出每个数组的最后一个元素（`pop()`），并将其依次放入数组中。
- 下：从二维数组中拿出最后一个数组（`pop()`），并将其元素逆序（`reverse()`）依次放入数组中。
- 左：从二维数组中拿出每个数组的第一个元素（`shift()`），并将其逆序（`reverse()`）依次放入数组中。

这里要注意的是，这个二维数组不一定在哪一步被清空（取决于二维数组的大小），所以每个操作前都需要确保二维数组不为空，再进行操作。

第二问没有什么特殊的考点，直接给出：

```js
moveHandler() {
    let step = this.element.gameStep.value = this.getStep(this.gameData.step);
    // TODO：根据点击营救后获得的点数，正确到达指定位置调用bloodCalculator函数计算当前血量，到达公主处调用 tipRender 函数，每步的时间间隔在 200ms内（大于此时间会导致判题失败）。
    this.gameData.curPos += step

    document.querySelector('.container>.active').classList.remove('active')

    if (this.gameData.curPos >= this.gameData.pathArr.length - 1) {
        this.gameData.curPos = this.gameData.pathArr.length - 1
        this.tipRender("success")
    }

    document.querySelector(`[data-index="${this.gameData.pathArr[this.gameData.curPos]}"]`).classList.add('active')

    this.bloodCalculator(document.querySelector('.container>.active'))
    if (this.gameData.curBlood == 0) this.tipRender("warning")
},
```

可以关注一下选择器的使用，我们之前讲过`>`表示直接子元素，空格表示后代元素；`+`表示相邻紧跟的兄弟元素，`~`表示所有兄弟元素。

## 版本比较器

题目：<LanqiaoLink name="版本比较器" id="18467" />

```js
function compareVersion(version1, version2) {
  // TODO：待补充代码
  let ver1 = version1.split('.').map(Number).filter(it => it >= 0 && it <= 9)
  let ver2 = version2.split('.').map(Number).filter(it => it >= 0 && it <= 9)
  if (ver1.length !== 3 || ver2.length !== 3) {
    return 'error'
  }
  for (let i = 0; i < 3; i++) {
    if (ver1[i] < ver2[i]) {
      return -1
    }
    else if (ver1[i] > ver2[i]) {
      return 1
    }
    else {
      continue // 当然这行没什么意义，只是为了更清晰
    }
  }
  return 0
}
```

这题本身是一道非常简单的题，而且也有非常清晰的测试用例，基本上测试用例通过了也就拿到分了。这里有几个需要注意的点：

- `1.1.2`和`1.1.10`谁大？题干中明确强调了是按照数值进行比较，而不是按照 ASCII 字典序进行比较，所以在将两个字符串分割成数组后，一定要记得将它们转成整数。

- 怎么筛选出`error`的情况？在我的解法中，我直接将字符串转成数值，再判断其每项是否在`0-9`之间，过滤掉错误的项；如果有项被过滤掉，其数组长度一定小于3，所以会返回`error`。当然，你也可以直接对原字符串用正则判断，这肯定更优雅：

```js
let regex = /^\d+\.\d+\.\d+$/ // 注意`.`的转义
if (!regex.test(version1) || !regex.test(version2)) {
  return 'error'
}
```

## 图片验证码

题目：<LanqiaoLink name="图片验证码" id="18474" />

这是一道非常麻烦的题，非常考验你对 JavaScript 函数式编程的理解；而且考验了细心程度，可能考虑得不够周到就会痛失这道题的分数。

第一问点击图片，为图片添加样式，并根据选中情况修改按钮中的文字。这题我一开始是使用原生 DOM 的`classList`操作来添加或移除样式：

```js
function chooseImg(index) {
  let containers = [...document.querySelectorAll(".image-container")]
  let checkBtn = document.getElementById("check-btn")
  containers[index].classList.toggle("selected")
  // 重置为未选中状态
  this.images[index].type = containers[index].classList.contains("selected")
  if (this.images.some(img => img.type)) {
    checkBtn.textContent = "提交"
  } else {
    checkBtn.textContent = "跳过"
  }
}
```

实际上，Vue 是数据驱动的，这么写并不符合 Vue 的风格。所以你可以使用 Vue 中的条件绑定样式语法：`:class="{ selected: image.type }"`，仅在`image.type`为`true`时添加`selected`类。

接着有一个问题，怎么把选中图片的信息记录下来呢？现在有两个变量`images`和`allImages`，`images`表示的是从`allImages`中随机选出的 9 个图片对象；图片对象中有`type`属性，表示的是该图片是否为正确答案。

我想修改一下`images`变量，使其`type`表示的含义是**该图片是否被选中**而不是**是否为正确答案**。但是要注意：`images`和`allImages`中对图片对象都保持**引用关系**，如果改变其中一个变量中图片对象的`type`，会影响另一个变量；所以我们可以**深克隆**一下`images`，再修改克隆后的`type`。

```js
this.images = structuredClone(
  pick(this.allImages.filter(i => i.category === this.category), 9)
).map(img => img.type = false, img)
```

最后一个`map`将所有图片对象的`type`属性都设置为`false`（因为默认都是未选中状态）。`structuredClone`是 ES 新增的 API，用于深克隆一个对象。新增这个方法之前，如果我们不手动编写方法，就只能用`JSON.parse(JSON.stringify(obj))`来深克隆一个对象，但是这个方法有局限性，比如不能克隆函数、`undefined`、`Symbol`等。

当然，这个方法未必是最好的，你可以另起一个属性，比如`selected`，来表示图片是否被选中。这个方法就不用深克隆对象了。

第二问我们重点看下检查结果的逻辑：

```js
let backups = this.allImages
  .filter(it => it.category === this.category) // 其实不筛选也行，路径对应唯一的类别
let result = this.images.every(img => {
  // allImages 变量的 type 表示正确与否，images变量的 type 表示选中与否
  return backups.find(backup => backup.path === img.path).type === img.type
})
```

注意我们要对`images`进行遍历判断，仅当答案（用`find`在`allImages`中查找）与当前图片的选中状态全部相同时，才返回真。

---

至此题解讲完了 2023 年国赛大学组和职业组的全部题目，接下来会更新 2024 年和 2022 年的，欢迎与我交流！
