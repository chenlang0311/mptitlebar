<template>
  <div
    class="nav-bar"
    :class="extClass"
    :style="{
      background: backgroundColorTop,
      height: navBarHeight + navBarExtendHeight + 'px',
    }"
  >
    <div
      class="nav-bar__placeholder"
      :class="{ ios: ios, android: !ios }"
      :style="{
        paddingTop: navBarHeight + navBarExtendHeight + 'px',
        visibility: 'hidden',
      }"
    ></div>
    <div
      class="nav-bar__inner"
      :class="{ ios: ios, android: !ios }"
      :style="{ navigationbarinnerStyle, displayStyle }"
    >
      <div class="nav-bar__left" :style="navBarLeft">
        <template v-if="back && !home">
          <div @click="backEmit" class="nav-bar__button nav-bar__btn_goback" :class="iconTheme"></div>
        </template>
        <template v-if="!back && home">
          <div @click="homeEmit" class="nav-bar__button nav-bar__btn_gohome" :class="iconTheme"></div>
        </template>
        <template v-else-if="back && home">
          <div @click="homeEmit" class="nav-bar__buttons" :class="{ ios: ios, android: !ios }">
            <div @click="backEmit" class="nav-bar__button nav-bar__btn_goback" :class="iconTheme"></div>
            <div @click="homeEmit" class="nav-bar__button nav-bar__btn_gohome" :class="iconTheme"></div>
          </div>
        </template>
        <template v-else>
          <slot name="left"></slot>
        </template>
      </div>
      <div class="nav-bar__center">
        <text class="nav-bar__center-title" v-if="title">{{ title }}</text>
        <div
          @click="search"
          class="nav-bar-search"
          :style="{ height: capsulePosition.height + 'px' }"
          v-else-if="searchBar"
        >
          <div class="nav-bar-search__icon" />
          <div class="nav-bar-search__input">{{ searchText }}</div>
        </div>
        <template v-else>
          <slot name="center"></slot>
        </template>
      </div>
      <div class="nav-bar__right">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script>
// let wx={}
// function getCurrentPages(){

