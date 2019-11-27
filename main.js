let eventBus = new Vue();

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <div class="product">
    <div class="product-image">
        <img :src="image" :alt="altText">
    </div>
    <div class="product-info">
        <h1>{{ title }} </h1>
        <p>Shipping: {{ shipping }}</p>
        <p>{{ desc }}</p>
        <a :href="link">link</a>

        <div class="section stock">
            <p v-if="inStock > 10">In Stock</p>
            <p v-else-if="inStock <= 10 && inStock > 0">Almost sold out !</p>
            <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
            <p>{{ sale }}</p>
        </div>

        <div class="section detail">
            <h2>Detail</h2>
            <product-details :details="details"></product-details>
        </div>

        <div class="section size">
            <h2>Size</h2>
            <ul>
                <li v-for="size in sizes">{{size}}</li>
            </ul>
        </div>

        <div class="section variants">
            <h2>Colors</h2>
            <div 
                class="color-box" 
                v-for="(variant, index) in variants" 
                :key="variant.variantId"
                :style="{ backgroundColor: variant.variantColor }"
                @mouseover="updateProduct(index)"
            >
            </div>
        </div>

        <div class="cart">
            <button 
                @click="addToCart" 
                :disabled="!inStock"
                :class="{ disabledButton: !inStock }" 
            >Add to Cart</button>

            <button 
                @click="removeFromCart"
            >Remove items</button>
        </div>
    </div>

    

    <product-tabs :reviews="reviews"></product-tabs>
    
    
</div>
    `,
    data() {
        return {
            product: "Socks",
            brand: "Vue Mastery",
            desc: "fuzzy socks",
            altText: "A pair of socks",
            link: "https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg",
            details: [
                "80% Cotton",
                "20% Polyester",
                "Gender Neutral"
            ],
            selectedVariant: 0,
            variants: [
                {
                    variantId: 2234,
                    variantColor: "green",
                    variantImage: "./assets/img/vmSocks-green.jpg",
                    variantQuantity: 11
                },
                {
                    variantId: 2235,
                    variantColor: "blue",
                    variantImage: "./assets/img/vmSocks-blue.jpg",
                    variantQuantity: 0
                }
            ],
            onSale: false,
            sizes: ["S", "M", "XL"],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        removeFromCart: function () {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index) {
            this.selectedVariant = index
            console.log(index)
        },
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' ' + 'are on Sale !'
            }
            return this.brand + ' ' + this.product + ' ' + 'are not on Sale'
        },
        shipping() {
            if (this.premium) {
                return "Free"
            } else {
                return 2.99
            }
        }
    }
})

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <ul>
            <li v-for="detail in details">
                {{ detail }}
            </li>
        </ul>
    `,
})

Vue.component("product-review", {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            <p>
                <label for="name">Name :</label>
                <input id="name" v-model="name" placeholder="name">
            </p>

            <p>
                <label for="review">Review :</label>
                <textarea id="review" v-model="review"></textarea>
            </p>

            <p>
                <label for="rating">Rating :</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>

            <p>Would you recommend this product</p>
            <label>
                Yes
                <input type="radio" value="Yes" v-model="recommend"  />
            </label>
            <label>
                No
                <input type="radio" value="No" v-model="recommend"  />
            </label>

            <p>
                <input type="submit" value="Submit">
            </p>

           

            <p v-if="errors.length">
                <b>Please correct the following errors:</b>
                    <ul>
                        <li v-for="error in errors">{{ error }}</li>
                    </ul>
            </p>

        </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if (!this.name) this.errors.push("name required");
                if (!this.review) this.errors.push("review required");
                if (!this.rating) this.errors.push("rating required");
                if (!this.recommend) this.errors.push("recommend required");
            }
        }
    }
})

Vue.component("product-tabs", {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },
    template: `
    <div>
        <div>
            <span
                :class="{activeTab: selectedTab === tab}"
                v-for="(tab, index) in tabs" 
                @click="selectedTab = tab"
            >
                {{ tab }}
            </span>
        </div>

        

        <div class="reviews" v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews Yet</p>
                <ul>
                    <li v-for="review in reviews">
                        <p>{{ review.name }}</p>
                        <p>Rating: {{ review.rating }}</p>
                        <p>Review: {{ review.review }}</p>
                        <p>Recommend: {{ review.recommend }}</p>
                    </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a review'">
            <product-review></product-review>
        </div>

    </div>
        
    `,
    data() {
        return {
            tabs: ["Reviews", "Make a review"],
            selectedTab: "Reviews"
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        },
        removeItem(id) {
            for (let i = this.cart.length - 1; i >= 0; i--) {
                if (this.cart[i] === id) {
                    this.cart.splice(i, 1);
                }
            }
        }
    }
})



