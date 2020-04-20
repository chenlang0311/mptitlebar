"use strict";

import mpTitlebar from "./mpTitlebar.vue"

const MpVueTitlebar = {
    install (Vue) {
        Vue.component("mp-titlebar", mpTitlebar)
    }
}

export default MpVueTitlebar