// }
export default {
  data() {
    return {
      navBarHeight: 0,
      navBarExtendHeight: 0,
      navigationbarinnerStyle: {},
      capsulePosition: {},
      navBarLeft: 0
    };
  },
  created() {
    this.getSystemInfo();
  },
  mounted() {
    this.setStyle();
  },
  onShow() {
    if (this.$globalSystemInfo) {
      this.setStyle();
    }
  },
  props: {
    extClass: {
      type: String,
      value: ""
    },
    background: {
      type: String,
      value: "rgba(255, 255, 255, 1)",
      observer: "_showChange"
    },
    backgroundColorTop: {
      type: String,
      value: "rgba(255, 255, 255, 1)",
      observer: "_showChangeBackgroundColorTop"
    },
    color: {
      type: String,
      value: "rgba(0, 0, 0, 1)"
    },
    title: {
      type: String,
      value: ""
    },
    searchText: {
      type: String,
      value: "点我搜索"
    },
    searchBar: {
      type: Boolean,
      value: false
    },
    back: {
      type: Boolean,
      value: false
    },
    home: {
      type: Boolean,
      value: false
    },
    iconTheme: {
      type: String,
      value: "black"
    },
    delta: {
      type: Number,
      value: 1
    }
  },
  methods: {
    getSystemInfo() {
      if (this.$globalSystemInfo && !this.$globalSystemInfo.ios) {
        return this.$globalSystemInfo;
      } else {
        let systemInfo = wx.getSystemInfoSync();
        let ios = !!(systemInfo.system.toLowerCase().search("ios") + 1);
        let rect;
        try {
          rect = wx.getMenuButtonBoundingClientRect
            ? wx.getMenuButtonBoundingClientRect()
            : null;
          if (rect === null) {
            throw new Error("getMenuButtonBoundingClientRect error");
          }
          // 取值为0的情况  有可能width不为0 top为0的情况
          if (!rect.width || !rect.top || !rect.left || !rect.height) {
            throw new Error("getMenuButtonBoundingClientRect error");
          }
        } catch (error) {
          let gap = ""; // 胶囊按钮上下间距 使导航内容居中
          let width = 96; // 胶囊的宽度
          if (systemInfo.platform === "android") {
            gap = 8;
            width = 96;
          } else if (systemInfo.platform === "devtools") {
            if (ios) {
              gap = 5.5; // 开发工具中ios手机
            } else {
              gap = 7.5; // 开发工具中android和其他手机
            }
          } else {
            gap = 4;
            width = 88;
          }
          if (!systemInfo.statusBarHeight) {
            // 开启wifi的情况下修复statusBarHeight值获取不到
            systemInfo.statusBarHeight =
              systemInfo.screenHeight - systemInfo.windowHeight - 20;
          }
          rect = {
            // 获取不到胶囊信息就自定义重置一个
            bottom: systemInfo.statusBarHeight + gap + 32,
            height: 32,
            left: systemInfo.windowWidth - width - 10,
            right: systemInfo.windowWidth - 10,
            top: systemInfo.statusBarHeight + gap,
            width: width
          };
          console.log("error", error);
          console.log("rect", rect);
        }

        let navBarHeight = "";
        if (!systemInfo.statusBarHeight) {
          systemInfo.statusBarHeight =
            systemInfo.screenHeight - systemInfo.windowHeight - 20;
          navBarHeight = (function() {
            let gap = rect.top - systemInfo.statusBarHeight;
            return 2 * gap + rect.height;
          })();

          systemInfo.statusBarHeight = 0;
          systemInfo.navBarExtendHeight = 0; // 下方扩展4像素高度 防止下方边距太小
        } else {
          navBarHeight = (function() {
            let gap = rect.top - systemInfo.statusBarHeight;
            return systemInfo.statusBarHeight + 2 * gap + rect.height;
          })();
          if (ios) {
            systemInfo.navBarExtendHeight = 4; // 下方扩展4像素高度 防止下方边距太小
          } else {
            systemInfo.navBarExtendHeight = 0;
          }
        }
        systemInfo.navBarHeight = navBarHeight; // 导航栏高度不包括statusBarHeight
        systemInfo.capsulePosition = rect; // 右上角胶囊按钮信息bottom: 58 height: 32 left: 317 right: 404 top: 26 width: 87 目前发现在大多机型都是固定值 为防止不一样所以会使用动态值来计算nav元素大小
        systemInfo.ios = ios; // 是否ios

        this.$globalSystemInfo = systemInfo; // 将信息保存到全局变量中,后边再用就不用重新异步获取了

        // console.log('systemInfo', systemInfo);
        return systemInfo;
      }
    },
    handleWarn(type) {
      wx.showModal({
        title: "",
        content: "信息未保存，确认退出？已编辑信息不会保留",
        confirmColor: "#33C4A7",
        confirmText: "退出",
        cancelText: "取消",
        success(res) {
          if (res.confirm) {
            if (type === "backOne") {
              wx.navigateBack({ delta: 1 });
            } else {
              wx.switchTab({ url: "/pages/index/main" });
            }
          }
        }
      });
    },
    backOne() {
      if (getCurrentPages().length <= 1) {
        wx.switchTab({ url: "/pages/index/main" });
        return;
      }
      let status = this.backHold;
      if (status) {
        this.handleWarn("backOne");
        return;
      }
      if (this.backPath) {
        return wx.navigateTo({ url: `/pages/${this.backPath}/main` });
      } else if (this.backToHome) {
        return wx.switchTab({ url: "/pages/index/main" });
      }
      wx.navigateBack({ delta: 1 });
    },
    toHome() {
      let status = this.backHold;
      if (status) {
        this.handleWarn("toHome");
      } else {
        wx.switchTab({ url: "/pages/index/main" });
      }
    },
    backEmit() {
      this.$emit("back", { delta: this.delta });
    },
    homeEmit() {
      this.$emit("home", {});
    },
    search() {
      this.$emit("search", {});
    },
    setStyle() {
      console.log("$globalSystemInfo", this.$globalSystemInfo);
      const {
        statusBarHeight,
        navBarHeight,
        capsulePosition,
        navBarExtendHeight,
        windowWidth
      } = this.$globalSystemInfo;
      const { back, home, title } = this;
      let rightDistance = windowWidth - capsulePosition.right; // 胶囊按钮右侧到屏幕右侧的边距
      let leftWidth = windowWidth - capsulePosition.left; // 胶囊按钮左侧到屏幕右侧的边距

      let navigationbarinnerStyle = [
        `color: ${this.color}`,
        `background: ${this.background}`,
        `height:${navBarHeight + navBarExtendHeight}px`,
        `padding-top:${statusBarHeight}px`,
        `padding-right:${leftWidth}px`,
        `padding-bottom:${navBarExtendHeight}px`
      ].join(";");
      let navBarLeft = [];
      if ((back && !home) || (!back && home)) {
        navBarLeft = [
          `width:${capsulePosition.width}px`,
          `height:${capsulePosition.height}px`
        ].join(";");
      } else if ((back && home) || title) {
        navBarLeft = [
          `width:${capsulePosition.width}px`,
          `height:${capsulePosition.height}px`,
          `margin-left:${rightDistance}px`
        ].join(";");
      } else {
        navBarLeft = [`width:auto`, `margin-left:0px`].join(";");
      }
      this.navigationbarinnerStyle = navigationbarinnerStyle;
      this.navBarLeft = navBarLeft;
      this.navBarHeight = navBarHeight;
      this.capsulePosition = capsulePosition;
      this.navBarExtendHeight = navBarExtendHeight;
    }
  }
};
</script>

