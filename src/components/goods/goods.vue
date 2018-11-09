<template>
  <div class="goods">
    <div class="menuWrapper" ref="menuWrapper">
        <ul class="menuContent">
          <li v-for="(item,index) of goods" class="menu-item" :class="{'current': currentIndex === index}" @click="selectMenu(index,$event)">
          <span class="text border-1px">
            <span class="icon" v-show="item.type>0" :class="classMap[item.type]"></span>
            {{item.name}}
          </span>
          </li>
        </ul>
    </div>
    <div class="foods-wrapper" ref="foodsWrapper">
      <ul>
        <li v-for="item of goods" class="food-list food-list-hook">
          <h1 class="title">{{item.name}}</h1>
          <ul>
            <li @click="selectFood(food,$event)" v-for="food of item.foods" class="food-item border-1px">
              <div class="icon">
                <img width="57" height="57" :src="food.icon">
              </div>
              <div class="content">
                <h2 class="name">{{food.name}}</h2>
                <p class="desc">{{food.description}}</p>
                <div class="extra">
                  <span class="count">月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
                </div>
                <div class="price">
                  <span class="now">¥{{food.price}}</span><span class="old" v-show="food.oldPrice">¥{{food.oldPrice}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cartcontrol  :food="food" >
                    <!--@cartadd="cartAdd"-->
                  </cartcontrol>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <shopcart ref="shopcart" :select-foods="selectFoods" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice"></shopcart>
    <food @add="addFood" :food="selectedFood" ref="food"></food>
  </div>
</template>

<style  lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin.styl"
  .goods
    display: flex
    position: absolute
    top: 174px
    width: 100%
    bottom: 46px
    overflow: hidden
    .menuWrapper
      flex: 0 0 80px
      width: 80px
      background-color: #f3f5f7
      .menu-item
        display: table /*垂直居中最好的一个布局*/
        width: 56px
        height: 54px
        line-height: 14px
        padding: 0 12px
        &.current
          position: relative
          z-index: 10
          font-weight: 700
          margin-top: -1px
          background: #fff
          .text
            border-none()
        .icon
          display: inline-block
          vertical-align: top
          width: 12px
          height: 12px
          margin-right: 2px
          background-size: 12px 12px
          background-repeat: no-repeat
          &.decrease
            bg-image('decrease_3')
          &.discount
            bg-image('discount_3')
          &.guarantee
            bg-image('guarantee_3')
          &.invoice
            bg-image('invoice_3')
          &.special
            bg-image('special_3')
        .text
          display: table-cell
          width: 56px
          vertical-align: middle
          border-1px(rgba(7,17,27,0.1))
          font-size: 12px
    .foods-wrapper
      flex: 1
      .title
        height: 26px
        line-height: 26px
        padding-left: 14px
        border-left: 2px solid #d9dde1
        font-size: 12px
        color: rgb(147,153,159)
        background: #f3f5f7
      .food-item
        display: flex
        margin: 18px
        padding-bottom: 18px
        border-1px(rgba(7,17,27,0.1))
        &:last-child
          border-none()
          padding-bottom: 0
        .icon
          flex: 0 0 57px
          margin-right: 10px
        .content
          flex: 1
          .name
            margin: 2px 0 8px 0
            font-size: 14px
            color: rgb(7,17,27)
            line-height: 14px
          .desc,.extra
            font-size: 10px
            line-height: 10px
            color: rgb(147,153,159)
          .desc
            line-height: 12px
            margin-bottom: 8px
          .extra
            .count
              margin-right: 12px
          .price
            font-size: 10px
            font-weight: 700
            line-height: 24px
            .now
              color: rgb(240,20,20)
              margin-right: 8px
            .old
              font-size: 10px
              color: rgb(147,153,159)
              text-decoration: line-through


          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 12px



</style>

<script>
  import BScroll from 'better-scroll'
  import shopcart from 'components/shopcart/shopcart.vue'
  import cartcontrol from 'components/cartcontrol/cartcontrol.vue'
  import food from 'components/food/food.vue'
  const ERR_OK = 0;
    export default {
      props:{
        seller:{
          type: Object
        }
      },
      data () {
        return {
          goods: [],
          listHeight: [],
          scrollY: 0,
          selectedFood: {}
        }
      },
      components: {
        shopcart,
        cartcontrol,
        food
      },
      created () {
        this.classMap = ['decrease','discount','special','invoice','guarantee'];

        this.$http.get('/api/goods').then((response) => {
          response = response.body;
          if(response.errno === ERR_OK){
            this.goods = response.data;
            this.$nextTick(() => {
              this._initScroll();
              this._calculateHeight();
            })
          }else {

          }
        })
      },
      computed: {
        cartAdd(el) {
          this.$nextTick(()=> {
            this.$refs.shopcart.drop(el)
          })
        },
        currentIndex () {
          for(let i=0; i<this.listHeight.length; i++) {
            let height1 = this.listHeight[i];
            let height2 = this.listHeight[i+1];
            if (!height2 || this.scrollY >= height1 && this.scrollY < height2) {
              return i;
            }
          }
          return 0;
        },
        selectFoods () {
          let foods = [];
          this.goods.forEach((good) => {
            good.foods.forEach((food) => {
              if(food.count) {
                foods.push(food)
              }
            })
          })
          return foods;
        }
      },
      methods: {
        addFood(target) {
          this._drop(target);
        },
        selectMenu (index, event) {
          if (!event._constructed) { // 若是在pc端执行，会出现两次点击。自定义中event._constructed为true
              return ;
          }
          let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
          let el = foodList[index];
          this.foodsScroll.scrollToElement(el,300);
        },
        selectFood(food,event) {
          if (!event._constructed) { // 若是在pc端执行，会出现两次点击。自定义中event._constructed为true
            return ;
          }
          this.selectedFood = food;
          this.$refs.food.show();
        },
        _initScroll () {
          this.menuScroll = new BScroll(this.$refs.menuWrapper,{
            click: true
          })
          this.foodsScroll = new BScroll(this.$refs.foodsWrapper,{
            probeType: 3,// 在滚动时，能实时告诉滚动位置
            click: true
          })

          this.foodsScroll.on('scroll', (pos) => {
            this.scrollY = Math.abs(Math.round(pos.y));
          })
        },
        _calculateHeight () {
          let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
          let height = 0;
          this.listHeight.push(height);
          for(let i=0; i<foodList.length; i++) {
            let item = foodList[i];
            height += item.clientHeight;
            this.listHeight.push(height);
          }
        },
        _drop(target) {
          // 体验优化，异步执行下落动画
          this.$nextTick(() => {
            this.$refs.shopcart.drop(target)
          })
        }
      }
    }
</script>
