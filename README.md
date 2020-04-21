# mptitlebar

## 安装
```
npm install mptitlebar -S
```

## 使用
- `import MpTitlebar from 'mptitlebar'` 在src/main.js中引入组件
- `Vue.component('mp-titlebar', MpTitlebar)` 在src/main.js中注册组件
- `<mp-titlebar title="页面标题" background="#fff" :back="true" :home="true"></mp-titlebar>` 在页面使用

## 参数及方法
| 参数及方法 | 类型 | 说明 | 默认值 |
| ------------ | ------------ | ------------ |------------ |
| extClass | String | 可以传入的类名 | "" |
| background | String | 背景色 | "rgba(255, 255, 255, 1)" |
|backgroundColorTop | String | 渐变背景色的默认 | "rgba(255, 255, 255, 1)" |
| color | String | 文字颜色 | "rgba(0, 0, 0, 1)" |
| title | String | 页面标题 | "" |
| searchText | String | 搜索框的placeholder | "点我搜索" |
| searchBar | Boolean | 是否显示搜索框 | false |
| back | Boolean | 是否显示返回上一页按钮 | false |
| home | Boolean | 是否显示返回主页按钮 | false |
| iconTheme | String | 默认icon的主题色 | "black" |
| delta | Number | 后退的层级 | 1 |
