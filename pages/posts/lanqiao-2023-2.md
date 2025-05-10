---
title: 蓝桥杯 2023 年国赛题解（二）
date: 2025-05-11T00:00:00Z
lang: zh
duration: 12min
type: note
---

[[toc]]

> [!TIP]
> 建议先刷题，再看题解😎！

## 讨论区

题目：<LanqiaoLink name="讨论区" id="18472" />

这题我没能打开参数标注的页面，而且看题解区说的代码量巨大。建议大家遇到这个题就别做了，有点浪费时间。

## GitHub Contribution

题目：<LanqiaoLink name="GitHub Contribution" id="18475" />

第一问是简单的数据请求，因为函数没有用`async`修饰，所以这里用了链式`then`调用：

```js
fetch("./data.json").then(res => res.json()).then(res => {
    // console.log(res);
    data = res.map(it => [it.time, it.contributions])
    console.log(data);
    render(data);
  })
```

注意，一定要把`render`函数放在`then`里，因为`then`只是注册了钩子，并没有阻塞代码的执行。

后面第二问完全没难度，只要根据 API 正确地配置参数即可：

```js
calendar: {
    range: "2022",
    top: 80,
    left: "center",
    cellSize: 15,
    itemStyle: {
      color: "#ebedf0",
      borderWidth: 1
    },
    splitLine: false,
    yearLabel: false
},
tooltip: {
        formatter: (params) => {
          // console.log(params);
          return `<div id="tooltip">日期：${params.data[0]}<br>提交次数：${params.data[1]}</div>`
        }
}
```

`tooltip` API 中没有明确告诉你`formatter`参数`params`是什么，可以自己打印出来看一下。打印出的结果我们发现有用的数据在`data`属性下，所以就可以直接获取了！