<style scoped>
view,
text,
scroll-view,
input,
button,
image,
cover-view {
  box-sizing: border-box;
}
page {
  --height: 44px; /* 4*2+32 */
  --right: 97px; /* 10+87 */
  --navBarExtendHeight: 4px;
  box-sizing: border-box;
}
.nav-bar .ios {
  --height: 44px; /* 4*2+32 */
  --right: 97px; /* 10+87 */
  --navBarExtendHeight: 4px;
  box-sizing: border-box;
}
.nav-bar .android {
  --height: 48px; /* 8*2+32 */
  --right: 96px; /* 10+87 */
  --navBarExtendHeight: 4px;
  box-sizing: border-box;
}
.nav-bar .devtools {
  --height: 42px; /* 5*2+32 */
  --right: 88px; /* 10+87 */
  --navBarExtendHeight: 4px;
  box-sizing: border-box;
}
.nav-bar__inner {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999;
  height: var(--height);
  display: flex;
  align-items: center;
  padding-right: var(--right);
  width: 100%;
  padding-bottom: var(--navBarExtendHeight);
}
.nav-bar__inner .nav-bar__left {
  position: relative;
  width: var(--right);
  height: 32px;
  display: flex;
  align-items: center;
}
.nav-bar__buttons {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  border-radius: 16px;
  border: 1rpx solid rgba(204, 204, 204, 0.6);
  position: relative;
}
.nav-bar__buttons.android {
  border: 1rpx solid rgba(234, 234, 234, 0.6);
}
.nav-bar__buttons::after {
  position: absolute;
  content: "";
  width: 1rpx;
  height: 18.4px;
  background: rgba(204, 204, 204, 0.6);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.nav-bar__buttons.android::after {
  background: rgba(234, 234, 234, 0.6);
}
.nav-bar__button {
  width: 50%;
  height: 100%;
  display: flex;
  font-size: 12px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 1em 2em;
}

.nav-bar__inner .nav-bar__left .nav-bar__btn_goback:active,
.nav-bar__inner .nav-bar__left .nav-bar__btn_gohome:active {
  opacity: 0.5;
}
.nav-bar__inner .nav-bar__center {
  font-size: 17px;
  line-height: 17px;
  text-align: center;
  position: relative;
  flex: 1;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 10px;
}
.nav-bar__inner .nav-bar__center .nav-bar__center-title {
  margin-top: -2px;
}
.nav-bar__inner .nav-bar__loading {
  font-size: 0;
}
.nav-bar__inner .nav-bar__loading .loading {
  margin-left: 0;
}
.nav-bar__inner .nav-bar__right {
  margin-right: 10px;
}
.nav-bar__placeholder {
  height: var(--height);
  background: #f8f8f8;
  position: relative;
  z-index: 50;
}

.nav-bar-search {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 32px;
  border-radius: 16px;
  position: relative;
  background: #f6f6f6;
}

.nav-bar-search__input {
  height: 100%;
  display: flex;
  align-items: center;
  color: #999;
  font-size: 15px;
  line-height: 15px;
}
.nav-bar__inner .nav-bar__left .nav-bar__btn_goback {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='24' viewBox='0 0 12 24'%3E  %3Cpath fill-opacity='.9' fill-rule='evenodd' d='M10 19.438L8.955 20.5l-7.666-7.79a1.02 1.02 0 0 1 0-1.42L8.955 3.5 10 4.563 2.682 12 10 19.438z'/%3E%3C/svg%3E");
}
.nav-bar__inner .nav-bar__left .nav-bar__btn_goback.white {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='24' viewBox='0 0 12 24'%3E  %3Cpath fill-opacity='.9' fill-rule='evenodd' d='M10 19.438L8.955 20.5l-7.666-7.79a1.02 1.02 0 0 1 0-1.42L8.955 3.5 10 4.563 2.682 12 10 19.438z' fill='%23ffffff'/%3E%3C/svg%3E");
}
.nav-bar__inner .nav-bar__left .nav-bar__btn_gohome {
  background-image: url("data:image/svg+xml,%3Csvg t='1565752242401' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='4326' width='48' height='48'%3E%3Cpath d='M931.148 451.25L591.505 97.654c-21.106-21.953-49.313-34.034-79.551-34.034-30.235 0-58.448 12.081-79.554 34.034L92.76 451.25c-35.049 36.498-30.536 68.044-24.742 81.222 4.13 9.35 18.07 35.05 58.231 35.05h49.78v272.016c0 61.756 44.342 119.906 107.357 119.906h144.587v-287.87c0-30.866-4.675-48.062 26.848-48.062h114.268c31.52 0 26.845 17.196 26.845 48.061v287.872h144.588c63.013 0 107.358-58.15 107.358-119.906V567.523h49.782c40.16 0 54.1-25.7 58.229-35.05 5.793-13.18 10.306-44.726-24.743-81.224z m-33.486 60.28h-105.77v328.007c0 30.865-19.877 63.917-51.37 63.917h-88.6V671.572c0-61.761-19.79-104.05-82.832-104.05H454.821c-63.045 0-82.836 42.289-82.836 104.05v231.883h-88.599c-31.495 0-51.37-33.052-51.37-63.917V511.529H126.25c-0.984 0-1.888-3.852-2.708-3.907 1.94-3.388 5.276-11.975 10.825-17.743l339.671-353.35c10.142-10.578 24.467-17.057 38.353-16.924 13.888-0.133 27.342 6.346 37.483 16.923L889.54 489.88c5.549 5.768 8.885 14.355 10.825 17.743-0.818 0.055-1.72 3.907-2.704 3.907z' fill='%23000000' p-id='4327'%3E%3C/path%3E%3C/svg%3E");
  background-size: 22px 22px;
}
.nav-bar__inner .nav-bar__left .nav-bar__btn_gohome.white {
  background-image: url("data:image/svg+xml,%3Csvg t='1565752242401' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='4326' width='48' height='48'%3E%3Cpath d='M931.148 451.25L591.505 97.654c-21.106-21.953-49.313-34.034-79.551-34.034-30.235 0-58.448 12.081-79.554 34.034L92.76 451.25c-35.049 36.498-30.536 68.044-24.742 81.222 4.13 9.35 18.07 35.05 58.231 35.05h49.78v272.016c0 61.756 44.342 119.906 107.357 119.906h144.587v-287.87c0-30.866-4.675-48.062 26.848-48.062h114.268c31.52 0 26.845 17.196 26.845 48.061v287.872h144.588c63.013 0 107.358-58.15 107.358-119.906V567.523h49.782c40.16 0 54.1-25.7 58.229-35.05 5.793-13.18 10.306-44.726-24.743-81.224z m-33.486 60.28h-105.77v328.007c0 30.865-19.877 63.917-51.37 63.917h-88.6V671.572c0-61.761-19.79-104.05-82.832-104.05H454.821c-63.045 0-82.836 42.289-82.836 104.05v231.883h-88.599c-31.495 0-51.37-33.052-51.37-63.917V511.529H126.25c-0.984 0-1.888-3.852-2.708-3.907 1.94-3.388 5.276-11.975 10.825-17.743l339.671-353.35c10.142-10.578 24.467-17.057 38.353-16.924 13.888-0.133 27.342 6.346 37.483 16.923L889.54 489.88c5.549 5.768 8.885 14.355 10.825 17.743-0.818 0.055-1.72 3.907-2.704 3.907z' fill='%23ffffff' p-id='4327'%3E%3C/path%3E%3C/svg%3E");
  background-size: 22px 22px;
}
.nav-bar-search__icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url("data:image/svg+xml,%3Csvg t='1565691512239' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='1240' width='48' height='48'%3E%3Cpath d='M819.2 798.254545L674.909091 653.963636c46.545455-48.872727 74.472727-114.036364 74.472727-186.181818 0-151.272727-123.345455-274.618182-274.618182-274.618182-151.272727 0-274.618182 123.345455-274.618181 274.618182 0 151.272727 123.345455 274.618182 274.618181 274.618182 65.163636 0 128-23.272727 174.545455-62.836364l144.290909 144.290909c2.327273 2.327273 6.981818 4.654545 11.636364 4.654546s9.309091-2.327273 11.636363-4.654546c6.981818-6.981818 6.981818-18.618182 2.327273-25.6zM235.054545 467.781818c0-132.654545 107.054545-239.709091 239.709091-239.709091 132.654545 0 239.709091 107.054545 239.709091 239.709091 0 132.654545-107.054545 239.709091-239.709091 239.709091-132.654545 0-239.709091-107.054545-239.709091-239.709091z' fill='%23999999' p-id='1241'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
