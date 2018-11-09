<template>
  <div class="shopcart">
    <div class="content" @click="toggleList">
      <div class="content-left" >
        <div class="logo-wrapper">
          <div class="logo" :class="{'highlight': totalCount > 0}">
            <span class="icon-shopping_cart" :class="{'highlight': totalCount > 0}"></span>
          </div>
          <div class="num" v-show="totalCount === 0? false:true">{{totalCount}}</div>
        </div>
        <div class="price" :class="{'highlight': totalPrice > 0}">¥{{totalPrice}}</div>
        <div class="desc">另需配送费¥{{deliveryPrice}}元</div>
      </div>
      <div class="content-right" @click.stop.prevent ="pay">
        <div class="pay" :class="{'pass': payDesc === `去结算`}">{{payDesc}}
        </div>
      </div>
    </div>

    <div class="ball-container">
      <div v-for="(ball, index) in balls" :key="index">
        <transition name="drop" @before-enter="beforeDrop" @enter="dropping" @after-enter="afterDrop">
          <div v-show="ball.show" class="ball">
            <div class="inner inner-hook"></div>
          </div>
        </transition>
      </div>
    </div>
    <!--<transition name="fold">-->
      <div class="shopcart_list" v-show="listShow">
        <div class="list-header">
          <h1 class="title">购物车</h1>
          <span class="empty" @click="empty">清空</span>
        </div>
        <div class="list-content" ref="listContent">
          <ul>
            <li class="food" v-for="food of selectFoods">
              <span class="name">{{food.name}}</span>
              <div class="price">
                <span>¥{{food.price*food.count}}</span>
              </div>
              <div class="cartcontrol-wrapper">
                <cartcontrol :food="food"></cartcontrol>
              </div>
            </li>
          </ul>
        </div>
      </div>
    <!--</transition>-->

    <div class="list-mask" v-if="listShow" @click="hideList"></div>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'
  import cartcontrol from 'components/cartcontrol/cartcontrol.vue'
  export default {
    data () {
      return {
        // listShow: false,
        countPrice: 0,
        balls: [
          {
            show: false
          },{
            show: false
          },{
            show: false
          },{
            show: false
          }
        ],
        dropBalls: [],
        fold: true
      }
    },
    components: {
      cartcontrol
    },
    props: {
      selectFoods: {
        type: Array,
        default() {
          return [
          ];
        }
      },
      deliveryPrice: {
        type: Number,
        default: 0
      },
      minPrice: {
        type: Number,
        default: 0
      }
    },
    computed: {
      totalPrice() {
        let total = 0;
        this.selectFoods.forEach((food) => {
          total += food.price * food.count;
        })
        return total;
      },
      totalCount() {
        let count = 0;
        this.selectFoods.forEach((food) => {
          count += food.count;
        })
        return count;
      },
      payDesc() {
        let totalPrice = this.totalPrice;
        if (totalPrice === 0) {
          return `¥${this.minPrice}元起送`;
        }else if (totalPrice < this.minPrice) {
          return `还差¥${this.minPrice-totalPrice}元起送`;
        }else {
          return "去结算";
        }
      },
      payClass() {

      },
      listShow() {
        if(!this.totalCount){
          this.fold = true
          return false
        }
        let show = !this.fold;
        if(show) {
          this.$nextTick(() =>{
            if(!this.scroll){
              this.scroll = new BScroll(this.$refs.listContent,{
                click: true
              });
            }else{
              this.scroll.refresh()
            }
          })
        }
        return show
      }
    },
    methods: {
      toggleList() {
        if(!this.totalCount) {
          return ;
        }
        this.fold = !this.fold;
      },
      empty() {
        this.selectFoods.forEach((food) =>{
          food.count = 0
        })
      },
      hideList() {
        this.fold = true
      },
      pay() {
        if(this.totalPrice < this.minPrice){
          return ;
        }
        window.alert(`支付${this.totalPrice}元`)
      },
      // drop(el) {  //触发一次事件就会将所有小球进行遍历
      //   for (let i = 0; i < this.balls.length; i++) {
      //     let ball = this.balls[i];
      //     if (ball.show === false) {
      //       ball.show = true;
      //       ball.el = el;  //设置小球的el属性为一个dom对象
      //       this.dropBalls.push(ball);
      //       return;   //此处return终结函数,这意味着每次触发事件,dropBalls内只增加一个ball
      //     }
      //   }
      // },
      beforeDrop(el) {
        let count = this.balls.length;
        while (count--) {
          let ball = this.balls[count];
          if (ball.show) {
            let rect = ball.el.getBoundingClientRect(); //获取元素的位置
            let x = rect.left - 32; //小球掉落X轴起点
            let y = -(window.innerHeight - rect.top - 22); //小球掉落Y轴起点,向下为负
            el.style.display = '';
            el.style.webkitTransform = `translate3d(0, ${y}px,0)`; /* Safari 和 Chrome */
            el.style.transform = `translate3d(0, ${y}px,0)`; //旋转div元素
            // 处理内层动画
            let inner = el.getElementsByClassName("inner-hook")[0];
            inner.style.webkitTransform = `translate3d(${x}px, 0, 0)`;
            inner.style.transform = `translate3d(${x}px,0,0)`;
          }
        }
      },
      dropping(el,done) {
        //关闭ESlint语法监测，因为ES6语言规范会让被申明却未被调用的变量报错
        /* eslint-disable no-unused-vars */
        let rf = el.offsetHeight; //申明rf是为了触发浏览器的重排
        this.$nextTick(() => {
          //修改数据之后立即使用这个方法，获取更新后的 DOM。
          el.style.webkitTransform = 'translate3d(0, 0, 0)'; /* Safari 和 Chrome */
          el.style.transform = 'translate3d(0, 0, 0)'; //旋转div元素
          let inner = el.getElementsByClassName('inner-hook')[0];
          inner.style.webkitTransform = 'translate3d(0, 0, 0)';
          inner.style.transform = 'translate3d(0, 0, 0)';
          el.addEventListener('transitionend', done)   //Vue为了知道过渡的完成，否则无法进入到afterEnter中
        });
      },
      afterDrop(el) {
        let ball = this.dropBalls.shift(); //把数组的第一个元素从其中删除，并返回第一个元素的值。
        if (ball) {
          ball.show = false;
          el.style.display = 'none'; //隐藏小球
        }
      }

    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin.styl"
  .shopcart
    position: fixed
    left: 0
    bottom: 0
    z-index: 50
    width: 100%
    height: 48px
    .content
      display: flex
      background: #141d27
      font-size: 0
      .content-left
        flex: 1
        .logo-wrapper
          display: inline-block
          position: relative
          top: -10px
          margin: 0 12px
          padding: 6px
          width: 56px
          height: 56px
          box-sizing: border-box
          vertical-align: top
          border-radius: 50%
          background: #141d27
          .logo
            width: 44px
            height: 44px
            border-radius: 50%
            background-color: #2b343c
            text-align: center
            &.highlight
              background: rgb(0,160,220)
            .icon-shopping_cart
              font-size: 24px
              color: rgba(255,255,255,0.4)
              height: 24px
              line-height: 44px
              &.highlight
                color: #fff
          .num
            position: absolute
            left: 44px
            top: 0
            width: 24px
            height: 16px
            line-height: 16px
            font-size: 9px
            font-weight: 700
            text-align: center
            color: rgb(255,255,255)
            background: rgb(240,20,20)
            border-radius: 12px
            box-shadow: 0px 4px 8px 0px rgba(0,0,0,0.4)
        .price
          display: inline-block
          vertical-align: top
          margin-top: 12px
          line-height: 24px
          padding-right: 12px
          box-sizing: border-box
          border-right: 1px solid rgba(255,255,255,0.1)
          font-size: 16 px
          font-weight: 700
          color: rgba(255,255,255,0.4)
          &.highlight
            color: #fff
        .desc
          display: inline-block
          vertical-align: top
          margin: 12px 0 0 12px
          line-height: 24px
          font-size: 10px
          font-weight: 400
          color: rgba(255,255,255,0.4)
      .content-right
        display: inline-block
        flex: 0 0 105px
        width: 105px
        .pay
          height: 48px
          line-height: 48px
          text-align: center
          font-size: 12px
          color: rgba(255,255,255,0.4)
          font-weight: 700
          background: #2B333B
          &.pass
            color: #fff
            background: #00b43c

    .ball-container
      .ball
        position: fixed;
        left: 32px;
        bottom: 22px;
        z-index: 200;
        transition: all 0.4s cubic-bezier(0.49,-0.29,0.75, 0.14); //贝塞尔曲线
        .inner
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgb(0, 160, 220);
          transition: all 0.4s linear

    .shopcart_list
      position: absolute
      left: 0
      top: 0
      width: 100%
      /*z-index: -1
      &.fold-enter-active,&.fold-leave-active
        transition: opacity 0.5s
        transform: translate3d(0,-100%,0)
      &.fold-enter,&.fold-leave-to
        opacity: 0
        transform: translate3d(0,0,0)*/
      .list-header
        height: 40px
        line-height: 40px
        padding: 0 18px
        background: #f3f5f7
        border-bottom: 1px solid rgba(7,17,27,0.1)
        .title
          float: left
          font-size: 14px
          color: rgb(7,17,27)
        .empty
          float: right
          font-size: 12px
          color: rgb(0,160,220)


      .list-content
        max-height: 217px
        padding: 0 18px
        overflow: hidden
        background: #fff
        .foot
          position: relative
          padding: 12px 0
          box-sizing: border-box
          border-1px(rgba(7,17,27,0.1))
          .name
            line-height: 24px
            font-size: 14px
            color: rgb(7,17,27)
          .price
            position: absolute
            right: 90px
            bottom: 12px
            line-height: 24px
            font-size: 14px
            font-weight: 700
            color: rgb(240,20,20)
          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 16px




  .list-mask
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100%
    z-index: 40
    background: rgba(7,17,27,0.6)
  /*.inner
    transform translate3d(300px, 0, 0)
    &.drop-enter-to
      transform translate3d(0, 0, 0)
  .inner
      transform translate3d(0, 0, 0)
  .inner
      transform translate3d(0, 0, 0)
  .inner
      transform translate3d(300px, -400px, 0)
      transform translate3d(300px, 0, 0)*/
</style>
